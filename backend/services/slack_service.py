import aiohttp
from typing import Optional
import os
from dotenv import load_dotenv
from config import settings

load_dotenv()

class SlackService:
    def __init__(self):
        self.webhook_url = settings.SLACK_WEBHOOK_URL
        self.default_channel = settings.SLACK_DEFAULT_CHANNEL

    async def send_message(
        self,
        message: str,
        channel: Optional[str] = None,
        type: str = "alert",
        severity: str = "medium"
    ) -> bool:
        """
        Send a message to Slack using webhook.
        
        Args:
            message: The message to send
            channel: Optional channel to send to (defaults to SLACK_DEFAULT_CHANNEL)
            type: Type of notification (alert, info, warning, etc.)
            severity: Severity level (low, medium, high, critical)
            
        Returns:
            bool: True if message was sent successfully, False otherwise
        """
        try:
            # Format message with severity emoji
            severity_emoji = {
                "low": "ℹ️",
                "medium": "⚠️",
                "high": "🚨",
                "critical": "🔥"
            }.get(severity.lower(), "ℹ️")

            formatted_message = f"{severity_emoji} *{type.upper()}*\n{message}"
            
            # Prepare the payload
            payload = {
                "text": formatted_message,
                "channel": channel or self.default_channel
            }
            
            # Send message to Slack using webhook
            async with aiohttp.ClientSession() as session:
                async with session.post(self.webhook_url, json=payload) as response:
                    return response.status == 200
            
        except Exception as e:
            print(f"Error sending message to Slack: {str(e)}")
            return False 