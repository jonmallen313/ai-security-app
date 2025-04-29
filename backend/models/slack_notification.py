from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SlackNotificationBase(BaseModel):
    message: str
    channel: Optional[str] = None
    type: str = "alert"
    severity: str = "medium"

class SlackNotificationCreate(SlackNotificationBase):
    pass

class SlackNotification(SlackNotificationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 