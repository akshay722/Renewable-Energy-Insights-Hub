from sqlalchemy import Column, Float, DateTime, ForeignKey, Enum, String, Text
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

class Project(BaseModel):
    __tablename__ = "projects"
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    consumption_data = relationship("EnergyConsumption", back_populates="project")
    generation_data = relationship("EnergyGeneration", back_populates="project")

class EnergyConsumption(BaseModel):
    __tablename__ = "energy_consumption"

    project_id = Column(ForeignKey("projects.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    value_kwh = Column(Float, nullable=False)
    source_type = Column(Enum(EnergySourceType), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="consumption_data")

class EnergyGeneration(BaseModel):
    __tablename__ = "energy_generation"

    project_id = Column(ForeignKey("projects.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    value_kwh = Column(Float, nullable=False)
    source_type = Column(Enum(EnergySourceType), nullable=False)
    efficiency = Column(Float, nullable=True) 
    
    # Relationships
    project = relationship("Project", back_populates="generation_data")