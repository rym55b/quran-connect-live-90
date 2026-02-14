
-- Enums
CREATE TYPE public.gender_type AS ENUM ('male', 'female');
CREATE TYPE public.user_role_type AS ENUM ('teacher', 'student', 'both');
CREATE TYPE public.session_type AS ENUM ('correction', 'memorization');
CREATE TYPE public.session_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender gender_type NOT NULL,
  role user_role_type NOT NULL DEFAULT 'student',
  rating NUMERIC(3,2) DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Helper function to get current user's gender
CREATE OR REPLACE FUNCTION public.get_my_gender()
RETURNS gender_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gender FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Profiles RLS
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  session_type session_type NOT NULL,
  status session_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read own sessions" ON public.sessions FOR SELECT TO authenticated
  USING (teacher_id = public.get_my_profile_id() OR student_id = public.get_my_profile_id());
CREATE POLICY "Authenticated can create sessions" ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (teacher_id = public.get_my_profile_id() OR student_id = public.get_my_profile_id());
CREATE POLICY "Participants can update own sessions" ON public.sessions FOR UPDATE TO authenticated
  USING (teacher_id = public.get_my_profile_id() OR student_id = public.get_my_profile_id());

-- Ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  rated_by UUID REFERENCES public.profiles(id) NOT NULL,
  rated_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read ratings about them or by them" ON public.ratings FOR SELECT TO authenticated
  USING (rated_by = public.get_my_profile_id() OR rated_user_id = public.get_my_profile_id());
CREATE POLICY "Users can insert ratings" ON public.ratings FOR INSERT TO authenticated
  WITH CHECK (rated_by = public.get_my_profile_id());

-- Invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES public.profiles(id) NOT NULL,
  invitee_id UUID REFERENCES public.profiles(id) NOT NULL,
  session_type session_type NOT NULL DEFAULT 'correction',
  scheduled_time TIMESTAMPTZ,
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_invite CHECK (inviter_id != invitee_id)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invitations" ON public.invitations FOR SELECT TO authenticated
  USING (inviter_id = public.get_my_profile_id() OR invitee_id = public.get_my_profile_id());
CREATE POLICY "Users can create invitations" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (inviter_id = public.get_my_profile_id());
CREATE POLICY "Invitee can update invitation" ON public.invitations FOR UPDATE TO authenticated
  USING (invitee_id = public.get_my_profile_id());

-- Matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gender gender_type NOT NULL,
  role_seeking user_role_type NOT NULL,
  session_type session_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;

CREATE POLICY "Users can read same-gender queue" ON public.matchmaking_queue FOR SELECT TO authenticated
  USING (gender = public.get_my_gender());
CREATE POLICY "Users can insert own queue entry" ON public.matchmaking_queue FOR INSERT TO authenticated
  WITH CHECK (profile_id = public.get_my_profile_id());
CREATE POLICY "Users can delete own queue entry" ON public.matchmaking_queue FOR DELETE TO authenticated
  USING (profile_id = public.get_my_profile_id());

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, gender, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'gender')::gender_type, 'male'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_type, 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update rating average
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (
    SELECT COALESCE(AVG(score), 0)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
  )
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Function to increment sessions count
CREATE OR REPLACE FUNCTION public.update_sessions_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.profiles SET sessions_count = sessions_count + 1 WHERE id = NEW.teacher_id;
    UPDATE public.profiles SET sessions_count = sessions_count + 1 WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_session_completed
  AFTER UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_sessions_count();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
