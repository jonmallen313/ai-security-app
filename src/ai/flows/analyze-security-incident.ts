'use server';

/**
 * @fileOverview Analyzes a security incident and provides a summarized analysis of potential threats and vulnerabilities.
 *
 * - analyzeSecurityIncident - A function that handles the security incident analysis process.
 * - AnalyzeSecurityIncidentInput - The input type for the analyzeSecurityIncident function.
 * - AnalyzeSecurityIncidentOutput - The return type for the analyzeSecurityIncident function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeSecurityIncidentInputSchema = z.object({
  time: z.string().describe('The time of the incident.'),
  sourceIp: z.string().describe('The source IP address of the incident.'),
  threatLevel: z.string().describe('The threat level of the incident.'),
  description: z.string().describe('The description of the incident.'),
  message: z.string().describe('The message content from the user.'),
});
export type AnalyzeSecurityIncidentInput = z.infer<typeof AnalyzeSecurityIncidentInputSchema>;

const AnalyzeSecurityIncidentOutputSchema = z.object({
  analysis: z.string().describe('A summarized analysis of the incident, highlighting potential threats and vulnerabilities.'),
});
export type AnalyzeSecurityIncidentOutput = z.infer<typeof AnalyzeSecurityIncidentOutputSchema>;

const summarizeSecurityIncident = ai.defineTool({
  name: 'summarizeSecurityIncident',
  description: 'Analyzes a security incident and provides a summarized analysis of potential threats and vulnerabilities.',
  inputSchema: z.object({
    time: z.string().describe('The time of the incident.'),
    sourceIp: z.string().describe('The source IP address of the incident.'),
    threatLevel: z.string().describe('The threat level of the incident.'),
    description: z.string().describe('The description of the incident.'),
  }),
  outputSchema: z.object({
    analysis: z.string().describe('A summarized analysis of the incident, highlighting potential threats and vulnerabilities.'),
  }),
}, async (input) => {
  return analyzeSecurityIncidentFlow(input);
});

export async function analyzeSecurityIncident(input: AnalyzeSecurityIncidentInput): Promise<AnalyzeSecurityIncidentOutput> {
  return analyzeSecurityIncidentFlow(input);
}

const analyzeSecurityIncidentPrompt = ai.definePrompt({
  name: 'analyzeSecurityIncidentPrompt',
  tools: [summarizeSecurityIncident],
  input: {
    schema: z.object({
      time: z.string().describe('The time of the incident.'),
      sourceIp: z.string().describe('The source IP address of the incident.'),
      threatLevel: z.string().describe('The threat level of the incident.'),
      description: z.string().describe('The description of the incident.'),
      message: z.string().describe('The message content from the user.'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z.string().describe('A summarized analysis of the incident, highlighting potential threats and vulnerabilities.'),
    }),
  },
  prompt: `You are a security analyst. Analyze the following security incident and the user's message and provide a summarized analysis of potential threats and vulnerabilities.
You have a tool to help you analyze security incidents. It is named summarizeSecurityIncident.

Incident Time: {{{time}}}
Source IP: {{{sourceIp}}}
Threat Level: {{{threatLevel}}}
Description: {{{description}}}

User Message: {{{message}}}

Analysis:`,
});

const analyzeSecurityIncidentFlow = ai.defineFlow<
  typeof AnalyzeSecurityIncidentInputSchema,
  typeof AnalyzeSecurityIncidentOutputSchema
>({
  name: 'analyzeSecurityIncidentFlow',
  inputSchema: AnalyzeSecurityIncidentInputSchema,
  outputSchema: AnalyzeSecurityIncidentOutputSchema,
}, async input => {
  const {output} = await analyzeSecurityIncidentPrompt(input);
  return output!;
});
