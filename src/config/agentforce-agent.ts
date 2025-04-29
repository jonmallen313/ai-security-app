export const agentConfig = {
  name: "Security Operations AI Agent",
  description: "An AI-powered security operations agent that monitors, analyzes, and responds to security incidents",
  version: "1.0.0",
  capabilities: [
    "incident_analysis",
    "threat_detection",
    "compliance_checking",
    "risk_assessment",
    "automated_response"
  ],
  actions: [
    {
      name: "analyzeIncident",
      description: "Analyzes a security incident and provides recommendations",
      parameters: {
        incidentId: "string",
        incidentType: "string",
        severity: "string",
        description: "string",
        sourceIp: "string",
        timestamp: "string"
      }
    },
    {
      name: "checkCompliance",
      description: "Checks security compliance against defined standards",
      parameters: {
        framework: "string",
        controls: "array"
      }
    },
    {
      name: "assessRisk",
      description: "Evaluates and scores security risks",
      parameters: {
        assetId: "string",
        vulnerabilityData: "object"
      }
    },
    {
      name: "generateResponse",
      description: "Generates incident response recommendations",
      parameters: {
        incidentId: "string",
        analysis: "object"
      }
    },
    {
      name: "createReport",
      description: "Creates a detailed security analysis report",
      parameters: {
        timeRange: "string",
        metrics: "array"
      }
    }
  ],
  personality: {
    tone: "professional",
    expertise: "security",
    communication_style: "clear and concise"
  },
  knowledge_base: [
    "MITRE ATT&CK Framework",
    "NIST Cybersecurity Framework",
    "Common security compliance standards",
    "Incident response best practices",
    "Threat intelligence data"
  ]
}; 