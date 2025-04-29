import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportResponse } from '@/services/api';

interface SecurityReportProps {
  report: ReportResponse['report'];
}

export function SecurityReport({ report }: SecurityReportProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
        <p className="text-sm text-gray-500">
          Generated on {new Date(report.generatedAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <div className="text-sm text-gray-500">Total Incidents</div>
                <div className="text-2xl font-bold">{report.summary.totalIncidents}</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-md">
                <div className="text-sm text-gray-500">Critical Incidents</div>
                <div className="text-2xl font-bold text-red-500">{report.summary.criticalIncidents}</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md">
                <div className="text-sm text-gray-500">Resolved Incidents</div>
                <div className="text-2xl font-bold text-green-500">{report.summary.resolvedIncidents}</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-gray-500">Avg. Resolution Time</div>
                <div className="text-2xl font-bold text-blue-500">{report.summary.averageResolutionTime}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(report.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 border rounded-md">
                  <span className="font-medium">{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {report.recommendations && report.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc pl-4 space-y-1">
                {report.recommendations.map((rec, index) => (
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