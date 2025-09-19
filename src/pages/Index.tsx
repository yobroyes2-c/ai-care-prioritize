import { useState } from "react";
import { PatientForm } from "@/components/PatientForm";
import { PredictionResults } from "@/components/PredictionResults";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const Index = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const navigate = useNavigate();

  const handlePrediction = (result: PredictionResult) => {
    setPrediction(result);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">VitalFlow Assist</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Emergency Department Triage</p>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Patient Triage Assessment</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter patient vitals and symptoms to receive AI-powered triage recommendations 
              for emergency department prioritization.
            </p>
          </div>

          {/* Form and Results */}
          <div className="space-y-8">
            <PatientForm onPrediction={handlePrediction} />
            
            {prediction && (
              <div className="animate-in fade-in-50 duration-500">
                <PredictionResults result={prediction} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>VitalFlow Assist - Supporting healthcare professionals with AI-powered triage decisions</p>
            <p className="mt-2">Always use clinical judgment in conjunction with AI recommendations</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
