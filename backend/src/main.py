from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import src.models
from src.database import engine, Base
from src.routers import main_router

Base.metadata.create_all(bind=engine)

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
