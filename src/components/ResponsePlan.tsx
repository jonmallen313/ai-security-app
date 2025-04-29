import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsePlan as ResponsePlanType } from '@/services/api';

interface ResponsePlanProps {
  responsePlan: ResponsePlanType;
  onExecuteStep: (stepIndex: number) => void;
}

export function ResponsePlan({ responsePlan, onExecuteStep }: ResponsePlanProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Response Plan</span>
          <Badge variant={responsePlan.priority === 'High' ? 'destructive' : 'default'}>
            {responsePlan.priority} Priority
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Estimated time to complete: {responsePlan.estimatedTime}
          </div>
          
          <div className="space-y-2">
            {responsePlan.steps.map((step, index) => (
              <div key={index} className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Step {step.order}: {step.action}</div>
                  <Badge variant="outline">{step.assignee}</Badge>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onExecuteStep(index)}
                >
                  Mark Complete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 