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

@router.get("/recommendations", response_model=List[dict])
def get_recommendations(
    db: Session = Depends(get_db),
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get personalized energy recommendations based on usage patterns
    """
    try:
        # Get last 90 days of data
        start_date = datetime.utcnow() - timedelta(days=90)
        end_date = datetime.utcnow()
        
        logger.info(f"Generating recommendations for user {current_user.id}")
        
        # Get user's projects
        user_projects = db.query(Project.id).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        
        if not project_ids:
            return []
        
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
        
        # Convert to DataFrames
        if consumption_data:
            cons_df = pd.DataFrame([
                {
                    "date": item.timestamp.date(),
                    "hour": item.timestamp.hour,
                    "value_kwh": item.value_kwh,
                    "source_type": item.source_type.value
                }
                for item in consumption_data
            ])
        else:
            cons_df = pd.DataFrame(columns=["date", "hour", "value_kwh", "source_type"])
        
        if generation_data:
            gen_df = pd.DataFrame([
                {
                    "date": item.timestamp.date(),
                    "hour": item.timestamp.hour,
                    "value_kwh": item.value_kwh,
                    "source_type": item.source_type.value
                }
                for item in generation_data
            ])
        else:
            gen_df = pd.DataFrame(columns=["date", "hour", "value_kwh", "source_type"])
        
        recommendations = []
        
        # Recommendation 1: Check if grid usage is high
        if not cons_df.empty:
            grid_usage = cons_df[cons_df["source_type"] == "grid"]["value_kwh"].sum()
            total_usage = cons_df["value_kwh"].sum()
            
            if total_usage > 0 and (grid_usage / total_usage) > 0.7:
                recommendations.append({
                    "type": "reduction",
                    "title": "High Grid Usage",
                    "description": "Your grid electricity usage is high. Consider adding more renewable sources to decrease dependence on the grid."
                })
        
        # Recommendation 2: Detect peak usage times
        if not cons_df.empty:
            hourly_usage = cons_df.groupby("hour")["value_kwh"].mean().reset_index()
            peak_hour = hourly_usage.loc[hourly_usage["value_kwh"].idxmax()]
            
            if peak_hour["value_kwh"] > 0:
                recommendations.append({
                    "type": "shift",
                    "title": "Peak Usage Detection",
                    "description": f"Your peak energy usage is around {int(peak_hour['hour'])}:00. Consider shifting some activities to off-peak hours."
                })
        
        # Recommendation 3: Solar efficiency
        if not gen_df.empty and "solar" in gen_df["source_type"].values:
            solar_df = gen_df[gen_df["source_type"] == "solar"]
            solar_by_hour = solar_df.groupby("hour")["value_kwh"].mean().reset_index()
            
            if not solar_by_hour.empty:
                peak_solar_hour = solar_by_hour.loc[solar_by_hour["value_kwh"].idxmax()]["hour"]
                recommendations.append({
                    "type": "optimization",
                    "title": "Solar Generation Optimization",
                    "description": f"Your solar generation peaks at around {int(peak_solar_hour)}:00. Align energy-intensive activities with this time for maximum efficiency."
                })
        
        # If no data-driven recommendations, provide defaults
        if not recommendations:
            recommendations = [
                {
                    "type": "shift",
                    "title": "Shift Energy Usage to Daylight Hours",
                    "description": "Shifting high-energy tasks to 10AM-2PM when solar generation is highest could increase your renewable energy usage by approximately 15-20%."
                },
                {
                    "type": "reduction",
                    "title": "Reduce Overnight Standby Power",
                    "description": "Your facility uses significant power overnight when renewable generation is minimal. Consider implementing automated shutdown procedures for non-essential equipment."
                },
                {
                    "type": "optimization",
                    "title": "Balance Load During Peak Hours",
                    "description": "Your energy consumption spikes between 7-9AM and 5-7PM. Staggering equipment startup and shutdown could reduce peak demand and increase grid energy efficiency."
                }
            ]
        
        # Always include a general recommendation
        if not any(r["type"] == "general" for r in recommendations):
            recommendations.append({
                "type": "general",
                "title": "Energy Saving Tip",
                "description": "Install smart thermostats and energy monitoring systems to optimize your energy usage."
            })
        
        return recommendations
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        # Fallback static recommendations
        return [
            {
                "type": "general",
                "title": "Consider Additional Solar Capacity",
                "description": "Based on typical business consumption patterns, adding solar capacity would significantly improve your 24/7 green energy coverage."
            },
            {
                "type": "shift",
                "title": "Optimize Work Hours",
                "description": "Consider shifting energy-intensive operations to daylight hours to maximize renewable energy usage."
            }
        ]

@router.get("/trends", response_model=dict)
def get_energy_trends(
    db: Session = Depends(get_db),
    months: int = 3,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get energy usage trends over time
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=30 * months)
        end_date = datetime.utcnow()
        
        logger.info(f"Fetching energy trends for user {current_user.id} for past {months} months")
        
        # Get user's projects
        user_projects = db.query(Project.id).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        
        if not project_ids:
            return {"monthly_trends": [], "consumption_by_source": {}, "generation_by_source": {}}
        
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
        
        # Process monthly trends
        monthly_data = []
        current_date = start_date
        
        while current_date <= end_date:
            month_start = current_date.replace(day=1)
            if current_date.month == 12:
                month_end = current_date.replace(year=current_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = current_date.replace(month=current_date.month + 1, day=1) - timedelta(days=1)
            
            # Calculate consumption for the month
            month_consumption = sum(
                item.value_kwh for item in consumption_data 
                if month_start <= item.timestamp <= month_end
            )
            
            # Calculate generation for the month
            month_generation = sum(
                item.value_kwh for item in generation_data 
                if month_start <= item.timestamp <= month_end
            )
            
            # Calculate net usage
            net_usage = month_consumption - month_generation
            
            # Convert to floats to handle NumPy types
            month_consumption = float(month_consumption)
            month_generation = float(month_generation)
            net_usage = float(net_usage)
            
            monthly_data.append({
                "month": month_start.strftime("%Y-%m"),
                "consumption": month_consumption,
                "generation": month_generation,
                "net_usage": net_usage
            })
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        # Calculate average consumption by source type
        source_consumption = {}
        if consumption_data:
            for source_type in EnergySourceType:
                source_sum = sum(
                    item.value_kwh for item in consumption_data 
                    if item.source_type == source_type
                )
                if source_sum > 0:  # Only include sources with consumption
                    source_consumption[source_type.value] = float(source_sum)
        
        # Calculate average generation by source type
        source_generation = {}
        if generation_data:
            for source_type in EnergySourceType:
                source_sum = sum(
                    item.value_kwh for item in generation_data 
                    if item.source_type == source_type
                )
                if source_sum > 0:  # Only include sources with generation
                    source_generation[source_type.value] = float(source_sum)
        
        return {
            "monthly_trends": monthly_data,
            "consumption_by_source": source_consumption,
            "generation_by_source": source_generation
        }
    except Exception as e:
        logger.error(f"Error getting energy trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting energy trends: {str(e)}"
        )