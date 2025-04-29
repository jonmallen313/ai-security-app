import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RiskAssessmentResponse } from '@/services/api';

interface RiskAssessmentProps {
  assessment: RiskAssessmentResponse;
}

export function RiskAssessment({ assessment }: RiskAssessmentProps) {
  // Calculate color based on risk level
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Calculate progress color based on risk score
  const getProgressColor = (score: number) => {
    if (score >= 7) return 'bg-red-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Risk Assessment</span>
          <Badge 
            variant={assessment.riskLevel === 'High' ? 'destructive' : assessment.riskLevel === 'Medium' ? 'default' : 'outline'}
          >
            {assessment.riskLevel} Risk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Risk Score</span>
              <span className={`text-sm font-medium ${getRiskColor(assessment.riskLevel)}`}>
                {assessment.riskScore}/10
              </span>
            </div>
            <Progress 
              value={(assessment.riskScore / 10) * 100} 
              className={getProgressColor(assessment.riskScore)}
            />
          </div>
          
          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc pl-4 space-y-1">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 