from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    base_duration: float

class TokenCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_type: str = "regular"
    service_id: int

class TokenOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    token_number: str
    customer_name: Optional[str]
    customer_type: str
    service_id: int
    counter_id: Optional[int]
    predicted_duration: float
    estimated_wait: float
    status: str
    created_at: datetime
    called_at: Optional[datetime]
    completed_at: Optional[datetime]
    actual_duration: Optional[float]

class CounterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    is_active: bool
    current_token_id: Optional[int]

class CompleteRequest(BaseModel):
    actual_duration: Optional[float] = None
