from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from models.energy_data import EnergySourceType

# Base classes
class EnergyConsumptionBase(BaseModel):
    timestamp: datetime
    value_kwh: float
    source_type: EnergySourceType

class EnergyGenerationBase(BaseModel):
    timestamp: datetime
    value_kwh: float
    source_type: EnergySourceType
    efficiency: Optional[float] = Field(None, ge=0, le=100)

# Create schemas
class EnergyConsumptionCreate(EnergyConsumptionBase):
    user_id: Optional[int] = None

class EnergyGenerationCreate(EnergyGenerationBase):
    pass

# Update schemas
class EnergyConsumptionUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    value_kwh: Optional[float] = None
    source_type: Optional[EnergySourceType] = None

class EnergyGenerationUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    value_kwh: Optional[float] = None
    source_type: Optional[EnergySourceType] = None
    efficiency: Optional[float] = Field(None, ge=0, le=100)

# DB schemas
class EnergyConsumptionInDB(EnergyConsumptionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EnergyGenerationInDB(EnergyGenerationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Response schemas
class EnergyConsumption(EnergyConsumptionInDB):
    pass

class EnergyGeneration(EnergyGenerationInDB):
    pass

# Filter schemas
class EnergyConsumptionFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    source_type: Optional[List[EnergySourceType]] = None

class EnergyGenerationFilter(EnergyConsumptionFilter):
    pass

# Summary schemas
class EnergySummary(BaseModel):
    total_consumption: float
    total_generation: float
    renewable_percentage: float
    start_date: datetime
    end_date: datetime