from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from models.base import BaseModel

class EnergySourceType(str, enum.Enum):
    SOLAR = "solar"
    WIND = "wind"
    HYDRO = "hydro"
    GEOTHERMAL = "geothermal"
    BIOMASS = "biomass"
    GRID = "grid"  # For non-renewable grid power

class EnergyConsumption(BaseModel):
    __tablename__ = "energy_consumption"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    value_kwh = Column(Float, nullable=False)
    source_type = Column(Enum(EnergySourceType), nullable=False)
    location = Column(String(255), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="energy_data")

class EnergyGeneration(BaseModel):
    __tablename__ = "energy_generation"

    user_id = Column(ForeignKey("users.id"), nullable=False) 
    timestamp = Column(DateTime, nullable=False, index=True)
    value_kwh = Column(Float, nullable=False)
    source_type = Column(Enum(EnergySourceType), nullable=False)
    location = Column(String(255), nullable=True)
    efficiency = Column(Float, nullable=True)  # Efficiency percentage

    # Relationships
    user = relationship("User", back_populates="generation_data")