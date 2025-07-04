import logging
from fastapi import APIRouter, Query, HTTPException, WebSocket, WebSocketDisconnect, Path
from datetime import datetime
from typing import List

from .. import schemas
from ..schemas import Symbol
from ..services import historical_service, session_service
from ..services.symbol_service import symbol_service
from ..websocket_manager import connection_manager

logger = logging.getLogger(__name__)
router = APIRouter()

from ..logging.logging_service import log_summary

# --- NEW: Endpoint to get available symbols ---
@router.get("/symbols", response_model=List[Symbol], tags=["Utilities"])
async def get_available_symbols():
    """Returns a list of available trading symbols from Redis cache."""
    symbols = symbol_service.get_available_symbols()
    log_summary(f"Returning {len(symbols)} symbols")
    return symbols

# --- FAKE /historical/ Endpoints ---

@router.get("/historical/", response_model=schemas.HistoricalDataResponse, tags=["Fake Legacy Routes"])
async def fetch_initial_historical_data_fake(
    session_token: str = Query(...,), exchange: str = Query(...,), token: str = Query(...,),
    interval: schemas.Interval = Query(...,), start_time: datetime = Query(...,),
    end_time: datetime = Query(...,), timezone: str = Query("UTC",),
):
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="start_time must be earlier than end_time")
    
    data = historical_service.get_historical_data(
        session_token=session_token, exchange=exchange, token=token, interval_val=interval.value,
        start_time=start_time, end_time=end_time, timezone=timezone, data_type=schemas.DataType.REGULAR
    )
    log_summary(f"Returning historical data for {token}")
    return data

@router.get("/historical/chunk", response_model=schemas.HistoricalDataChunkResponse, tags=["Fake Legacy Routes"])
async def fetch_historical_data_chunk_fake(
    request_id: str = Query(...,), offset: int = Query(..., ge=0), limit: int = Query(5000, ge=1, le=10000),
):
    data = historical_service.get_historical_chunk(
        request_id=request_id, offset=offset, limit=limit, data_type=schemas.DataType.REGULAR
    )
    log_summary(f"Returning historical data chunk for request_id {request_id}")
    return data

# --- FAKE /heikin-ashi/ Endpoints ---

@router.get("/heikin-ashi/", response_model=schemas.HeikinAshiDataResponse, tags=["Fake Legacy Routes"])
async def fetch_heikin_ashi_data_fake(
    session_token: str = Query(...,), exchange: str = Query(...,), token: str = Query(...,),
    interval: schemas.Interval = Query(...,), start_time: datetime = Query(...,),
    end_time: datetime = Query(...,), timezone: str = Query("UTC",),
):
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="start_time must be earlier than end_time")
        
    data = historical_service.get_historical_data(
        session_token=session_token, exchange=exchange, token=token, interval_val=interval.value,
        start_time=start_time, end_time=end_time, timezone=timezone, data_type=schemas.DataType.HEIKIN_ASHI
    )
    log_summary(f"Returning Heikin Ashi data for {token}")
    return data

@router.get("/heikin-ashi/chunk", response_model=schemas.HeikinAshiDataChunkResponse, tags=["Fake Legacy Routes"])
async def fetch_heikin_ashi_data_chunk_fake(
    request_id: str = Query(...,), offset: int = Query(..., ge=0), limit: int = Query(5000, ge=1, le=10000),
):
    data = historical_service.get_historical_chunk(
        request_id=request_id, offset=offset, limit=limit, data_type=schemas.DataType.HEIKIN_ASHI
    )
    log_summary(f"Returning Heikin Ashi data chunk for request_id {request_id}")
    return data

# --- FAKE /tick/ Endpoints ---

@router.get("/tick/", response_model=schemas.TickDataResponse, tags=["Fake Legacy Routes"])
async def fetch_initial_tick_data_fake(
    session_token: str = Query(...,), exchange: str = Query(...,), token: str = Query(...,),
    interval: schemas.Interval = Query(...,), start_time: datetime = Query(...,),
    end_time: datetime = Query(...,), timezone: str = Query("UTC",),
):
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="start_time must be earlier than end_time")
    if "tick" not in interval.value:
        raise HTTPException(status_code=400, detail="This endpoint only supports tick-based intervals.")
        
    data = historical_service.get_historical_data(
        session_token=session_token, exchange=exchange, token=token, interval_val=interval.value,
        start_time=start_time, end_time=end_time, timezone=timezone, data_type=schemas.DataType.TICK
    )
    log_summary(f"Returning tick data for {token}")
    return data

@router.get("/tick/chunk", response_model=schemas.TickDataChunkResponse, tags=["Fake Legacy Routes"])
async def fetch_tick_data_chunk_fake(
    request_id: str = Query(...,), limit: int = Query(5000, ge=1, le=10000),
):
    data = historical_service.get_historical_chunk(
        request_id=request_id, offset=None, limit=limit, data_type=schemas.DataType.TICK
    )
    log_summary(f"Returning tick data chunk for request_id {request_id}")
    return data

# --- FAKE /utils/session/ Endpoints ---

@router.get("/utils/session/initiate", response_model=schemas.SessionInfo, tags=["Fake Legacy Routes"])
async def initiate_session_fake():
    return await session_service.initiate_session()

@router.post("/utils/session/heartbeat", response_model=dict, tags=["Fake Legacy Routes"])
async def session_heartbeat_fake(session: schemas.SessionInfo):
    return await session_service.process_heartbeat(session)
# --- WebSocket Handlers ---

async def websocket_handler(websocket: WebSocket, symbol: str, interval: str, timezone: str, data_type: schemas.DataType):
    """Generic handler for all live data websockets, now robust against client-side race conditions."""
    await websocket.accept()
    connection_successful = False
    try:
        # The add_connection function now returns a status.
        connection_successful = await connection_manager.add_connection(websocket, symbol, interval, timezone, data_type)
        
        # --- THE DEFINITIVE FIX ---
        # Only proceed to the listening loop if the connection was successfully established.
        # If not, the client has already disconnected, and we should just let the `finally` block clean up.
        if connection_successful:
            while True:
                # This loop keeps the connection alive on the server-side.
                # The `receive_text` call will raise a WebSocketDisconnect when the client closes the connection normally.
                await websocket.receive_text()
                
    except WebSocketDisconnect:
        # This is the normal path for a client closing the connection.
        logger.info(f"Client disconnected gracefully: {symbol}/{interval}/{data_type.value}")
    except Exception as e:
        # This will catch any other unexpected errors in the handler.
        logger.error(f"Error in websocket handler for {symbol}: {e}", exc_info=True)
    finally:
        # This cleanup runs regardless of how the connection was closed.
        await connection_manager.remove_connection(websocket)
        logger.info(f"Cleaned up connection for: {symbol}/{interval}/{data_type.value}")

@router.websocket("/ws/live/{symbol}/{interval}/{timezone:path}", name="Live Regular/Tick Data")
async def get_live_data_fake(
    websocket: WebSocket, symbol: str = Path(...), interval: str = Path(...), timezone: str = Path(...)
):
    data_type = schemas.DataType.TICK if 'tick' in interval else schemas.DataType.REGULAR
    await websocket_handler(websocket, symbol, interval, timezone, data_type)

@router.websocket("/ws-ha/live/{symbol}/{interval}/{timezone:path}", name="Live Heikin Ashi Data")
async def get_live_heikin_ashi_data_fake(
    websocket: WebSocket, symbol: str = Path(...), interval: str = Path(...), timezone: str = Path(...)
):
    await websocket_handler(websocket, symbol, interval, timezone, schemas.DataType.HEIKIN_ASHI)

