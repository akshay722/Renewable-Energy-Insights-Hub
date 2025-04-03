from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd

from api.deps import get_db, get_current_active_user
from models.user import User
from models.energy_data import EnergyGeneration, EnergySourceType
from schemas.energy import (
    EnergyGeneration as EnergyGenerationSchema,
    EnergyGenerationCreate,
    EnergyGenerationUpdate,
    EnergyGenerationFilter,
)

router = APIRouter()

@router.post("/", response_model=EnergyGenerationSchema)
def create_energy_generation(
    *,
    db: Session = Depends(get_db),
    data_in: EnergyGenerationCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Create new energy generation record
    """
    data = EnergyGeneration(
        user_id=current_user.id,
        timestamp=data_in.timestamp,
        value_kwh=data_in.value_kwh,
        source_type=data_in.source_type,
        location=data_in.location,
        efficiency=data_in.efficiency,
    )
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/", response_model=List[EnergyGenerationSchema])
def read_energy_generation(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve energy generation records
    """
    query = db.query(EnergyGeneration).filter(EnergyGeneration.user_id == current_user.id)
    
    if start_date:
        query = query.filter(EnergyGeneration.timestamp >= start_date)
    
    if end_date:
        query = query.filter(EnergyGeneration.timestamp <= end_date)
    
    if source_type:
        query = query.filter(EnergyGeneration.source_type.in_(source_type))
    
    return query.order_by(EnergyGeneration.timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/{generation_id}", response_model=EnergyGenerationSchema)
def read_energy_generation_by_id(
    generation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific energy generation record by id
    """
    generation = db.query(EnergyGeneration).filter(
        EnergyGeneration.id == generation_id,
        EnergyGeneration.user_id == current_user.id
    ).first()
    
    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Energy generation record not found",
        )
    
    return generation

@router.put("/{generation_id}", response_model=EnergyGenerationSchema)
def update_energy_generation(
    *,
    generation_id: int,
    db: Session = Depends(get_db),
    data_in: EnergyGenerationUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a energy generation record
    """
    generation = db.query(EnergyGeneration).filter(
        EnergyGeneration.id == generation_id,
        EnergyGeneration.user_id == current_user.id
    ).first()
    
    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Energy generation record not found",
        )
    
    update_data = data_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(generation, field, value)
    
    db.add(generation)
    db.commit()
    db.refresh(generation)
    return generation

@router.delete("/{generation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_energy_generation(
    *,
    generation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete a energy generation record
    """
    generation = db.query(EnergyGeneration).filter(
        EnergyGeneration.id == generation_id,
        EnergyGeneration.user_id == current_user.id
    ).first()
    
    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Energy generation record not found",
        )
    
    db.delete(generation)
    db.commit()
    
    return None

@router.post("/batch-create", response_model=List[EnergyGenerationSchema])
def batch_create_energy_generation(
    *,
    db: Session = Depends(get_db),
    data_in: List[EnergyGenerationCreate],
    current_user: User = Depends(get_current_active_user),
):
    """
    Create multiple energy generation records
    """
    data_objs = []
    for item in data_in:
        data = EnergyGeneration(
            user_id=current_user.id,
            timestamp=item.timestamp,
            value_kwh=item.value_kwh,
            source_type=item.source_type,
            location=item.location,
            efficiency=item.efficiency,
        )
        db.add(data)
        data_objs.append(data)
    
    db.commit()
    for data in data_objs:
        db.refresh(data)
    
    return data_objs

@router.get("/aggregate/daily", response_model=dict)
def get_daily_generation(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get daily aggregated energy generation
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    if not end_date:
        end_date = datetime.utcnow()
    
    query = db.query(EnergyGeneration).filter(
        EnergyGeneration.user_id == current_user.id,
        EnergyGeneration.timestamp >= start_date,
        EnergyGeneration.timestamp <= end_date
    )
    
    if source_type:
        query = query.filter(EnergyGeneration.source_type.in_(source_type))
    
    generation_data = query.all()
    
    # Convert to pandas DataFrame for easier aggregation
    df = pd.DataFrame([
        {
            "date": item.timestamp.date(),
            "value_kwh": item.value_kwh,
            "source_type": item.source_type.value,
            "efficiency": item.efficiency or 0
        }
        for item in generation_data
    ])
    
    if df.empty:
        return {"daily_generation": [], "total_kwh": 0, "by_source": {}, "avg_efficiency": 0}
    
    # Aggregate by date
    daily = df.groupby("date")["value_kwh"].sum().reset_index()
    daily_data = [{"date": row["date"].isoformat(), "value_kwh": row["value_kwh"]} for _, row in daily.iterrows()]
    
    # Aggregate by source type
    by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
    
    # Calculate average efficiency
    avg_efficiency = df["efficiency"].mean() if "efficiency" in df.columns else 0
    
    return {
        "daily_generation": daily_data,
        "total_kwh": df["value_kwh"].sum(),
        "by_source": by_source,
        "avg_efficiency": avg_efficiency
    }