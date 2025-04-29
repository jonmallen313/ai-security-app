# AI Security Alert System

A modern web application for sending and managing security alerts through Slack.

## Features

- Send security alerts to Slack channels
- Different alert types and severity levels
- Real-time notifications
- Alert history tracking
- Modern React frontend with TypeScript
- FastAPI backend with SQLite database

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Slack workspace with admin access
- Slack Bot Token

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your Slack credentials:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_CHANNEL_ID=your-channel-id
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the Slack Notification component to:
   - Enter your alert message
   - Select the alert type
   - Choose the severity level
   - Send the notification

## API Endpoints

- `POST /api/alerts/slack`: Send a new Slack alert
  ```json
  {
    "message": "Your alert message",
    "alert_type": "SECURITY_BREACH",
    "severity": "HIGH"
  }
  ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
