from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from models.energy_data import EnergySourceType

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class ProjectInDB(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Project(ProjectInDB):
    pass

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
    project_id: int

class EnergyGenerationCreate(EnergyGenerationBase):
    project_id: int

# Update schemas
class EnergyConsumptionUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    value_kwh: Optional[float] = None
    source_type: Optional[EnergySourceType] = None
    project_id: Optional[int] = None

class EnergyGenerationUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    value_kwh: Optional[float] = None
    source_type: Optional[EnergySourceType] = None
    efficiency: Optional[float] = Field(None, ge=0, le=100)
    project_id: Optional[int] = None

# DB schemas
class EnergyConsumptionInDB(EnergyConsumptionBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EnergyGenerationInDB(EnergyGenerationBase):
    id: int
    project_id: int
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
    project_id: Optional[int] = None

class EnergyGenerationFilter(EnergyConsumptionFilter):
    pass

# Summary schemas
class EnergySummary(BaseModel):
    total_consumption: float
    total_generation: float
    renewable_percentage: float
    start_date: datetime
    end_date: datetime
    project_id: Optional[int] = None