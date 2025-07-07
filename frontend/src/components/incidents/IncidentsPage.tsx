import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

// Define the structure of a traffic incident
interface TrafficIncident {
  type: string;
  properties: {
    id: string;
    iconCategory: string;
    magnitudeOfDelay: string;
    startTime: string;
    endTime: string;
    from: string;
    to: string;
    length: number;
    delay: number;
    roadNumbers: string[];
    events: {
      description: string;
      code: number;
    }[];
  };
}

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        // Hardcoding 'nairobi' for now, this can be made dynamic later
        const response = await apiService.getLiveIncidents('nairobi');
        if (response.success) {
          setIncidents(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch incidents.');
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Live Traffic Incidents</h1>
        <Link to="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading incidents...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && incidents.length === 0 && (
        <p>No live incidents reported at the moment.</p>
      )}

      {!loading && !error && incidents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident) => (
            <Card key={incident.properties.id}>
              <CardHeader>
                <CardTitle className="text-lg">{incident.properties.events[0]?.description || 'Incident'}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p><strong>From:</strong> {incident.properties.from}</p>
                <p><strong>To:</strong> {incident.properties.to}</p>
                <p><strong>Delay:</strong> {Math.round(incident.properties.delay / 60)} minutes</p>
                <p><strong>Started:</strong> {new Date(incident.properties.startTime).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
