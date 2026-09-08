from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    base_duration = Column(Float, nullable=False, default=10)
    tokens = relationship("Token", back_populates="service")

class Counter(Base):
    __tablename__ = "counters"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    current_token_id = Column(Integer, ForeignKey("tokens.id"), nullable=True)
    tokens = relationship("Token", back_populates="counter", foreign_keys="Token.counter_id")

class Token(Base):
    __tablename__ = "tokens"
    id = Column(Integer, primary_key=True)
    token_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_name = Column(String(100), nullable=True)
    customer_type = Column(String(30), nullable=False, default="regular")
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    counter_id = Column(Integer, ForeignKey("counters.id"), nullable=True)
    predicted_duration = Column(Float, nullable=False, default=10)
    estimated_wait = Column(Float, nullable=False, default=0)
    status = Column(String(30), nullable=False, default="waiting")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    actual_duration = Column(Float, nullable=True)

    service = relationship("Service", back_populates="tokens")
    counter = relationship("Counter", back_populates="tokens", foreign_keys=[counter_id])
