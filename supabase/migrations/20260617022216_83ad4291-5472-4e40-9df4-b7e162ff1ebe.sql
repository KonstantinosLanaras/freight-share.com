
-- Resolution Center: cases, messages, evidence
CREATE TYPE public.resolution_status AS ENUM ('open','under_review','decision_pending','resolved');
CREATE TYPE public.resolution_issue_type AS ENUM ('late_delivery','cargo_damage','no_show','payment_dispute','route_deviation','other');
CREATE TYPE public.resolution_sender_role AS ENUM ('shipper','carrier','support','system');

-- CASES
CREATE TABLE public.resolution_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  shipper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  carrier_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL REFERENCES auth.users(id),
  issue_type public.resolution_issue_type NOT NULL,
  subject text NOT NULL,
  description text,
  status public.resolution_status NOT NULL DEFAULT 'open',
  shipper_resolved boolean NOT NULL DEFAULT false,
  carrier_resolved boolean NOT NULL DEFAULT false,
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resolution_cases TO authenticated;
GRANT ALL ON public.resolution_cases TO service_role;
ALTER TABLE public.resolution_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties or admins can view cases"
  ON public.resolution_cases FOR SELECT TO authenticated
  USING (auth.uid() IN (shipper_id, carrier_id) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Parties can open cases"
  ON public.resolution_cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (shipper_id, carrier_id) AND auth.uid() = opened_by);

CREATE POLICY "Parties or admins can update cases"
  ON public.resolution_cases FOR UPDATE TO authenticated
  USING (auth.uid() IN (shipper_id, carrier_id) OR public.has_role(auth.uid(),'admin'));

-- MESSAGES
CREATE TABLE public.resolution_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.resolution_cases(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role public.resolution_sender_role NOT NULL,
  body text NOT NULL,
  read_by jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resolution_messages TO authenticated;
GRANT ALL ON public.resolution_messages TO service_role;
ALTER TABLE public.resolution_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case parties or admins can view messages"
  ON public.resolution_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resolution_cases c
    WHERE c.id = case_id
      AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
  ));

CREATE POLICY "Case parties or admins can send messages"
  ON public.resolution_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.resolution_cases c
      WHERE c.id = case_id
        AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
    )
  );

CREATE POLICY "Case parties or admins can mark messages read"
  ON public.resolution_messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resolution_cases c
    WHERE c.id = case_id
      AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
  ));

-- EVIDENCE
CREATE TABLE public.resolution_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.resolution_cases(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  kind text NOT NULL DEFAULT 'other',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resolution_evidence TO authenticated;
GRANT ALL ON public.resolution_evidence TO service_role;
ALTER TABLE public.resolution_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case parties or admins can view evidence"
  ON public.resolution_evidence FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resolution_cases c
    WHERE c.id = case_id
      AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
  ));

CREATE POLICY "Case parties or admins can upload evidence"
  ON public.resolution_evidence FOR INSERT TO authenticated
  WITH CHECK (
    uploader_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.resolution_cases c
      WHERE c.id = case_id
        AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
    )
  );

CREATE POLICY "Uploader or admin can delete evidence"
  ON public.resolution_evidence FOR DELETE TO authenticated
  USING (uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- updated_at trigger
CREATE TRIGGER trg_resolution_cases_updated
  BEFORE UPDATE ON public.resolution_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.resolution_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resolution_cases;
