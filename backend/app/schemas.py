from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ServiceOut(BaseModel):
    id: int
    name: str
    base_duration: float

    class Config:
        from_attributes = True

class CounterOut(BaseModel):
    id: int
    name: str
    is_active: bool
    current_token_id: Optional[int] = None

    class Config:
        from_attributes = True

class TokenCreate(BaseModel):
    customer_name: Optional[str] = "Walk-in Patient"
    customer_type: str = Field(default="regular")
    service_id: int

class TokenOut(BaseModel):
    id: int
    token_number: str
    customer_name: str
    customer_type: str
    service_id: int
    counter_id: Optional[int] = None
    predicted_duration: float
    actual_duration: Optional[float] = None
    estimated_wait: float
    status: str
    created_at: datetime
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CompleteRequest(BaseModel):
    actual_duration: Optional[float] = None
