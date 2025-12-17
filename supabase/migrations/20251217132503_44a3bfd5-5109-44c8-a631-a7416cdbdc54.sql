-- Create enums for the application
CREATE TYPE public.app_role AS ENUM ('shipper', 'carrier', 'admin');
CREATE TYPE public.shipment_status AS ENUM ('posted', 'accepted', 'paid', 'picked_up', 'delivered', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'completed', 'refunded');
CREATE TYPE public.cargo_type AS ENUM ('general', 'fragile', 'refrigerated', 'hazardous', 'oversized', 'livestock', 'vehicles', 'other');
CREATE TYPE public.pricing_type AS ENUM ('fixed', 'open_to_offers');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create loads table
CREATE TABLE public.loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  pickup_date_from DATE NOT NULL,
  pickup_date_to DATE NOT NULL,
  delivery_date_from DATE NOT NULL,
  delivery_date_to DATE NOT NULL,
  pallets INTEGER NOT NULL CHECK (pallets > 0),
  cargo_type cargo_type NOT NULL DEFAULT 'general',
  pricing_type pricing_type NOT NULL DEFAULT 'fixed',
  price DECIMAL(10, 2),
  notes TEXT,
  status shipment_status NOT NULL DEFAULT 'posted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  departure_date_from DATE NOT NULL,
  departure_date_to DATE NOT NULL,
  available_pallets INTEGER NOT NULL CHECK (available_pallets > 0),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create route_stops table
CREATE TABLE public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  available_pallets INTEGER NOT NULL CHECK (available_pallets >= 0),
  stop_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES public.loads(id) ON DELETE CASCADE NOT NULL,
  carrier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  message TEXT,
  is_accepted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES public.loads(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  shipper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  carrier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status shipment_status NOT NULL DEFAULT 'accepted',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  final_price DECIMAL(10, 2) NOT NULL,
  payment_reference TEXT,
  terms_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create shipment_timestamps table
CREATE TABLE public.shipment_timestamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  status shipment_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rated_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (shipment_id, rater_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_timestamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Insert user role from metadata
  IF NEW.raw_user_meta_data ->> 'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data ->> 'role')::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loads_updated_at BEFORE UPDATE ON public.loads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view others roles" ON public.user_roles FOR SELECT USING (true);

-- RLS Policies for loads
CREATE POLICY "Loads are viewable by everyone" ON public.loads FOR SELECT USING (true);
CREATE POLICY "Shippers can create loads" ON public.loads FOR INSERT WITH CHECK (auth.uid() = shipper_id AND public.has_role(auth.uid(), 'shipper'));
CREATE POLICY "Shippers can update own loads" ON public.loads FOR UPDATE USING (auth.uid() = shipper_id);
CREATE POLICY "Shippers can delete own loads" ON public.loads FOR DELETE USING (auth.uid() = shipper_id);

-- RLS Policies for routes
CREATE POLICY "Routes are viewable by everyone" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Carriers can create routes" ON public.routes FOR INSERT WITH CHECK (auth.uid() = carrier_id AND public.has_role(auth.uid(), 'carrier'));
CREATE POLICY "Carriers can update own routes" ON public.routes FOR UPDATE USING (auth.uid() = carrier_id);
CREATE POLICY "Carriers can delete own routes" ON public.routes FOR DELETE USING (auth.uid() = carrier_id);

-- RLS Policies for route_stops
CREATE POLICY "Route stops are viewable by everyone" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Carriers can manage route stops" ON public.route_stops FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND carrier_id = auth.uid())
);
CREATE POLICY "Carriers can update own route stops" ON public.route_stops FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND carrier_id = auth.uid())
);
CREATE POLICY "Carriers can delete own route stops" ON public.route_stops FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND carrier_id = auth.uid())
);

-- RLS Policies for offers
CREATE POLICY "Load owners and carriers can view offers" ON public.offers FOR SELECT USING (
  auth.uid() = carrier_id OR 
  EXISTS (SELECT 1 FROM public.loads WHERE id = load_id AND shipper_id = auth.uid())
);
CREATE POLICY "Carriers can create offers" ON public.offers FOR INSERT WITH CHECK (auth.uid() = carrier_id AND public.has_role(auth.uid(), 'carrier'));
CREATE POLICY "Carriers can update own offers" ON public.offers FOR UPDATE USING (auth.uid() = carrier_id);

-- RLS Policies for shipments
CREATE POLICY "Shipment parties can view" ON public.shipments FOR SELECT USING (auth.uid() = shipper_id OR auth.uid() = carrier_id);
CREATE POLICY "System can create shipments" ON public.shipments FOR INSERT WITH CHECK (auth.uid() = shipper_id);
CREATE POLICY "Parties can update shipments" ON public.shipments FOR UPDATE USING (auth.uid() = shipper_id OR auth.uid() = carrier_id);

-- RLS Policies for shipment_timestamps
CREATE POLICY "Shipment parties can view timestamps" ON public.shipment_timestamps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_id AND (shipper_id = auth.uid() OR carrier_id = auth.uid()))
);
CREATE POLICY "Parties can create timestamps" ON public.shipment_timestamps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_id AND (shipper_id = auth.uid() OR carrier_id = auth.uid()))
);

-- RLS Policies for messages
CREATE POLICY "Shipment parties can view messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_id AND (shipper_id = auth.uid() OR carrier_id = auth.uid()))
);
CREATE POLICY "Shipment parties can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_id AND (shipper_id = auth.uid() OR carrier_id = auth.uid()))
);

-- RLS Policies for ratings
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Shipment parties can create ratings" ON public.ratings FOR INSERT WITH CHECK (
  auth.uid() = rater_id AND
  EXISTS (SELECT 1 FROM public.shipments WHERE id = shipment_id AND (shipper_id = auth.uid() OR carrier_id = auth.uid()))
);