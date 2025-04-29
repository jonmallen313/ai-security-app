# Security Operations AI Agent Backend

This is the FastAPI backend for the Security Operations AI Agent application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with the following content:
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

4. Run the server:
```bash
uvicorn main:app --reload
```

The server will be available at http://localhost:8000.

## API Endpoints

- `GET /`: Root endpoint
- `GET /incidents`: Get all incidents
- `GET /incidents/{incident_id}`: Get a specific incident
- `POST /assess-risk`: Assess risk for an incident
- `POST /generate-response`: Generate a response plan for an incident
- `POST /create-report`: Create a report
- `POST /send-slack`: Send a Slack notification

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 