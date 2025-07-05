import logging
import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

# --- Middleware Imports ---
from .middleware.security_headers import SecurityHeadersMiddleware
from .middleware.rate_limiting import RateLimitMiddleware 

# --- NEW: Import the single unified router ---
from .routers import unified_data_router, regression_router

# --- Connection Manager Lifecycle ---
from .websocket_manager import startup_connection_manager, shutdown_connection_manager

# --- Logging Configuration ---
from .logging.logging_config import setup_logging
setup_logging()

# --- FastAPI Application Initialization ---
app = FastAPI(
    title="Trading Platform API",
    description="Backend API for historical data, live data feeds, and strategy execution.",
    version="2.0.0", # Version bump
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- Static File Serving ---
script_dir = os.path.dirname(__file__)
frontend_dir = os.path.join(os.path.dirname(script_dir), "frontend")

app.mount("/src", StaticFiles(directory=os.path.join(frontend_dir, "src")), name="src")
app.mount("/static", StaticFiles(directory=os.path.join(frontend_dir,"public", "static")), name="static")
app.mount("/dist", StaticFiles(directory=os.path.join(frontend_dir, "dist")), name="dist")

# --- Middleware Configuration ---
from .logging.logging_service import log_request, log_response

@app.middleware("http")
async def logging_middleware(request, call_next):
    log_request(request)
    response = await call_next(request)
    log_response(response)
    return response

app.add_middleware(SecurityHeadersMiddleware)
# app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:8080"], # Add other origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Application Lifecycle Events ---
@app.on_event("startup")
async def startup_event():
    logging.info("Application starting up...")
    await startup_connection_manager()
    # NEW: Load symbols from Redis
    from .services.symbol_service import symbol_service
    await symbol_service.load_symbols_from_redis()
    await symbol_service.subscribe_to_symbol_updates()
    logging.info("WebSocket connection manager started. Application startup complete.")

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Application shutting down...")
    await shutdown_connection_manager()
    from .services.symbol_service import symbol_service
    await symbol_service._stop_subscription()
    from .cache import redis_client
    await redis_client.close()
    logging.info("WebSocket connection manager stopped. Application shutdown complete.")

# --- NEW: Include the single unified router ---
app.include_router(unified_data_router.router)
app.include_router(regression_router.router)

# --- Root Endpoint ---
@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def root():
    """Serves the main index.html file."""
    index_path = os.path.join(frontend_dir, "public","index.html")
    if os.path.exists(index_path):
        with open(index_path, "r") as f:
            return HTMLResponse(content=f.read())
    raise HTTPException(status_code=404, detail="index.html not found")

# --- Health Check Endpoint ---
@app.get("/health/websocket", tags=["Health"])
async def websocket_health():
    """Provides metrics for the WebSocket connection manager."""
    from .websocket_manager import connection_manager
    return {"status": "healthy", "metrics": connection_manager.get_metrics()}