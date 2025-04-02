from fastapi import APIRouter

from api.endpoints import auth, users, energy_consumption, energy_generation, insights, data_sample

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(energy_consumption.router, prefix="/energy/consumption", tags=["energy consumption"])
api_router.include_router(energy_generation.router, prefix="/energy/generation", tags=["energy generation"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(data_sample.router, prefix="/data-sample", tags=["data sample"])