from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import Generator, Optional
import logging

from database import get_db
from core.security import pwd_context
from config import settings
from schemas.token import TokenPayload
from models.user import User

logger = logging.getLogger(__name__)

# Make tokenUrl optional to prevent redirect
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: Optional[int] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenPayload(sub=user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user

def get_optional_current_user(
    db: Session = Depends(get_db), 
    token: Optional[str] = Depends(oauth2_scheme),
    x_demo_user: Optional[str] = Header(None)
) -> Optional[User]:
    """
    Similar to get_current_user but doesn't raise an exception if authentication fails.
    Returns None instead, allowing endpoints to be accessible without authentication.
    
    If X-Demo-User header is present, automatically uses the demo user.
    """
    # If the demo user header is present, return the demo user
    if x_demo_user:
        logger.info("Demo user header detected, using demo user account")
        return get_demo_user(db)
        
    if token is None:
        logger.info("No token provided, proceeding with anonymous access")
        return None
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: Optional[int] = payload.get("sub")
        if user_id is None:
            return None
            
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_active:
            return user
            
    except JWTError:
        logger.info("Invalid token, proceeding with anonymous access")
        return None
        
    return None

def get_demo_user(db: Session) -> User:
    """
    Gets or creates a demo user for anonymous access
    """
    demo_user = db.query(User).first()
    if not demo_user:
        # Create a demo user if none exists
        demo_user = User(
            email="demo@example.com",
            username="demo",
            hashed_password="$2a$12$Gq14bZE5lE.BIM0PiglV8.saNwBmYVhYEhdxhmwIoEjF18t3GNWDO",  # "password"
            is_active=True,
            is_admin=False
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    return demo_user