from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.deps import get_db, get_current_active_user, get_current_active_admin
from core.security import get_password_hash
from models.user import User
from schemas.user import User as UserSchema, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user
    """
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update own user
    """
    if user_in.email and user_in.email != current_user.email:
        if db.query(User).filter(User.email == user_in.email).first():
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
    
    if user_in.username and user_in.username != current_user.username:
        if db.query(User).filter(User.username == user_in.username).first():
            raise HTTPException(
                status_code=400,
                detail="Username already registered",
            )
    
    user_data = user_in.model_dump(exclude_unset=True)
    
    if user_in.password:
        user_data["hashed_password"] = get_password_hash(user_in.password)
        del user_data["password"]
    
    for field, value in user_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserSchema)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get a specific user by id
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user == current_user:
        return user
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_admin),
):
    """
    Retrieve users (admin only)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users