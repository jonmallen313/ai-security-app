from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid
from datetime import datetime
import random
from services.slack_service import SlackService
from services.agent_service import AgentService
from services.playbook_service import PlaybookService
from services.incident_service import IncidentService
from services.task_service import TaskService
from services.rule_service import RuleService
from models.agent import Agent, AgentCreate, AgentUpdate
from models.playbook import Playbook, PlaybookCreate, PlaybookUpdate
from models.incident import Incident, IncidentCreate, IncidentUpdate
from models.task import Task, TaskCreate, TaskUpdate
from models.rule import Rule, RuleCreate, RuleUpdate
from models.alert import Alert, AlertCreate
from models.slack_notification import SlackNotification, SlackNotificationCreate
from database import get_db, engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="AI Security Alert System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
slack_service = SlackService()
agent_service = AgentService()
playbook_service = PlaybookService()
incident_service = IncidentService()
task_service = TaskService()
rule_service = RuleService()

# Enums
class AgentType(str, Enum):
    NETWORK = "network"
    ENDPOINT = "endpoint"
    CLOUD = "cloud"

class AgentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class RuleType(str, Enum):
    DETECTION = "detection"
    PREVENTION = "prevention"
    RESPONSE = "response"

# Pydantic models
class AgentBase(BaseModel):
    name: str
    agent_type: AgentType
    status: AgentStatus
    version: str
    is_active: bool = True

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    id: str
    last_seen: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class PlaybookBase(BaseModel):
    name: str
    description: str
    version: str
    steps: List[Dict[str, Any]]

class PlaybookCreate(PlaybookBase):
    pass

class Playbook(PlaybookBase):
    id: str
    created_at: datetime
    updated_at: datetime

class TaskBase(BaseModel):
    name: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    agent_id: str
    playbook_id: str
    parameters: Dict[str, Any] = {}

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    result: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class IncidentBase(BaseModel):
    title: str
    description: str
    severity: IncidentSeverity
    status: IncidentStatus
    source: str
    agent_id: str
    details: Dict[str, Any] = {}

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

class RuleBase(BaseModel):
    name: str
    description: str
    rule_type: RuleType
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    is_active: bool = True

class RuleCreate(RuleBase):
    pass

class Rule(RuleBase):
    id: str
    created_at: datetime
    updated_at: datetime

class IncidentSimulationRequest(BaseModel):
    agent_id: str
    severity: IncidentSeverity
    description: str

class AlertRequest(BaseModel):
    message: str
    channel: Optional[str] = None
    type: str = "alert"
    severity: str = "medium"

# Slack notification models
class SlackNotificationRequest(BaseModel):
    message: str
    channel: Optional[str] = None
    type: str = "alert"
    severity: str = "medium"

# In-memory storage
agents: Dict[str, Agent] = {}
playbooks: Dict[str, Playbook] = {}
tasks: Dict[str, Task] = {}
incidents: Dict[str, Incident] = {}
rules: Dict[str, Rule] = {}

# Helper functions
def generate_id():
    return str(uuid.uuid4())

def get_current_time():
    return datetime.now()

# Sample data initialization
def init_sample_data():
    # Create sample agents
    agent1 = Agent(
        id=generate_id(),
        name="Network Monitor Agent",
        agent_type=AgentType.NETWORK,
        status=AgentStatus.ACTIVE,
        version="1.0.0",
        is_active=True,
        last_seen=get_current_time(),
        created_at=get_current_time(),
        updated_at=get_current_time()
    )
    agents[agent1.id] = agent1

    agent2 = Agent(
        id=generate_id(),
        name="Endpoint Protection Agent",
        agent_type=AgentType.ENDPOINT,
        status=AgentStatus.ACTIVE,
        version="1.0.0",
        is_active=True,
        last_seen=get_current_time(),
        created_at=get_current_time(),
        updated_at=get_current_time()
    )
    agents[agent2.id] = agent2

    # Create sample playbooks
    playbook1 = Playbook(
        id=generate_id(),
        name="Malware Detection Response",
        description="Standard response to malware detection",
        version="1.0.0",
        steps=[
            {"name": "Isolate affected system", "action": "isolate", "parameters": {"duration": 3600}},
            {"name": "Scan for malware", "action": "scan", "parameters": {"scan_type": "full"}},
            {"name": "Collect logs", "action": "collect_logs", "parameters": {"log_types": ["system", "application"]}}
        ],
        created_at=get_current_time(),
        updated_at=get_current_time()
    )
    playbooks[playbook1.id] = playbook1

    playbook2 = Playbook(
        id=generate_id(),
        name="Network Intrusion Response",
        description="Response to network intrusion attempts",
        version="1.0.0",
        steps=[
            {"name": "Block suspicious IP", "action": "block_ip", "parameters": {"duration": 86400}},
            {"name": "Analyze network traffic", "action": "analyze_traffic", "parameters": {"timeframe": 3600}},
            {"name": "Update firewall rules", "action": "update_firewall", "parameters": {"rule_type": "block"}}
        ],
        created_at=get_current_time(),
        updated_at=get_current_time()
    )
    playbooks[playbook2.id] = playbook2

    # Create sample rules
    rule1 = Rule(
        id=generate_id(),
        name="Malware Detection Rule",
        description="Detect known malware signatures",
        rule_type=RuleType.DETECTION,
        conditions={"signature_match": True, "confidence": 0.8},
        actions=[{"type": "create_incident", "severity": "high"}],
        is_active=True,
        created_at=get_current_time(),
        updated_at=get_current_time()
    )
    rules[rule1.id] = rule1

    rule2 = Rule(
        id=generate_id(),
        name="Brute Force Prevention",
        description="Prevent brute force login attempts",
        rule_type=RuleType.PREVENTION,
        conditions={"failed_attempts": 5, "timeframe": 300},
        actions=[{"type": "block_ip", "duration": 3600}],
        is_active=True,
        created_at=get_current_time(),
        updated_at=get_current_time()
    )
    rules[rule2.id] = rule2

# Initialize sample data
init_sample_data()

# API Endpoints

# Slack notification endpoints
@app.post("/api/slack/send", response_model=SlackNotification)
async def send_slack_notification(notification: SlackNotificationRequest, db=Depends(get_db)):
    try:
        # Create a notification object
        notification_data = SlackNotificationCreate(
            message=notification.message,
            channel=notification.channel,
            type=notification.type,
            severity=notification.severity
        )
        
        # Send the notification via Slack
        slack_response = await slack_service.send_alert(
            message=notification.message,
            channel=notification.channel,
            alert_type=notification.type,
            severity=notification.severity
        )
        
        if not slack_response:
            raise HTTPException(status_code=500, detail="Failed to send Slack notification")
        
        # Save the notification to the database
        db_notification = await notification_service.create_notification(db, notification_data)
        
        return db_notification
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Agents
@app.get("/api/agents", response_model=List[Agent])
async def get_agents(db=Depends(get_db)):
    return await agent_service.get_agents(db)

@app.post("/api/agents", response_model=Agent)
async def create_agent(agent: AgentCreate, db=Depends(get_db)):
    return await agent_service.create_agent(db, agent)

@app.get("/api/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: int, db=Depends(get_db)):
    agent = await agent_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@app.put("/api/agents/{agent_id}", response_model=Agent)
async def update_agent(agent_id: int, agent: AgentUpdate, db=Depends(get_db)):
    updated_agent = await agent_service.update_agent(db, agent_id, agent)
    if not updated_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return updated_agent

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: int, db=Depends(get_db)):
    success = await agent_service.delete_agent(db, agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

# Playbooks
@app.get("/api/playbooks", response_model=List[Playbook])
async def get_playbooks(db=Depends(get_db)):
    return await playbook_service.get_playbooks(db)

@app.post("/api/playbooks", response_model=Playbook)
async def create_playbook(playbook: PlaybookCreate, db=Depends(get_db)):
    return await playbook_service.create_playbook(db, playbook)

@app.get("/api/playbooks/{playbook_id}", response_model=Playbook)
async def get_playbook(playbook_id: int, db=Depends(get_db)):
    playbook = await playbook_service.get_playbook(db, playbook_id)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return playbook

@app.put("/api/playbooks/{playbook_id}", response_model=Playbook)
async def update_playbook(playbook_id: int, playbook: PlaybookUpdate, db=Depends(get_db)):
    updated_playbook = await playbook_service.update_playbook(db, playbook_id, playbook)
    if not updated_playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return updated_playbook

@app.delete("/api/playbooks/{playbook_id}")
async def delete_playbook(playbook_id: int, db=Depends(get_db)):
    success = await playbook_service.delete_playbook(db, playbook_id)
    if not success:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return {"message": "Playbook deleted successfully"}

# Incidents
@app.get("/api/incidents", response_model=List[Incident])
async def get_incidents(db=Depends(get_db)):
    return await incident_service.get_incidents(db)

@app.post("/api/incidents", response_model=Incident)
async def create_incident(incident: IncidentCreate, db=Depends(get_db)):
    return await incident_service.create_incident(db, incident)

@app.get("/api/incidents/{incident_id}", response_model=Incident)
async def get_incident(incident_id: int, db=Depends(get_db)):
    incident = await incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.put("/api/incidents/{incident_id}", response_model=Incident)
async def update_incident(incident_id: int, incident: IncidentUpdate, db=Depends(get_db)):
    updated_incident = await incident_service.update_incident(db, incident_id, incident)
    if not updated_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return updated_incident

@app.delete("/api/incidents/{incident_id}")
async def delete_incident(incident_id: int, db=Depends(get_db)):
    success = await incident_service.delete_incident(db, incident_id)
    if not success:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"message": "Incident deleted successfully"}

# Tasks
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks(db=Depends(get_db)):
    return await task_service.get_tasks(db)

@app.post("/api/tasks", response_model=Task)
async def create_task(task: TaskCreate, db=Depends(get_db)):
    return await task_service.create_task(db, task)

@app.get("/api/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int, db=Depends(get_db)):
    task = await task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: TaskUpdate, db=Depends(get_db)):
    updated_task = await task_service.update_task(db, task_id, task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int, db=Depends(get_db)):
    success = await task_service.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# Rules
@app.get("/api/rules", response_model=List[Rule])
async def get_rules(db=Depends(get_db)):
    return await rule_service.get_rules(db)

@app.post("/api/rules", response_model=Rule)
async def create_rule(rule: RuleCreate, db=Depends(get_db)):
    return await rule_service.create_rule(db, rule)

@app.get("/api/rules/{rule_id}", response_model=Rule)
async def get_rule(rule_id: int, db=Depends(get_db)):
    rule = await rule_service.get_rule(db, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule

@app.put("/api/rules/{rule_id}", response_model=Rule)
async def update_rule(rule_id: int, rule: RuleUpdate, db=Depends(get_db)):
    updated_rule = await rule_service.update_rule(db, rule_id, rule)
    if not updated_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return updated_rule

@app.delete("/api/rules/{rule_id}")
async def delete_rule(rule_id: int, db=Depends(get_db)):
    success = await rule_service.delete_rule(db, rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted successfully"}

# Alerts
@app.get("/api/alerts", response_model=List[Alert])
async def get_alerts(db=Depends(get_db)):
    return await alert_service.get_alerts(db)

@app.post("/api/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate, db=Depends(get_db)):
    return await alert_service.create_alert(db, alert)

@app.get("/api/alerts/{alert_id}", response_model=Alert)
async def get_alert(alert_id: int, db=Depends(get_db)):
    alert = await alert_service.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@app.put("/api/alerts/{alert_id}", response_model=Alert)
async def update_alert(alert_id: int, alert: AlertUpdate, db=Depends(get_db)):
    updated_alert = await alert_service.update_alert(db, alert_id, alert)
    if not updated_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return updated_alert

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: int, db=Depends(get_db)):
    success = await alert_service.delete_alert(db, alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted successfully"}

@app.post("/api/alerts/slack")
async def send_slack_alert(alert: AlertRequest):
    """
    Send a notification to Slack.
    
    Args:
        alert: AlertRequest containing message, channel, type, and severity
        
    Returns:
        dict: Response indicating success or failure
    """
    success = await slack_service.send_message(
        message=alert.message,
        channel=alert.channel,
        type=alert.type,
        severity=alert.severity
    )
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send message to Slack"
        )
    
    return {"status": "success", "message": "Notification sent successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 