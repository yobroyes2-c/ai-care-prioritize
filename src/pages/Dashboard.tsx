import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Activity, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TriageLog {
  id: string;
  patient: any;
  triage_level: string;
  probabilities: any;
  recommended_wait: number;
  recommended_action: string;
  explanation: string[];
  created_at: string;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<TriageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('triage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'bg-critical text-critical-foreground';
      case 'moderate':
        return 'bg-moderate text-moderate-foreground';
      case 'mild':
        return 'bg-mild text-mild-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStats = () => {
    const total = logs.length;
    const critical = logs.filter(log => log.triage_level.toLowerCase() === 'critical').length;
    const moderate = logs.filter(log => log.triage_level.toLowerCase() === 'moderate').length;
    const mild = logs.filter(log => log.triage_level.toLowerCase() === 'mild').length;
    
    return { total, critical, moderate, mild };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">VitalFlow Dashboard</h1>
            <p className="text-muted-foreground">Recent triage assessments and statistics</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-critical rounded-full" />
                <div>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-moderate rounded-full" />
                <div>
                  <p className="text-2xl font-bold">{stats.moderate}</p>
                  <p className="text-sm text-muted-foreground">Moderate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-mild rounded-full" />
                <div>
                  <p className="text-2xl font-bold">{stats.mild}</p>
                  <p className="text-sm text-muted-foreground">Mild</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Latest patient triage results</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assessments yet</p>
                <p className="text-sm text-muted-foreground">Start by assessing your first patient</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getTriageColor(log.triage_level)}>
                          {log.triage_level}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDate(log.created_at)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Wait: {log.recommended_wait} min
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Age:</span> {log.patient.age}
                      </div>
                      <div>
                        <span className="font-medium">HR:</span> {log.patient.heart_rate} bpm
                      </div>
                      <div>
                        <span className="font-medium">BP:</span> {log.patient.systolic_bp}/{log.patient.diastolic_bp}
                      </div>
                      <div>
                        <span className="font-medium">SpO₂:</span> {log.patient.spo2}%
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <span className="font-medium">Action:</span> {log.recommended_action}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}