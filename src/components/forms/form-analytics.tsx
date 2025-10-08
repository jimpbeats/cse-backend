import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, Clock, Users, Star } from 'lucide-react';

interface AnalyticsProps {
  responses: Array<{
    id: string;
    form_slug: string;
    data: Record<string, any>;
    submitted_at: string;
  }>;
  fields: Array<{
    id: string;
    type: string;
    label: string;
  }>;
}

export function FormAnalytics({ responses, fields }: AnalyticsProps) {
  // Calculate basic metrics
  const totalResponses = responses.length;
  const lastResponse = responses[0]?.submitted_at ? new Date(responses[0].submitted_at) : null;
  const averageFieldCompletion = responses.reduce((acc, response) => {
    const filledFields = Object.keys(response.data).length;
    return acc + (filledFields / fields.length);
  }, 0) / (responses.length || 1);

  // Get field completion rates
  const fieldCompletionRates = fields.reduce((acc, field) => {
    const filledCount = responses.filter(r => r.data[field.label]).length;
    return {
      ...acc,
      [field.label]: (filledCount / totalResponses) * 100
    };
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            {lastResponse && (
              <p className="text-xs text-gray-500">
                Last response: {lastResponse.toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(averageFieldCompletion * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              Average fields completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.length > 1
                ? Math.round(
                    (new Date(responses[0].submitted_at).getTime() -
                      new Date(responses[responses.length - 1].submitted_at).getTime()) /
                      (responses.length * 1000 * 60)
                  )
                : 0}
              min
            </div>
            <p className="text-xs text-gray-500">
              Average time between responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Field Completion Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Field Completion Analysis</CardTitle>
          <CardDescription>
            See which fields are most commonly filled out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(fieldCompletionRates).map(([field, rate]) => (
              <div key={field} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{field}</span>
                  <span>{rate.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}