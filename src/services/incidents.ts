export interface Incident {
  id: string;
  time: string;
  sourceIp: string;
  threatLevel: string;
  description: string;
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    const response = await fetch("/incidents.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((incident: Omit<Incident, "id">, index: number) => ({
      ...incident,
      id: `${incident.time}-${incident.sourceIp}`, // Generate a unique ID
    })) as Incident[];
  } catch (error) {
    console.error("Could not load incidents from local file:", error);
    return [];
  }
}
