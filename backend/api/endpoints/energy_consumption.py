from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import logging

from api.deps import get_db, get_current_active_user, get_optional_current_user, get_demo_user
from models.user import User
from models.energy_data import EnergyConsumption, EnergySourceType
from schemas.energy import (
    EnergyConsumption as EnergyConsumptionSchema,
    EnergyConsumptionCreate,
    EnergyConsumptionUpdate,
    EnergyConsumptionFilter,
)

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=EnergyConsumptionSchema)
def create_energy_consumption(
    *,
    db: Session = Depends(get_db),
    data_in: EnergyConsumptionCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Create new energy consumption record
    """
    data = EnergyConsumption(
        user_id=current_user.id,
        timestamp=data_in.timestamp,
        value_kwh=data_in.value_kwh,
        source_type=data_in.source_type,
    )
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/", response_model=List[EnergyConsumptionSchema])
def read_energy_consumption(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 1000,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Retrieve energy consumption records with optional authentication
    If user is not authenticated, returns demo data
    """
    try:
        # If no authenticated user, use demo user
        user_id = current_user.id if current_user else get_demo_user(db).id
        
        query = db.query(EnergyConsumption).filter(EnergyConsumption.user_id == user_id)
        
        if start_date:
            query = query.filter(EnergyConsumption.timestamp >= start_date)
        
        if end_date:
            query = query.filter(EnergyConsumption.timestamp <= end_date)
        
        if source_type:
            query = query.filter(EnergyConsumption.source_type.in_(source_type))
        
        return query.order_by(EnergyConsumption.timestamp).offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error reading energy consumption: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading energy consumption: {str(e)}"
        )

@router.get("/{consumption_id}", response_model=EnergyConsumptionSchema)
def read_energy_consumption_by_id(
    consumption_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific energy consumption record by id
    """
    consumption = db.query(EnergyConsumption).filter(
        EnergyConsumption.id == consumption_id,
        EnergyConsumption.user_id == current_user.id
    ).first()
    
    if not consumption:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Energy consumption record not found",
        )
    
    return consumption

@router.put("/{consumption_id}", response_model=EnergyConsumptionSchema)
def update_energy_consumption(
    *,
    consumption_id: int,
    db: Session = Depends(get_db),
    data_in: EnergyConsumptionUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a energy consumption record
    """
    consumption = db.query(EnergyConsumption).filter(
        EnergyConsumption.id == consumption_id,
        EnergyConsumption.user_id == current_user.id
    ).first()
    
    if not consumption:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Energy consumption record not found",
        )
    
    update_data = data_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(consumption, field, value)
    
    db.add(consumption)
    db.commit()
    db.refresh(consumption)
    return consumption

@router.delete("/{consumption_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_energy_consumption(
    *,
    consumption_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete a energy consumption record
    """
    consumption = db.query(EnergyConsumption).filter(
        EnergyConsumption.id == consumption_id,
        EnergyConsumption.user_id == current_user.id
    ).first()
    
    if not consumption:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Energy consumption record not found",
        )
    
    db.delete(consumption)
    db.commit()
    
    return None

@router.post("/batch-create", response_model=List[EnergyConsumptionSchema])
def batch_create_energy_consumption(
    *,
    db: Session = Depends(get_db),
    data_in: List[EnergyConsumptionCreate],
    current_user: User = Depends(get_current_active_user),
):
    """
    Create multiple energy consumption records
    """
    data_objs = []
    for item in data_in:
        data = EnergyConsumption(
            user_id=current_user.id,
            timestamp=item.timestamp,
            value_kwh=item.value_kwh,
            source_type=item.source_type,
        )
        db.add(data)
        data_objs.append(data)
    
    db.commit()
    for data in data_objs:
        db.refresh(data)
    
    return data_objs

@router.get("/aggregate/daily", response_model=dict)
def get_daily_consumption(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Get daily aggregated energy consumption with optional authentication
    If user is not authenticated, returns demo data
    """
    try:
        # If no authenticated user, use demo user
        user_id = current_user.id if current_user else get_demo_user(db).id
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching daily consumption data for user {user_id} from {start_date} to {end_date}")
        
        query = db.query(EnergyConsumption).filter(
            EnergyConsumption.user_id == user_id,
            EnergyConsumption.timestamp >= start_date,
            EnergyConsumption.timestamp <= end_date
        )
        
        if source_type:
            query = query.filter(EnergyConsumption.source_type.in_(source_type))
        
        consumption_data = query.all()
        
        # Convert to pandas DataFrame for easier aggregation
        df = pd.DataFrame([
            {
                "date": item.timestamp.date(),
                "value_kwh": item.value_kwh,
                "source_type": item.source_type.value
            }
            for item in consumption_data
        ])
        
        if df.empty:
            logger.warning(f"No consumption data found for user {user_id}")
            return {"daily_consumption": [], "total_kwh": 0, "by_source": {}}
        
        # Aggregate by date
        daily = df.groupby("date")["value_kwh"].sum().reset_index()
        daily_data = [{"date": row["date"].isoformat(), "value_kwh": float(row["value_kwh"])} for _, row in daily.iterrows()]
        
        # Aggregate by source type
        by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
        by_source = {k: float(v) for k, v in by_source.items()}
        
        total_kwh = float(df["value_kwh"].sum())
        
        logger.info(f"Retrieved {len(daily_data)} days of data, total {total_kwh} kWh")
        
        return {
            "daily_consumption": daily_data,
            "total_kwh": total_kwh,
            "by_source": by_source
        }
    except Exception as e:
        logger.error(f"Error getting daily consumption: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting daily consumption: {str(e)}"
        )

@router.get("/aggregate/weekly", response_model=dict)
def get_weekly_consumption(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Get weekly aggregated energy consumption data.
    If start_date and end_date are not provided, defaults to the last 90 days.
    """
    try:
        # Use demo user if no authenticated user is available
        user_id = current_user.id if current_user else get_demo_user(db).id

        # Default to last 90 days if not provided
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=90)
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching weekly consumption data for user {user_id} from {start_date} to {end_date}")
        
        query = db.query(EnergyConsumption).filter(
            EnergyConsumption.user_id == user_id,
            EnergyConsumption.timestamp >= start_date,
            EnergyConsumption.timestamp <= end_date
        )
        
        if source_type:
            query = query.filter(EnergyConsumption.source_type.in_(source_type))
        
        consumption_data = query.all()
        
        # Convert the records to a pandas DataFrame for easier aggregation
        df = pd.DataFrame([
            {
                "date": item.timestamp.date(),
                "value_kwh": item.value_kwh,
                "source_type": item.source_type.value
            }
            for item in consumption_data
        ])
        
        if df.empty:
            logger.warning(f"No consumption data found for user {user_id}")
            return {"weekly_consumption": [], "total_kwh": 0, "by_source": {}}
        
        # Compute the start of the week (Monday) for each record
        df["week_start"] = df["date"].apply(lambda d: d - timedelta(days=d.weekday()))
        
        # Aggregate energy consumption per week
        weekly = df.groupby("week_start")["value_kwh"].sum().reset_index()
        weekly_data = [
            {"week_start": row["week_start"].isoformat(), "value_kwh": float(row["value_kwh"])}
            for _, row in weekly.iterrows()
        ]
        
        # Aggregate energy consumption by source type across the queried period
        by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
        by_source = {k: float(v) for k, v in by_source.items()}
        
        total_kwh = float(df["value_kwh"].sum())
        
        logger.info(f"Retrieved {len(weekly_data)} weeks of data, total {total_kwh} kWh")
        
        return {
            "weekly_consumption": weekly_data,
            "total_kwh": total_kwh,
            "by_source": by_source
        }
    except Exception as e:
        logger.error(f"Error getting weekly consumption: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting weekly consumption: {str(e)}"
        )
