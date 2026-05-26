from store.routers.v1.customers import router as customers_router
from store.routers.v1.orders import router as orders_router
from store.routers.v1.payments import router as payments_router

__all__ = ["customers_router", "orders_router", "payments_router"]
