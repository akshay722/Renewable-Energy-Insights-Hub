from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import logging

from api.deps import get_db, get_current_active_user
from models.user import User
from models.energy_data import EnergyConsumption, EnergySourceType, Project
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
    # Verify that the project belongs to the current user
    project = db.query(Project).filter(
        Project.id == data_in.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or does not belong to the user",
        )
    
    data = EnergyConsumption(
        project_id=data_in.project_id,
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
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve energy consumption records for authenticated user
    """
    try:
        user_projects = db.query(Project.id).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        
        if not project_ids:
            return []
        
        # Base query filtering by the user's projects
        query = db.query(EnergyConsumption).filter(EnergyConsumption.project_id.in_(project_ids))
        
        # Apply specific project_id filter if provided
        if project_id:
            if project_id not in project_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found or does not belong to the user",
                )
            query = query.filter(EnergyConsumption.project_id == project_id)
        
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

@router.get("/aggregate/daily", response_model=dict)
def get_daily_consumption(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get daily aggregated energy consumption for authenticated user
    """
    try:
        user_projects = db.query(Project.id).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        
        if not project_ids:
            return {"daily_consumption": [], "total_kwh": 0, "by_source": {}}
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching daily consumption data for user {current_user.id} from {start_date} to {end_date}")
        
        # Base query filtering by the user's projects
        query = db.query(EnergyConsumption).filter(
            EnergyConsumption.project_id.in_(project_ids),
            EnergyConsumption.timestamp >= start_date,
            EnergyConsumption.timestamp <= end_date
        )
        
        # Apply specific project_id filter if provided
        if project_id:
            if project_id not in project_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found or does not belong to the user",
                )
            query = query.filter(EnergyConsumption.project_id == project_id)
        
        if source_type:
            query = query.filter(EnergyConsumption.source_type.in_(source_type))
        
        consumption_data = query.all()
        
        # Convert to pandas DataFrame for easier aggregation
        df = pd.DataFrame([
            {
                "date": item.timestamp.date(),
                "value_kwh": item.value_kwh,
                "source_type": item.source_type.value,
                "project_id": item.project_id
            }
            for item in consumption_data
        ])
        
        if df.empty:
            logger.warning(f"No consumption data found for user {current_user.id}")
            return {"daily_consumption": [], "total_kwh": 0, "by_source": {}, "by_project": {}}
        
        # Aggregate by date
        daily = df.groupby("date")["value_kwh"].sum().reset_index()
        daily_data = [{"date": row["date"].isoformat(), "value_kwh": float(row["value_kwh"])} for _, row in daily.iterrows()]
        
        # Aggregate by source type
        by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
        by_source = {k: float(v) for k, v in by_source.items()}
        
        # Aggregate by project
        by_project = df.groupby("project_id")["value_kwh"].sum().to_dict()
        by_project = {str(k): float(v) for k, v in by_project.items()}
        
        total_kwh = float(df["value_kwh"].sum())
        
        logger.info(f"Retrieved {len(daily_data)} days of data, total {total_kwh} kWh")
        
        return {
            "daily_consumption": daily_data,
            "total_kwh": total_kwh,
            "by_source": by_source,
            "by_project": by_project
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
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get weekly aggregated energy consumption data for authenticated user.
    If start_date and end_date are not provided, defaults to the last 90 days.
    """
    try:
        # Get user's projects
        user_projects = db.query(Project.id).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        
        if not project_ids:
            return {"weekly_consumption": [], "total_kwh": 0, "by_source": {}}
        
        # Default to last 90 days if not provided
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=90)
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching weekly consumption data for user {current_user.id} from {start_date} to {end_date}")
        
        # Base query filtering by the user's projects
        query = db.query(EnergyConsumption).filter(
            EnergyConsumption.project_id.in_(project_ids),
            EnergyConsumption.timestamp >= start_date,
            EnergyConsumption.timestamp <= end_date
        )
        
        # Apply specific project_id filter if provided
        if project_id:
            if project_id not in project_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found or does not belong to the user",
                )
            query = query.filter(EnergyConsumption.project_id == project_id)
        
        if source_type:
            query = query.filter(EnergyConsumption.source_type.in_(source_type))
        
        consumption_data = query.all()
        
        # Convert the records to a pandas DataFrame for easier aggregation
        df = pd.DataFrame([
            {
                "date": item.timestamp.date(),
                "value_kwh": item.value_kwh,
                "source_type": item.source_type.value,
                "project_id": item.project_id
            }
            for item in consumption_data
        ])
        
        if df.empty:
            logger.warning(f"No consumption data found for user {current_user.id}")
            return {"weekly_consumption": [], "total_kwh": 0, "by_source": {}, "by_project": {}}
        
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
        
        # Aggregate by project
        by_project = df.groupby("project_id")["value_kwh"].sum().to_dict()
        by_project = {str(k): float(v) for k, v in by_project.items()}
        
        total_kwh = float(df["value_kwh"].sum())
        
        logger.info(f"Retrieved {len(weekly_data)} weeks of data, total {total_kwh} kWh")
        
        return {
            "weekly_consumption": weekly_data,
            "total_kwh": total_kwh,
            "by_source": by_source,
            "by_project": by_project
        }
    except Exception as e:
        logger.error(f"Error getting weekly consumption: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting weekly consumption: {str(e)}"
        )
