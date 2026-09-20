"""AWS Lambda entry point. Mangum wraps the FastAPI app for API Gateway events."""
from mangum import Mangum
from app import app

handler = Mangum(app, lifespan="off")
