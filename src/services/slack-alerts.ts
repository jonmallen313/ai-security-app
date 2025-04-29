import { Incident } from './incidents';

export type AlertType = "automatic" | "agent" | "manual";

export interface SlackAlertOptions {
  messageText: string;
  alertType: AlertType;
  incident?: Incident;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Sends a Slack alert with the provided message and options
 */
export async function sendSlackAlert(options: SlackAlertOptions): Promise<boolean> {
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
    if (options.alertType === "automatic") {
      const { autoAlertsEnabled } = JSON.parse(settings);
      if (!autoAlertsEnabled) {
        console.log('Automatic alerts are disabled.');
        return false;
      }
    }

    // Format the message with Slack markdown
    const formattedMessage = formatSlackMessage(options);
    
    // Prepare the Slack message
    const slackMessage = {
      text: formattedMessage,
      username: "Security Bot",
      icon_emoji: getAlertEmoji(options.alertType, options.severity)
    };
    
    // Send to all enabled webhooks directly
    const results = await Promise.all(
      enabledWebhooks.map(async (webhook: any) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(slackMessage)
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
      console.log(`Slack alert sent successfully: ${options.alertType} alert`);
    } else {
      console.error('Failed to send notification to any webhook');
    }
    return success;
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return false;
  }
}

/**
 * Formats the message with Slack markdown
 */
function formatSlackMessage(options: SlackAlertOptions): string {
  const { messageText, alertType, incident, severity } = options;
  
  let formattedMessage = `*${getAlertTypeText(alertType)} Alert*`;
  
  if (severity) {
    formattedMessage += ` | *Severity:* ${getSeverityText(severity)}`;
  }
  
  formattedMessage += `\n\n${messageText}`;
  
  if (incident) {
    formattedMessage += `\n\n*Incident Details:*`;
    formattedMessage += `\n• *Time:* ${incident.time}`;
    formattedMessage += `\n• *Source IP:* ${incident.sourceIp}`;
    formattedMessage += `\n• *MITRE Technique:* ${incident.mitreTechnique}`;
    formattedMessage += `\n• *Description:* ${incident.description}`;
  }
  
  return formattedMessage;
}

/**
 * Gets the emoji for the alert type and severity
 */
function getAlertEmoji(alertType: AlertType, severity?: string): string {
  if (alertType === "manual") return ":loudspeaker:";
  if (alertType === "agent") return ":robot_face:";
  
  // For automatic alerts, use severity-based emoji
  switch (severity) {
    case 'critical': return ":fire:";
    case 'error': return ":warning:";
    case 'warning': return ":warning:";
    default: return ":information_source:";
  }
}

/**
 * Gets the text representation of the alert type
 */
function getAlertTypeText(alertType: AlertType): string {
  switch (alertType) {
    case "automatic": return "Automatic";
    case "agent": return "Agent";
    case "manual": return "Manual";
    default: return "Alert";
  }
}

/**
 * Gets the text representation of the severity
 */
function getSeverityText(severity: string): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

/**
 * Sends a test alert to Slack
 */
export async function sendTestAlert(): Promise<boolean> {
  return sendSlackAlert({
    messageText: "This is a test alert from the AI Security App. If you're seeing this, your Slack integration is working correctly!",
    alertType: "manual",
    severity: "info"
  });
} 