# **App Name**: SecureView Dashboard

## Core Features:

- Incident Display: Display security incidents from a local incidents.json file in a card format, including Time, Source IP, Threat Level, and Description.
- Dashboard Layout: Implement a responsive sidebar and top navigation for dashboard navigation.
- AI-Powered Incident Analysis: Add a button 'Ask Agentforce' next to each incident card. When clicked, use an LLM to analyze the incident details and provide a summary of potential threats. Use the LLM as a tool to synthesize the incident details.

## Style Guidelines:

- Light background for a clean and modern look.
- Accent color: Teal (#008080) for interactive elements and highlights.
- Consistent spacing and padding throughout the dashboard.
- Responsive design to adapt to different screen sizes.
- Use soft shadows for depth and visual appeal on cards and key elements.

## Original User Request:
"Build a functional React + Tailwind dashboard with a sidebar and top nav. In the main panel, display a list of security incidents from a local incidents.json file as cards with fields: Time, Source IP, Threat Level, and Description. Next to each card, add a button labeled 'Ask Agentforce'. Below the incident list, include a placeholder section titled 'MITRE ATT&CK Heatmap' which will later be populated with data. Make it responsive and clean, with light background, soft shadows, and consistent spacing."
  