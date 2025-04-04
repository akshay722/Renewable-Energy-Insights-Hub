from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from api.deps import get_db, get_current_active_user
from models.user import User
from models.energy_data import Project
from schemas.energy import Project as ProjectSchema, ProjectCreate, ProjectUpdate

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ProjectSchema)
def create_project(
    *,
    db: Session = Depends(get_db),
    data_in: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new project
    """
    project = Project(
        name=data_in.name,
        description=data_in.description,
        location=data_in.location,
        user_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve all projects for the authenticated user
    """
    try:
        logger.info(f"Reading projects for user: {current_user.id} - {current_user.username}")
        
        projects = db.query(Project).filter(
            Project.user_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        return projects
    except Exception as e:
        logger.error(f"Error reading projects: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading projects: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific project by id
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    return project

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    *,
    project_id: int,
    db: Session = Depends(get_db),
    data_in: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a project
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    update_data = data_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    *,
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete a project
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    db.delete(project)
    db.commit()
    
    return None