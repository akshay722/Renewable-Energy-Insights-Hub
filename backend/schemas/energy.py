from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from models.energy_data import EnergySourceType

class EnergyDataBase(BaseModel):
    timestamp: datetime
    value_kwh: float = Field(..., gt=0)
    source_type: EnergySourceType
    location: Optional[str] = None

class EnergyConsumptionCreate(EnergyDataBase):
    user_id: Optional[int] = None

class EnergyConsumptionUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    value_kwh: Optional[float] = Field(None, gt=0)
    source_type: Optional[EnergySourceType] = None
    location: Optional[str] = None

class EnergyGenerationCreate(EnergyDataBase):
    user_id: Optional[int] = None
    efficiency: Optional[float] = Field(None, ge=0, le=100)

class EnergyGenerationUpdate(EnergyConsumptionUpdate):
    efficiency: Optional[float] = Field(None, ge=0, le=100)

class EnergyDataInDBBase(EnergyDataBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EnergyConsumption(EnergyDataInDBBase):
    pass

class EnergyGeneration(EnergyDataInDBBase):
    efficiency: Optional[float] = None

class EnergyConsumptionFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    source_type: Optional[List[EnergySourceType]] = None

class EnergyGenerationFilter(EnergyConsumptionFilter):
    pass

class EnergySummary(BaseModel):
    total_consumption: float
    total_generation: float
    renewable_percentage: float
    start_date: datetime
    end_date: datetime