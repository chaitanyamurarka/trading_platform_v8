import logging
import json
import asyncio
from typing import List, Dict, Any, Optional

from ..cache import redis_client

logger = logging.getLogger(__name__)

REDIS_SYMBOLS_KEY = "dtn:ingestion:symbols"
REDIS_SYMBOL_UPDATES_CHANNEL = "dtn:ingestion:symbol_updates"

class SymbolService:
    def __init__(self):
        self.available_symbols: List[Dict[str, str]] = []
        self.pubsub: Optional[Any] = None
        self.listen_task: Optional[asyncio.Task] = None

    async def load_symbols_from_redis(self):
        """Loads the list of symbols from Redis into memory."""
        try:
            symbols_data = await redis_client.get(REDIS_SYMBOLS_KEY)
            if symbols_data:
                self.available_symbols = json.loads(symbols_data)
                logger.info(f"Successfully loaded {len(self.available_symbols)} symbols from Redis.")
            else:
                logger.warning(f"Redis key '{REDIS_SYMBOLS_KEY}' not found or empty. No symbols loaded.")
        except Exception as e:
            logger.error(f"Error loading symbols from Redis: {e}", exc_info=True)
            self.available_symbols = [] # Ensure it's empty on error

    async def subscribe_to_symbol_updates(self):
        """Subscribes to the Redis channel for symbol updates."""
        try:
            self.pubsub = redis_client.pubsub()
            await self.pubsub.subscribe(REDIS_SYMBOL_UPDATES_CHANNEL)
            self.listen_task = asyncio.create_task(self._handle_symbol_messages())
            logger.info(f"Subscribed to Redis channel: {REDIS_SYMBOL_UPDATES_CHANNEL}")
        except Exception as e:
            logger.error(f"Error subscribing to symbol updates channel: {e}", exc_info=True)

    async def _handle_symbol_messages(self):
        """Listens for messages on the symbol updates channel and processes them."""
        if not self.pubsub: return

        logger.info(f"Starting Redis message listener for channel: {REDIS_SYMBOL_UPDATES_CHANNEL}")
        try:
            while True:
                message = await self.pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message['type'] == 'message':
                    message_data = message['data']
                    if message_data == "symbols_updated":
                        logger.info(f"Received 'symbols_updated' message on {REDIS_SYMBOL_UPDATES_CHANNEL}. Reloading all symbols.")
                        await self.load_symbols_from_redis()
                    else:
                        try:
                            # Assuming the message data is a JSON string of a list of new symbols
                            new_symbols = json.loads(message_data)
                            if isinstance(new_symbols, list):
                                # Simple append for now, could add more sophisticated merge logic
                                for new_symbol in new_symbols:
                                    if new_symbol not in self.available_symbols:
                                        self.available_symbols.append(new_symbol)
                                        logger.info(f"Added new symbol: {new_symbol}")
                                logger.info(f"Updated available symbols. Total: {len(self.available_symbols)}")
                            else:
                                logger.warning(f"Received non-list message on {REDIS_SYMBOL_UPDATES_CHANNEL}: {new_symbols}")
                        except json.JSONDecodeError:
                            logger.warning(f"Could not decode JSON from Redis message: {message_data}")
                await asyncio.sleep(0.01) # Yield control
        except asyncio.CancelledError:
            logger.info(f"Redis message listener for {REDIS_SYMBOL_UPDATES_CHANNEL} was cancelled.")
        except Exception as e:
            logger.error(f"FATAL: Redis message listener for {REDIS_SYMBOL_UPDATES_CHANNEL} failed: {e}", exc_info=True)
        finally:
            logger.info(f"STOPPED Redis message listener for channel: {REDIS_SYMBOL_UPDATES_CHANNEL}")

    async def _stop_subscription(self):
        """Stops the Redis pub/sub subscription and cleans up."""
        if self.listen_task:
            self.listen_task.cancel()
            try:
                await self.listen_task # Await cancellation
            except asyncio.CancelledError:
                pass
        if self.pubsub:
            await self.pubsub.unsubscribe(REDIS_SYMBOL_UPDATES_CHANNEL)
            await self.pubsub.close()
            logger.info(f"Unsubscribed from Redis channel: {REDIS_SYMBOL_UPDATES_CHANNEL}")

    def get_available_symbols(self) -> List[Dict[str, str]]:
        """Returns the currently loaded list of available symbols."""
        return self.available_symbols

symbol_service = SymbolService()