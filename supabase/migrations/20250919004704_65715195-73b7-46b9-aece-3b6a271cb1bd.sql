-- Create triage_logs table for storing prediction results
CREATE TABLE public.triage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient JSONB NOT NULL,
  triage_level TEXT NOT NULL CHECK (triage_level IN ('Critical', 'Moderate', 'Mild')),
  probabilities JSONB NOT NULL,
  recommended_wait INTEGER NOT NULL,
  recommended_action TEXT NOT NULL,
  explanation TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.triage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for medical staff)
CREATE POLICY "Anyone can view triage logs" 
ON public.triage_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create triage logs" 
ON public.triage_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_triage_logs_updated_at
BEFORE UPDATE ON public.triage_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();