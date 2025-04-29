from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    agent_type = Column(String, nullable=False)  # e.g., 'network', 'endpoint', 'cloud'
    status = Column(String, nullable=False)  # active, inactive, maintenance
    version = Column(String)
    last_seen = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    configuration = Column(JSON)  # Agent-specific configuration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    incidents = relationship("Incident", back_populates="agent") 