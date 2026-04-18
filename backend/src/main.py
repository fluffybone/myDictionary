from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import src.models
from fastapi.exceptions import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from src.routers import main_router

app = FastAPI()

app.include_router(main_router)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://147.45.103.144",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
