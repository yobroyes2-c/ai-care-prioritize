import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PatientData {
  age: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  spo2: number;
  respiratory_rate: number;
  temperature: number;
  symptom_severity: number;
}

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

interface PatientFormProps {
  onPrediction: (result: PredictionResult) => void;
}

export const PatientForm = ({ onPrediction }: PatientFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PatientData>({
    age: 0,
    heart_rate: 0,
    systolic_bp: 0,
    diastolic_bp: 0,
    spo2: 0,
    respiratory_rate: 0,
    temperature: 0,
    symptom_severity: 1
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-triage', {
        body: { patient: formData }
      });

      if (error) throw error;

      onPrediction(data);
      toast({
        title: "Prediction Complete",
        description: `Patient classified as ${data.triage_level} priority`
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: "Unable to process patient data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Assessment</CardTitle>
        <CardDescription>
          Enter patient vitals and symptoms for AI-powered triage prediction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
            <Input
              id="heart_rate"
              type="number"
              value={formData.heart_rate || ''}
              onChange={(e) => handleInputChange('heart_rate', e.target.value)}
              placeholder="60-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systolic_bp">Systolic BP (mmHg)</Label>
            <Input
              id="systolic_bp"
              type="number"
              value={formData.systolic_bp || ''}
              onChange={(e) => handleInputChange('systolic_bp', e.target.value)}
              placeholder="90-140"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diastolic_bp">Diastolic BP (mmHg)</Label>
            <Input
              id="diastolic_bp"
              type="number"
              value={formData.diastolic_bp || ''}
              onChange={(e) => handleInputChange('diastolic_bp', e.target.value)}
              placeholder="60-90"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spo2">SpO₂ (%)</Label>
            <Input
              id="spo2"
              type="number"
              value={formData.spo2 || ''}
              onChange={(e) => handleInputChange('spo2', e.target.value)}
              placeholder="95-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="respiratory_rate">Respiratory Rate (breaths/min)</Label>
            <Input
              id="respiratory_rate"
              type="number"
              value={formData.respiratory_rate || ''}
              onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
              placeholder="12-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature || ''}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              placeholder="36.5-37.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptom_severity">Symptom Severity (1-10)</Label>
            <Input
              id="symptom_severity"
              type="number"
              min="1"
              max="10"
              value={formData.symptom_severity || ''}
              onChange={(e) => handleInputChange('symptom_severity', e.target.value)}
              placeholder="1-10"
            />
          </div>
        </div>
        <Button 
          onClick={handlePredict} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Analyzing..." : "Predict Triage Level"}
        </Button>
      </CardContent>
    </Card>
  );
};