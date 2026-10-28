import logging
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_router
from app.config import settings
from app.utils.errors import GhostwriterError

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ghostwriter.app")

app = FastAPI(
    title="Ghostwriter AI — Interactive Horror Story Engine",
    description="Interactive horror storytelling backend powered by Google's Gemma model via Gemini API.",
    version="1.0.0",
)

# Configure CORS for configured frontend origin (No wildcard with credentials)
origins = list(
    {
        settings.frontend_origin.rstrip("/"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(GhostwriterError)
async def ghostwriter_error_handler(request: Request, exc: GhostwriterError):
    logger.warning(f"Domain error [{exc.status_code}] on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "status": exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    logger.info(f"Validation error on {request.url.path}: {exc.errors()}")
    # Format readable error message
    first_error = exc.errors()[0] if exc.errors() else {}
    msg = first_error.get("msg", "Invalid request parameters.")
    loc = " -> ".join([str(x) for x in first_error.get("loc", []) if x != "body"])
    detail_msg = f"{loc}: {msg}" if loc else msg

    return JSONResponse(
        status_code=422,
        content={"detail": detail_msg, "errors": jsonable_encoder(exc.errors())},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred while weaving the darkness."},
    )


# Mount API endpoints under /api
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    return {
        "service": "Ghostwriter AI Backend",
        "tagline": "Every Choice Leaves a Scar",
        "model": settings.gemma_model_id,
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }
