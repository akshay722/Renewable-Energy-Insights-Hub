from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: Optional[int] = None
    email: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class TokenPayload(BaseModel):
    sub: Optional[int] = None