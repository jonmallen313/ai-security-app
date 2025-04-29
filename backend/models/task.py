from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, nullable=False, default="pending")  # pending, running, completed, failed
    priority = Column(String, nullable=False, default="medium")  # low, medium, high, critical
    agent_id = Column(Integer, ForeignKey("agents.id"))
    playbook_id = Column(Integer, ForeignKey("playbooks.id"))
    parameters = Column(JSON)
    result = Column(JSON)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agent = relationship("Agent", back_populates="tasks")
    playbook = relationship("Playbook", back_populates="tasks") 