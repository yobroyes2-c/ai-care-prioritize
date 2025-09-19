import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Activity } from "lucide-react";

interface PredictionResult {
  triage_level: string;
  probabilities: {
    mild: number;
    moderate: number;
    critical: number;
  };
  recommended_wait: number;
  recommended_action: string;
  explanation: string[];
}

interface PredictionResultsProps {
  result: PredictionResult;
}

export const PredictionResults = ({ result }: PredictionResultsProps) => {
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

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Triage Assessment Results
        </CardTitle>
        <CardDescription>
          AI-powered analysis of patient condition and priority level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Triage Level */}
        <div className="text-center">
          <Badge 
            className={`text-lg px-4 py-2 ${getTriageColor(result.triage_level)}`}
          >
            {result.triage_level.toUpperCase()} PRIORITY
          </Badge>
        </div>

        {/* Wait Time and Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Recommended Wait Time</p>
              <p className="text-lg font-semibold">{formatWaitTime(result.recommended_wait)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Recommended Action</p>
              <p className="text-lg font-semibold">{result.recommended_action}</p>
            </div>
          </div>
        </div>

        {/* Probabilities */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Priority Probabilities</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Mild</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-mild" 
                    style={{ width: `${result.probabilities.mild * 100}%` }}
                  />
                </div>
                <span className="text-sm">{(result.probabilities.mild * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Moderate</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-moderate" 
                    style={{ width: `${result.probabilities.moderate * 100}%` }}
                  />
                </div>
                <span className="text-sm">{(result.probabilities.moderate * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Critical</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-critical" 
                    style={{ width: `${result.probabilities.critical * 100}%` }}
                  />
                </div>
                <span className="text-sm">{(result.probabilities.critical * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Key Factors</h3>
          <div className="bg-muted p-4 rounded-lg">
            <ul className="space-y-1">
              {result.explanation.map((factor, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};