from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    base_duration = Column(Float, default=15.0)

    tokens = relationship("Token", back_populates="service")

class Counter(Base):
    __tablename__ = "counters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    current_token_id = Column(Integer, nullable=True)

    tokens = relationship("Token", back_populates="counter")

class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String, index=True, nullable=False)
    customer_name = Column(String, nullable=False, default="Walk-in Patient")
    customer_type = Column(String, default="regular")  # "regular" or "priority"
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    counter_id = Column(Integer, ForeignKey("counters.id"), nullable=True)
    predicted_duration = Column(Float, default=15.0)
    actual_duration = Column(Float, nullable=True)
    estimated_wait = Column(Float, default=0.0)
    status = Column(String, default="waiting")  # "waiting", "serving", "called", "completed"
    created_at = Column(DateTime, default=datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    service = relationship("Service", back_populates="tokens")
    counter = relationship("Counter", back_populates="tokens")
