from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    severity = Column(String, nullable=False)  # low, medium, high, critical
    status = Column(String, nullable=False)  # open, in_progress, resolved, closed
    source = Column(String)  # Where the incident was detected
    agent_id = Column(Integer, ForeignKey("agents.id"))
    details = Column(JSON)  # Additional incident details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True))

    # Relationships
    agent = relationship("Agent", back_populates="incidents") 