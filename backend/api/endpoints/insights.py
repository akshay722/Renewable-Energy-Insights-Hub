from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import logging

from api.deps import get_db, get_current_active_user
from models.user import User
from models.energy_data import EnergyConsumption, EnergyGeneration, EnergySourceType, Project
from schemas.energy import EnergySummary

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/summary", response_model=EnergySummary)
def get_energy_summary(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get energy summary comparing consumption and generation
    """
    try:
        # Get user's projects
        user_projects = db.query(Project.id).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        
        if not project_ids:
            return {
                "total_consumption": 0,
                "total_generation": 0,
                "renewable_percentage": 0,
                "start_date": start_date or datetime.utcnow() - timedelta(days=30),
                "end_date": end_date or datetime.utcnow(),
                "project_id": project_id
            }
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        if not end_date:
            end_date = datetime.utcnow()
        
        logger.info(f"Fetching energy summary for user {current_user.id} from {start_date} to {end_date}")
        
        # Base query for consumption data
        consumption_query = db.query(EnergyConsumption).filter(
            EnergyConsumption.project_id.in_(project_ids),
            EnergyConsumption.timestamp >= start_date,
            EnergyConsumption.timestamp <= end_date
        )
        
        # Base query for generation data
        generation_query = db.query(EnergyGeneration).filter(
            EnergyGeneration.project_id.in_(project_ids),
            EnergyGeneration.timestamp >= start_date,
            EnergyGeneration.timestamp <= end_date
        )
        
        # Apply project filter if provided
        if project_id:
            if project_id not in project_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found or does not belong to the user",
                )
            consumption_query = consumption_query.filter(EnergyConsumption.project_id == project_id)
            generation_query = generation_query.filter(EnergyGeneration.project_id == project_id)
        
        # Get data
        consumption_data = consumption_query.all()
        generation_data = generation_query.all()
        
        # Calculate totals
        total_consumption = sum(item.value_kwh for item in consumption_data)
        total_generation = sum(item.value_kwh for item in generation_data)
        
        # Calculate renewable percentage
        renewable_percentage = 0
        if total_consumption > 0:
            renewable_percentage = min(100, (total_generation / total_consumption) * 100)
        
        # Convert to floats to handle NumPy types
        total_consumption = float(total_consumption)
        total_generation = float(total_generation)
        renewable_percentage = float(renewable_percentage)
        
        logger.info(f"Energy summary: consumption={total_consumption}, generation={total_generation}, renewable={renewable_percentage}%")
        
        return {
            "total_consumption": total_consumption,
            "total_generation": total_generation,
            "renewable_percentage": renewable_percentage,
            "start_date": start_date,
            "end_date": end_date,
            "project_id": project_id
        }
    except Exception as e:
        logger.error(f"Error getting energy summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting energy summary: {str(e)}"
        )
