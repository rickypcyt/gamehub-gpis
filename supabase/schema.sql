-- Schema SQL para GameHub & Services Ecosystem
-- Ejecutar en SQL Editor de Supabase

-- Tabla de perfiles (se vincula con auth.users de Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'suscriptor' CHECK (role IN ('admin', 'redactor', 'colaborador', 'suscriptor')),
  bio TEXT,
  location TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de videojuegos
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  release_date DATE,
  genre TEXT[],
  platform TEXT[],
  press_score DECIMAL(3,1) CHECK (press_score >= 0 AND press_score <= 10),
  user_score DECIMAL(3,1) CHECK (user_score >= 0 AND user_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de noticias
CREATE TABLE news_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Tabla de blog/opinión
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Tabla de comentarios
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL
);

-- Tabla de multimedia
CREATE TABLE multimedia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'stream', 'trailer')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  platform TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos/calendario
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('launch', 'convention', 'expo')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes de contacto
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Perfiles: Todos pueden leer, solo el dueño puede modificar su perfil
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Games: Todos pueden leer, solo admin/redactor pueden modificar
CREATE POLICY "Games are viewable by everyone" ON games
  FOR SELECT USING (true);

CREATE POLICY "Only staff can modify games" ON games
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

-- News: Publicadas visibles por todos, borradores solo staff
CREATE POLICY "Published news are viewable by everyone" ON news_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Staff can view all news" ON news_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

CREATE POLICY "Only staff can modify news" ON news_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

-- Blog: Publicadas visibles, borradores solo autor/staff
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Authors and staff can view own drafts" ON blog_posts
  FOR SELECT USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

CREATE POLICY "Authors and staff can modify blog" ON blog_posts
  FOR ALL USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

-- Comments: Solo suscriptores registrados pueden comentar
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Subscribers can create comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Multimedia: Todos pueden ver, staff puede modificar
CREATE POLICY "Multimedia is viewable by everyone" ON multimedia
  FOR SELECT USING (true);

CREATE POLICY "Only staff can modify multimedia" ON multimedia
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

-- Events: Todos pueden ver, staff puede modificar
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Only staff can modify events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() 
      AND role IN ('admin', 'redactor')
    )
  );

-- Contact messages: Solo admin puede leer
CREATE POLICY "Only admin can view contact messages" ON contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'suscriptor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
