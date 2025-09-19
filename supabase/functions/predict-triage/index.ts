import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated ML Model Logic (in production, this would load a real model)
class TriagePredictor {
  predict(patient: any) {
    const { age, heart_rate, systolic_bp, diastolic_bp, spo2, respiratory_rate, temperature, symptom_severity } = patient;
    
    // Simple rule-based logic for demonstration
    let criticalScore = 0;
    let moderateScore = 0;
    let mildScore = 0;
    const explanations: string[] = [];

    // Age factor
    if (age > 75 || age < 2) {
      criticalScore += 0.3;
      explanations.push(`Age ${age} increases priority (very young or elderly)`);
    } else if (age > 65 || age < 18) {
      moderateScore += 0.2;
      explanations.push(`Age ${age} requires careful monitoring`);
    } else {
      mildScore += 0.1;
    }

    // Heart rate
    if (heart_rate > 120 || heart_rate < 50) {
      criticalScore += 0.4;
      explanations.push(`Heart rate ${heart_rate} bpm is critically abnormal`);
    } else if (heart_rate > 100 || heart_rate < 60) {
      moderateScore += 0.3;
      explanations.push(`Heart rate ${heart_rate} bpm shows mild tachycardia/bradycardia`);
    } else {
      mildScore += 0.2;
    }

    // Blood pressure
    if (systolic_bp > 180 || systolic_bp < 90 || diastolic_bp > 110 || diastolic_bp < 60) {
      criticalScore += 0.4;
      explanations.push(`Blood pressure ${systolic_bp}/${diastolic_bp} mmHg is critically abnormal`);
    } else if (systolic_bp > 140 || diastolic_bp > 90) {
      moderateScore += 0.3;
      explanations.push(`Blood pressure ${systolic_bp}/${diastolic_bp} mmHg shows hypertension`);
    } else {
      mildScore += 0.2;
    }

    // SpO2
    if (spo2 < 90) {
      criticalScore += 0.5;
      explanations.push(`SpO₂ ${spo2}% indicates severe hypoxemia`);
    } else if (spo2 < 95) {
      moderateScore += 0.4;
      explanations.push(`SpO₂ ${spo2}% shows mild hypoxemia`);
    } else {
      mildScore += 0.2;
    }

    // Respiratory rate
    if (respiratory_rate > 30 || respiratory_rate < 8) {
      criticalScore += 0.3;
      explanations.push(`Respiratory rate ${respiratory_rate} breaths/min is critically abnormal`);
    } else if (respiratory_rate > 24 || respiratory_rate < 12) {
      moderateScore += 0.2;
      explanations.push(`Respiratory rate ${respiratory_rate} breaths/min shows tachypnea/bradypnea`);
    } else {
      mildScore += 0.1;
    }

    // Temperature
    if (temperature > 39.5 || temperature < 35) {
      criticalScore += 0.3;
      explanations.push(`Temperature ${temperature}°C indicates severe fever/hypothermia`);
    } else if (temperature > 38.5 || temperature < 36) {
      moderateScore += 0.2;
      explanations.push(`Temperature ${temperature}°C shows fever/mild hypothermia`);
    } else {
      mildScore += 0.1;
    }

    // Symptom severity (patient-reported)
    if (symptom_severity >= 8) {
      criticalScore += 0.4;
      explanations.push(`Patient reports severe symptoms (${symptom_severity}/10)`);
    } else if (symptom_severity >= 5) {
      moderateScore += 0.3;
      explanations.push(`Patient reports moderate symptoms (${symptom_severity}/10)`);
    } else {
      mildScore += 0.2;
      explanations.push(`Patient reports mild symptoms (${symptom_severity}/10)`);
    }

    // Normalize scores
    const total = criticalScore + moderateScore + mildScore;
    const probabilities = {
      critical: criticalScore / total,
      moderate: moderateScore / total,
      mild: mildScore / total
    };

    // Determine triage level
    let triage_level: string;
    let recommended_wait: number;
    let recommended_action: string;

    if (probabilities.critical > 0.4) {
      triage_level = 'Critical';
      recommended_wait = 0;
      recommended_action = 'Immediate assessment and intervention required';
    } else if (probabilities.moderate > 0.4) {
      triage_level = 'Moderate';
      recommended_wait = 30;
      recommended_action = 'Assess within 30 minutes, monitor closely';
    } else {
      triage_level = 'Mild';
      recommended_wait = 120;
      recommended_action = 'Standard assessment, can wait for available resources';
    }

    return {
      triage_level,
      probabilities,
      recommended_wait,
      recommended_action,
      explanation: explanations.slice(0, 3) // Top 3 factors
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patient } = await req.json();
    
    console.log('Received patient data:', patient);

    // Validate required fields
    const requiredFields = ['age', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'spo2', 'respiratory_rate', 'temperature', 'symptom_severity'];
    for (const field of requiredFields) {
      if (patient[field] === undefined || patient[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Make prediction
    const predictor = new TriagePredictor();
    const result = predictor.predict(patient);
    
    console.log('Prediction result:', result);

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from('triage_logs')
      .insert({
        patient,
        triage_level: result.triage_level,
        probabilities: result.probabilities,
        recommended_wait: result.recommended_wait,
        recommended_action: result.recommended_action,
        explanation: result.explanation
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in predict-triage function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: 'Failed to process triage prediction'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});