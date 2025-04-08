from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import logging

from api.deps import get_db, get_current_active_user
from models.user import User
from models.energy_data import EnergyGeneration, EnergySourceType, Project

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
    
    data = EnergyGeneration(
        project_id=data_in.project_id,
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
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve energy generation records
    """
    try:
        # Get the user's projects
        user_id = current_user.id if current_user else None
        
        if user_id:
            # Get projects for the authenticated user
            user_projects = db.query(Project.id).filter(Project.user_id == user_id).all()
            project_ids = [p.id for p in user_projects]
            
            if not project_ids:
                return []
                
            # Base query filtering by the user's projects
            query = db.query(EnergyGeneration).filter(EnergyGeneration.project_id.in_(project_ids))
            
            # Apply specific project_id filter if provided
            if project_id:
                if project_id not in project_ids:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Project not found or does not belong to the user",
                    )
                query = query.filter(EnergyGeneration.project_id == project_id)
        else:
            # For non-authenticated users, don't filter by project
            query = db.query(EnergyGeneration)
            
            # But still apply specific project filter if provided
            if project_id:
                query = query.filter(EnergyGeneration.project_id == project_id)
        
        # Apply date filters
        if start_date:
            query = query.filter(EnergyGeneration.timestamp >= start_date)
        
        if end_date:
            query = query.filter(EnergyGeneration.timestamp <= end_date)
        
        # Apply source type filter
        if source_type:
            query = query.filter(EnergyGeneration.source_type.in_(source_type))
        
        return query.order_by(EnergyGeneration.timestamp).offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error reading energy generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading energy generation: {str(e)}"
        )

@router.get("/aggregate/daily", response_model=dict)
def get_daily_generation(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source_type: Optional[List[EnergySourceType]] = Query(None),
    project_id: Optional[int] = None,
    current_user:  User = Depends(get_current_active_user),
):
    """
    Get daily aggregated energy generation data
    """
    try:
        # Get the user's projects if authenticated
        user_id = current_user.id if current_user else None
        
        # Default date range
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
            
        logger.info(f"Fetching daily generation data from {start_date} to {end_date}")
        
        if user_id:
            # Get projects for the authenticated user
            user_projects = db.query(Project.id).filter(Project.user_id == user_id).all()
            project_ids = [p.id for p in user_projects]
            
            if not project_ids:
                return {"daily_generation": [], "total_kwh": 0, "by_source": {}, "avg_efficiency": 0, "by_project": {}}
                
            # Base query filtering by the user's projects
            query = db.query(EnergyGeneration).filter(
                EnergyGeneration.project_id.in_(project_ids),
                EnergyGeneration.timestamp >= start_date,
                EnergyGeneration.timestamp <= end_date
            )
            
            # Apply specific project_id filter if provided
            if project_id:
                if project_id not in project_ids:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Project not found or does not belong to the user",
                    )
                query = query.filter(EnergyGeneration.project_id == project_id)
        else:
            # For non-authenticated users, don't filter by project
            query = db.query(EnergyGeneration).filter(
                EnergyGeneration.timestamp >= start_date,
                EnergyGeneration.timestamp <= end_date
            )
            
            # But still apply specific project filter if provided
            if project_id:
                query = query.filter(EnergyGeneration.project_id == project_id)
        
        # Apply source type filter
        if source_type:
            query = query.filter(EnergyGeneration.source_type.in_(source_type))
        
        generation_data = query.all()
        
        # Convert to pandas DataFrame for easier aggregation
        df = pd.DataFrame([
            {
                "date": item.timestamp.date(),
                "value_kwh": item.value_kwh,
                "source_type": item.source_type.value,
                "efficiency": item.efficiency or 0,
                "project_id": item.project_id
            }
            for item in generation_data
        ])
        
        if df.empty:
            logger.warning("No generation data found")
            return {"daily_generation": [], "total_kwh": 0, "by_source": {}, "avg_efficiency": 0, "by_project": {}}
        
        # Aggregate by date
        daily = df.groupby("date")["value_kwh"].sum().reset_index()
        daily_data = [{"date": row["date"].isoformat(), "value_kwh": float(row["value_kwh"])} for _, row in daily.iterrows()]
        
        # Aggregate by source type
        by_source = df.groupby("source_type")["value_kwh"].sum().to_dict()
        by_source = {k: float(v) for k, v in by_source.items()}
        
        # Aggregate by project
        by_project = df.groupby("project_id")["value_kwh"].sum().to_dict()
        by_project = {str(k): float(v) for k, v in by_project.items()}
        
        # Calculate average efficiency
        avg_efficiency = float(df["efficiency"].mean()) if "efficiency" in df.columns else 0
        
        total_kwh = float(df["value_kwh"].sum())
        
        logger.info(f"Retrieved {len(daily_data)} days of generation data, total {total_kwh} kWh")
        
        return {
            "daily_generation": daily_data,
            "total_kwh": total_kwh,
            "by_source": by_source,
            "avg_efficiency": avg_efficiency,
            "by_project": by_project
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
    project_id: Optional[int] = None,
    current_user:  User = Depends(get_current_active_user),
):
    """
    Get weekly aggregated energy generation data.
    If start_date and end_date are not provided, defaults to the last 90 days.
    """
    try:
        # Get the user's projects if authenticated
        user_id = current_user.id if current_user else None
        
        # Default date range
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=90)
        if not end_date:
            end_date = datetime.utcnow()
            
        logger.info(f"Fetching weekly generation data from {start_date} to {end_date}")
        
        if user_id:
            # Get projects for the authenticated user
            user_projects = db.query(Project.id).filter(Project.user_id == user_id).all()
            project_ids = [p.id for p in user_projects]
            
            if not project_ids:
                return {
                    "weekly_generation": [],
                    "total_kwh": 0,
                    "by_source": {},
                    "avg_efficiency": 0,
                    "by_project": {}
                }
                
            # Base query filtering by the user's projects
            query = db.query(EnergyGeneration).filter(
                EnergyGeneration.project_id.in_(project_ids),
                EnergyGeneration.timestamp >= start_date,
                EnergyGeneration.timestamp <= end_date
            )
            
            # Apply specific project_id filter if provided
            if project_id:
                if project_id not in project_ids:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Project not found or does not belong to the user",
                    )
                query = query.filter(EnergyGeneration.project_id == project_id)
        else:
            # For non-authenticated users, don't filter by project
            query = db.query(EnergyGeneration).filter(
                EnergyGeneration.timestamp >= start_date,
                EnergyGeneration.timestamp <= end_date
            )
            
            # But still apply specific project filter if provided
            if project_id:
                query = query.filter(EnergyGeneration.project_id == project_id)
        
        # Apply source type filter
        if source_type:
            query = query.filter(EnergyGeneration.source_type.in_(source_type))
        
        generation_data = query.all()
        
        # Convert the records to a DataFrame
        df = pd.DataFrame([
            {
                "date": item.timestamp.date(),
                "value_kwh": item.value_kwh,
                "source_type": item.source_type.value,
                "efficiency": item.efficiency or 0,
                "project_id": item.project_id
            }
            for item in generation_data
        ])
        
        if df.empty:
            logger.warning("No generation data found")
            return {
                "weekly_generation": [],
                "total_kwh": 0,
                "by_source": {},
                "avg_efficiency": 0,
                "by_project": {}
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
        
        # Aggregate by project
        by_project = df.groupby("project_id")["value_kwh"].sum().to_dict()
        by_project = {str(k): float(v) for k, v in by_project.items()}
        
        # Total kWh and average efficiency for the period
        total_kwh = float(df["value_kwh"].sum())
        avg_efficiency = float(df["efficiency"].mean()) if "efficiency" in df.columns else 0
        
        logger.info(f"Retrieved {len(weekly_data)} weeks of data, total {total_kwh} kWh")
        
        return {
            "weekly_generation": weekly_data,
            "total_kwh": total_kwh,
            "by_source": by_source,
            "avg_efficiency": avg_efficiency,
            "by_project": by_project
        }
    except Exception as e:
        logger.error(f"Error getting weekly generation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting weekly generation: {str(e)}"
        )
