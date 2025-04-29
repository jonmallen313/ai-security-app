import { Incident } from './incidents';

interface SlackMessage {
  text: string;
  blocks?: any[];
}

export type AlertType = 'incident' | 'manual' | 'system';

export interface AlertOptions {
  type: AlertType;
  title?: string;
  message: string;
  incident?: Incident;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  channel?: string;
}

export async function sendSlackNotification(options: AlertOptions): Promise<boolean> {
  try {
    // Get settings from localStorage
    const settings = localStorage.getItem('appSettings');
    if (!settings) {
      console.warn('No settings found. Slack notifications are disabled.');
      return false;
    }

    const { webhooks } = JSON.parse(settings);
    
    // Check if any webhooks are configured
    if (!webhooks || webhooks.length === 0) {
      console.log('No webhooks configured. Notifications are disabled.');
      return false;
    }

    // Get enabled webhooks
    const enabledWebhooks = webhooks.filter((webhook: any) => webhook.enabled);
    if (enabledWebhooks.length === 0) {
      console.log('No enabled webhooks found.');
      return false;
    }

    // For automatic alerts, check if they're enabled
    if (options.type === 'incident') {
      const { autoAlertsEnabled } = JSON.parse(settings);
      if (!autoAlertsEnabled) {
        console.log('Automatic alerts are disabled.');
        return false;
      }
    }

    // Construct the message based on alert type
    const slackMessage = {
      channel: "#security-alerts", // Default channel
      username: "Security Bot",
      text: options.message,
      icon_emoji: getHeaderEmoji(options.type, options.severity),
      blocks: buildSlackBlocks(options)
    };

    // Send to all enabled webhooks
    const results = await Promise.all(
      enabledWebhooks.map(async (webhook: any) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `payload=${encodeURIComponent(JSON.stringify(slackMessage))}`,
          });

          if (!response.ok) {
            throw new Error(`Failed to send Slack notification: ${response.statusText}`);
          }

          return true;
        } catch (error) {
          console.error(`Error sending to webhook ${webhook.name}:`, error);
          return false;
        }
      })
    );

    // Return true if at least one webhook succeeded
    const success = results.some(result => result === true);
    if (success) {
      console.log(`Slack notification sent successfully: ${options.type} alert`);
    } else {
      console.error('Failed to send notification to any webhook');
    }
    return success;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

function buildSlackBlocks(options: AlertOptions): any[] {
  const blocks: any[] = [];
  
  // Add header based on alert type
  const headerEmoji = getHeaderEmoji(options.type, options.severity);
  const headerText = options.title || getDefaultTitle(options.type, options.severity);
  
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: headerText,
      emoji: true
    }
  });
  
  // Add message section
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: options.message
    }
  });
  
  // Add incident details if available
  if (options.incident) {
    blocks.push({
      type: "divider"
    });
    
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Time:*\n${options.incident.time}`
        },
        {
          type: "mrkdwn",
          text: `*Source IP:*\n${options.incident.sourceIp}`
        },
        {
          type: "mrkdwn",
          text: `*Threat Level:*\n${options.incident.threatLevel}`
        },
        {
          type: "mrkdwn",
          text: `*MITRE Technique:*\n${options.incident.mitreTechnique}`
        }
      ]
    });
    
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Description:*\n${options.incident.description}`
      }
    });
  }
  
  // Add footer with timestamp
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Sent from AI Security App • ${new Date().toLocaleString()}`
      }
    ]
  });
  
  return blocks;
}

function getHeaderEmoji(type: AlertType, severity?: string): string {
  if (type === 'manual') return '📢';
  if (type === 'system') return '⚙️';
  
  // For incident alerts, use severity-based emoji
  switch (severity) {
    case 'critical': return '🔥';
    case 'error': return '⚠️';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
}

function getDefaultTitle(type: AlertType, severity?: string): string {
  switch (type) {
    case 'incident':
      return `${getHeaderEmoji(type, severity)} Security Incident Alert`;
    case 'manual':
      return '📢 Team Communication';
    case 'system':
      return '⚙️ System Notification';
    default:
      return 'Notification';
  }
}

// Helper function to send a manual alert
export async function sendManualAlert(message: string, title?: string): Promise<boolean> {
  return sendSlackNotification({
    type: 'manual',
    title: title || 'Team Communication',
    message,
    severity: 'info'
  });
}

// Helper function to send a critical incident alert
export async function sendCriticalIncidentAlert(incident: Incident): Promise<boolean> {
  return sendSlackNotification({
    type: 'incident',
    title: '🚨 Critical Security Incident',
    message: `A critical security incident has been detected and requires immediate attention.`,
    incident,
    severity: 'critical'
  });
}

// Helper function to send a system notification
export async function sendSystemNotification(message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<boolean> {
  return sendSlackNotification({
    type: 'system',
    message,
    severity
  });
} 