/**
 * Alert Service
 * Generates Slack Block Kit and Microsoft Teams Adaptive Card payloads
 * for automated DevOps incident notification.
 */

function generateSlackAlert(incident) {
  const rootCause = typeof incident.root_cause === 'object' && incident.root_cause !== null
    ? incident.root_cause
    : { summary: incident.root_cause || 'Root cause under investigation' };

  const suggestedFix = typeof incident.suggested_fix === 'object' && incident.suggested_fix !== null
    ? incident.suggested_fix
    : { summary: incident.suggested_fix || 'Remediation script available' };

  const severityEmoji = incident.severity === 'CRITICAL' ? '🚨' : incident.severity === 'HIGH' ? '⚠️' : 'ℹ️';

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${severityEmoji} [OpsCopilot AI Alert] ${incident.title}`,
        emoji: true
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Service:*\n\`${incident.service_name}\``
        },
        {
          type: 'mrkdwn',
          text: `*Severity:*\n*${incident.severity}* (${incident.environment})`
        },
        {
          type: 'mrkdwn',
          text: `*AI Confidence:*\n${Math.round((incident.confidence_score || 0.95) * 100)}% (${incident.model_used || 'NVIDIA Nemotron'})`
        },
        {
          type: 'mrkdwn',
          text: `*Incident ID:*\n\`${incident.id}\``
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🔍 Root Cause Summary:*\n${rootCause.summary || 'Identified system anomaly'}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🛠️ Recommended Fix:*\n${suggestedFix.summary || 'Apply declarative patch manifest'}`
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '⚡ Execute in Sandbox',
            emoji: true
          },
          style: 'primary',
          value: `sandbox_${incident.id}`,
          action_id: 'action_run_sandbox'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 Copy Fix Command',
            emoji: true
          },
          value: `copy_${incident.id}`,
          action_id: 'action_copy_fix'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔬 View in OpsCopilot',
            emoji: true
          },
          url: `http://localhost:5173/incidents/${incident.id}`,
          action_id: 'action_view_portal'
        }
      ]
    }
  ];

  return {
    channel: '#sre-incidents',
    username: 'OpsCopilot Agent [Nemotron]',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: incident.severity === 'CRITICAL' ? '#EF4444' : incident.severity === 'HIGH' ? '#F59E0B' : '#3B82F6',
        blocks
      }
    ]
  };
}

function generateTeamsAlert(incident) {
  const rootCause = typeof incident.root_cause === 'object' && incident.root_cause !== null
    ? incident.root_cause
    : { summary: incident.root_cause || 'Root cause under investigation' };

  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: `🚨 [OpsCopilot] ${incident.title}`,
              color: incident.severity === 'CRITICAL' ? 'Attention' : 'Warning'
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Service', value: incident.service_name },
                { title: 'Severity', value: incident.severity },
                { title: 'Environment', value: incident.environment },
                { title: 'Model', value: incident.model_used || 'NVIDIA Nemotron' }
              ]
            },
            {
              type: 'TextBlock',
              text: `Root Cause: ${rootCause.summary}`,
              wrap: true
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Open in OpsCopilot Portal',
              url: `http://localhost:5173/incidents/${incident.id}`
            }
          ]
        }
      }
    ]
  };
}

module.exports = {
  generateSlackAlert,
  generateTeamsAlert
};
