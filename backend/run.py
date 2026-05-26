import uvicorn
from store.config import settings

if __name__ == "__main__":
    # Start high-performance uvicorn application server pointing to store.app
    uvicorn.run(
        "store.app:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
