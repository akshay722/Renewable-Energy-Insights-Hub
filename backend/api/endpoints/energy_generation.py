from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import logging

from api.deps import get_db, get_current_active_user, get_optional_current_user
from models.user import User
from models.energy_data import EnergyGeneration, EnergySourceType

logger = logging.getLogger(__name__)
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
        timestamp=data_in.timestamp,
        value_kwh=data_in.value_kwh,
        source_type=data_in.source_type,
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
    limit: int = 1000,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Retrieve energy generation records
    """
    try:
        query = db.query(EnergyGeneration)
        
        if start_date:
            query = query.filter(EnergyGeneration.timestamp >= start_date)
        
        if end_date:
            query = query.filter(EnergyGeneration.timestamp <= end_date)
        
        if source_type:
            query = query.filter(EnergyGeneration.source_type.in_(source_type))
        
        return query.order_by(EnergyGeneration.timestamp).offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error reading energy generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading energy generation: {str(e)}"
        )

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
        EnergyGeneration.id == generation_id
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
    Update an energy generation record
    """
    generation = db.query(EnergyGeneration).filter(
        EnergyGeneration.id == generation_id
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
    Delete an energy generation record
    """
    generation = db.query(EnergyGeneration).filter(
        EnergyGeneration.id == generation_id
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
            timestamp=item.timestamp,
            value_kwh=item.value_kwh,
            source_type=item.source_type,
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
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Get daily aggregated energy generation data
    """
    try:
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching daily generation data from {start_date} to {end_date}")
        
        query = db.query(EnergyGeneration).filter(
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
            logger.warning("No generation data found")
            return {"daily_generation": [], "total_kwh": 0, "by_source": {}, "avg_efficiency": 0}
        
        # Aggregate by date
        daily = df.groupby("date")["value_kwh"].sum().reset_index()
        daily_data = [{"date": row["date"].isoformat(), "value_kwh": float(row["value_kwh"])} for _, row in daily.iterrows()]
        
        # Aggregate by source type
        by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
        by_source = {k: float(v) for k, v in by_source.items()}
        
        # Calculate average efficiency
        avg_efficiency = float(df["efficiency"].mean()) if "efficiency" in df.columns else 0
        
        total_kwh = float(df["value_kwh"].sum())
        
        logger.info(f"Retrieved {len(daily_data)} days of generation data, total {total_kwh} kWh")
        
        return {
            "daily_generation": daily_data,
            "total_kwh": total_kwh,
            "by_source": by_source,
            "avg_efficiency": avg_efficiency
        }
    except Exception as e:
        logger.error(f"Error getting daily generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting daily generation: {str(e)}"
        )

@router.get("/aggregate/weekly", response_model=dict)
def get_weekly_generation(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Get weekly aggregated energy generation data.
    If start_date and end_date are not provided, defaults to the last 90 days.
    """
    try:
        # Set default date range to last 90 days if not provided
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=90)
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching weekly generation data from {start_date} to {end_date}")
        
        query = db.query(EnergyGeneration).filter(
            EnergyGeneration.timestamp >= start_date,
            EnergyGeneration.timestamp <= end_date
        )
        
        if source_type:
            query = query.filter(EnergyGeneration.source_type.in_(source_type))
        
        generation_data = query.all()
        
        # Convert the records to a DataFrame
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
            logger.warning("No generation data found")
            return {
                "weekly_generation": [],
                "total_kwh": 0,
                "by_source": {},
                "avg_efficiency": 0
            }
        
        # Compute the start of the week (Monday) for each date
        df["week_start"] = df["date"].apply(lambda d: d - timedelta(days=d.weekday()))
        
        # Aggregate by week: sum energy generation per week
        weekly = df.groupby("week_start")["value_kwh"].sum().reset_index()
        weekly_data = [
            {"week_start": row["week_start"].isoformat(), "value_kwh": float(row["value_kwh"])}
            for _, row in weekly.iterrows()
        ]
        
        # Overall aggregation by source type across the queried period
        by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
        by_source = {k: float(v) for k, v in by_source.items()}
        
        # Total kWh and average efficiency for the period
        total_kwh = float(df["value_kwh"].sum())
        avg_efficiency = float(df["efficiency"].mean()) if "efficiency" in df.columns else 0
        
        logger.info(f"Retrieved {len(weekly_data)} weeks of data, total {total_kwh} kWh")
        
        return {
            "weekly_generation": weekly_data,
            "total_kwh": total_kwh,
            "by_source": by_source,
            "avg_efficiency": avg_efficiency
        }
    except Exception as e:
        logger.error(f"Error getting weekly generation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting weekly generation: {str(e)}"
        )
