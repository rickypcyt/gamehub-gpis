-- Seed data para Game-Hub & Services Ecosystem
-- Datos de prueba realistas para el proyecto

-- Hashes de contraseñas generados con bcrypt.hash("password123", 10)
-- Para generar nuevos hashes, usar: bcrypt.hash("password", 10)

-- 1. Perfiles de usuario (4 roles: admin, redactor, colaborador, suscriptor)
-- Limpiar primero para permitir actualizaciones
DELETE FROM profiles WHERE id IN ('admin-001', 'redactor-001', 'redactor-002', 'colaborador-001', 'colaborador-002', 'suscriptor-001', 'suscriptor-002', 'suscriptor-003');
INSERT INTO profiles (id, email, name, role, bio, location, website, avatar_url, password_hash, created_at, updated_at) VALUES
-- Admin
('admin-001', 'admin@gamehub.com', 'Carlos García', 'admin', 'Director editorial y fundador de GameHub. Apasionado por la industria desde los tiempos del NES.', 'Madrid, España', 'https://twitter.com/gamedirector', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', '$2a$10$X7w3E8v9J2K5L6M4N1P8Qe9Z2Y5X8W1V0U3T4S5R6Q7W8E9R0T1Y2', NOW(), NOW()),
-- Redactores
('redactor-001', 'maria.lopez@gamehub.com', 'María López', 'redactor', 'Especialista en RPGs y juegos de rol. 10 años cubriendo E3 y Gamescom.', 'Barcelona, España', 'https://twitter.com/mariagaming', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', '$2a$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6', NOW(), NOW()),
('redactor-002', 'alex.kim@gamehub.com', 'Alex Kim', 'redactor', 'Periodista de tecnología y gaming. Anteriormente en IGN y Kotaku.', 'Seúl, Corea del Sur', 'https://twitter.com/alexkimgaming', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', '$2a$10$B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7', NOW(), NOW()),
-- Colaboradores
('colaborador-001', 'james.wilson@gmail.com', 'James Wilson', 'colaborador', 'Streamer y creador de contenido. 500K seguidores en Twitch.', 'London, UK', 'https://twitch.tv/jamesgaming', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', '$2a$10$C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8', NOW(), NOW()),
('colaborador-002', 'sofia.martinez@gamehub.com', 'Sofía Martínez', 'colaborador', 'Desarrolladora indie y consultora de diseño de juegos.', 'Buenos Aires, Argentina', 'https://sofiagames.dev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', '$2a$10$D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9', NOW(), NOW()),
-- Suscriptores
('suscriptor-001', 'user1@gmail.com', 'Pedro Sánchez', 'suscriptor', 'Gamer casual desde hace 5 años. Fan de FIFA y CoD.', 'Valencia, España', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', '$2a$10$E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0', NOW(), NOW()),
('suscriptor-002', 'user2@hotmail.com', 'Emma Thompson', 'suscriptor', 'Amante de los juegos indie y retro. Coleccionista de consolas.', 'Manchester, UK', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', '$2a$10$F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1', NOW(), NOW()),
('suscriptor-003', 'user3@yahoo.com', 'Lucas Silva', 'suscriptor', 'Competitivo de Valorant y League of Legends. Rango Diamond.', 'São Paulo, Brasil', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', '$2a$10$G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2', NOW(), NOW());

-- 2. Videojuegos con scores (Lanzamientos 2026 - Fechas reales de GameSpot)
DELETE FROM games WHERE id LIKE 'game-%';
INSERT INTO games (id, title, description, cover_image, release_date, genre, platform, press_score, user_score, created_at, updated_at) VALUES
-- Febrero 2026
('game-001', 'Nioh 3', 'El regreso de la saga de acción RPG de Team Ninja con combate más profundo y un nuevo escenario histórico.', 'https://placehold.co/600x800/111827/f9fafb?text=Nioh+3', '2026-02-06', ARRAY['RPG', 'Acción', 'Souls-like'], ARRAY['PS5'], 0, 0, NOW(), NOW()),
('game-002', 'God of War: Sons of Sparta', 'Nueva entrega de la saga nórdica centrada en Atreus y sus hermanos desconocidos.', 'https://placehold.co/600x800/1a1a2e/f5f5f5?text=God+of+War%3A+Sons+of+Sparta', '2026-02-12', ARRAY['Acción', 'Aventura', 'Hack and Slash'], ARRAY['PS5'], 0, 0, NOW(), NOW()),
('game-003', 'Mario Tennis Fever', 'El deporte blanco llega a Switch 2 con físicas mejoradas y modo historia.', 'https://placehold.co/600x800/e60012/ffffff?text=Mario+Tennis+Fever', '2026-02-12', ARRAY['Deportes', 'Arcade'], ARRAY['Switch 2'], 0, 0, NOW(), NOW()),
('game-004', 'High on Life 2', 'Secuela del shooter cómico de Squanch Games con más armas parlantes y humor absurdo.', 'https://placehold.co/600x800/4a148c/ffffff?text=High+on+Life+2', '2026-02-13', ARRAY['Shooter', 'Acción', 'Comedia'], ARRAY['PS5', 'Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),
('game-005', 'Dragon Quest VII Reimagined', 'Remake completo del clásico de PS1 con visuales modernos y sistema de vocaciones rediseñado.', 'https://placehold.co/600x800/1565c0/ffffff?text=Dragon+Quest+VII+Reimagined', '2026-02-05', ARRAY['RPG', 'JRPG', 'Aventura'], ARRAY['PS5', 'Xbox Series X|S', 'Switch 2', 'Switch', 'PC'], 0, 0, NOW(), NOW()),

-- Marzo 2026
('game-006', 'Marathon', 'El regreso de la saga FPS de Bungie como extract shooter competitivo.', 'https://placehold.co/600x800/212121/ffffff?text=Marathon', '2026-03-05', ARRAY['Shooter', 'FPS', 'Multiplayer'], ARRAY['PS5', 'Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),
('game-007', 'Fatal Frame II: Crimson Butterfly Remake', 'Remake del survival horror japonés más terrorífico de PS2 y Xbox.', 'https://placehold.co/600x800/2b0f16/fef2f2?text=Fatal+Frame+II%3A+Crimson+Butterfly+Remake', '2026-03-12', ARRAY['Survival Horror', 'Aventura'], ARRAY['PS5', 'Xbox Series X|S', 'Switch 2', 'PC'], 0, 0, NOW(), NOW()),
('game-008', 'WWE 2K26', 'La nueva entrega anual de lucha libre con roster ampliado y modo MyGM mejorado.', 'https://placehold.co/600x800/d32f2f/ffffff?text=WWE+2K26', '2026-03-13', ARRAY['Deportes', 'Lucha Libre', 'Simulación'], ARRAY['PS5', 'Xbox Series X|S', 'Switch 2', 'PC'], 0, 0, NOW(), NOW()),
('game-009', 'Crimson Desert', 'RPG de acción de mundo abierto de Pearl Abyss con combate dinámico y cinemáticas épicas.', 'https://placehold.co/600x800/5b1b1b/ffffff?text=Crimson+Desert', '2026-03-19', ARRAY['RPG', 'Acción', 'Mundo Abierto'], ARRAY['PS5', 'Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),
('game-010', 'Death Stranding 2: On The Beach', 'La secuela del juego de Kojima llega a PC con nuevas mecánicas de entrega y conexión.', 'https://placehold.co/600x800/0f172a/e2e8f0?text=Death+Stranding+2%3A+On+The+Beach', '2026-03-19', ARRAY['Acción', 'Aventura', 'Caminante'], ARRAY['PC'], 0, 0, NOW(), NOW()),
('game-011', 'Monster Hunter Stories 3: Twisted Reflection', 'El RPG por turnos de la saga Monster Hunter regresa con sistema de monturas expandido.', 'https://placehold.co/600x800/ff6f00/ffffff?text=Monster+Hunter+Stories+3', '2026-03-13', ARRAY['RPG', 'Aventura', 'Monstruos'], ARRAY['PS5', 'Xbox Series X|S', 'Switch 2', 'PC'], 0, 0, NOW(), NOW()),

-- Mayo 2026
('game-012', 'Forza Horizon 6', 'El festival de carreras arcade se muda a un nuevo escenario exótico con físicas mejoradas.', 'https://placehold.co/600x800/e65100/ffffff?text=Forza+Horizon+6', '2026-05-19', ARRAY['Carreras', 'Mundo Abierto', 'Arcade'], ARRAY['Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),

-- Junio 2026
('game-013', 'Gothic 1 Remake', 'Remake fiel del RPG alemán clásico con visuales modernos pero mecánicas originales conservadas.', 'https://placehold.co/600x800/374151/f9fafb?text=Gothic+1+Remake', '2026-06-05', ARRAY['RPG', 'Aventura', 'Mundo Abierto'], ARRAY['PS5', 'Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),
('game-014', 'Dead or Alive 6 Last Round', 'La última actualización del juego de lucha con todos los personajes y trajes.', 'https://placehold.co/600x800/b91c1c/ffffff?text=Dead+or+Alive+6+Last+Round', '2026-06-25', ARRAY['Lucha', 'Arcade', 'Acción'], ARRAY['PS5', 'Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),

-- Agosto 2026
('game-015', 'Metal Gear Solid Master Collection Vol. 2', 'Incluye MGS4, Peace Walker y Metal Gear Rising: Revengeance remasterizados.', 'https://placehold.co/600x800/2e7d32/ffffff?text=MGS+Master+Collection+Vol.2', '2026-08-27', ARRAY['Acción', 'Sigilo', 'Aventura'], ARRAY['PS5', 'Xbox Series X|S', 'Switch 2', 'Switch', 'PC'], 0, 0, NOW(), NOW()),

-- Septiembre 2026
('game-016', 'Phantom Blade Zero', 'El juego de acción souls-like de S-Game con estética wuxia y combate rápido.', 'https://placehold.co/600x800/111827/f5f5f5?text=Phantom+Blade+Zero', '2026-09-09', ARRAY['Acción', 'Souls-like', 'Wuxia'], ARRAY['PS5', 'PC'], 0, 0, NOW(), NOW()),
('game-017', 'Marvel''s Wolverine', 'El exclusivo de Insomniac centrado en Logan con violencia y historia madura.', 'https://placehold.co/600x800/b71c1c/ffffff?text=Marvel%27s+Wolverine', '2026-09-15', ARRAY['Acción', 'Aventura', 'Superhéroes'], ARRAY['PS5'], 0, 0, NOW(), NOW()),

-- Noviembre 2026
('game-018', 'Grand Theft Auto 6', 'El juego más esperado de la década. Vice City regresa con protagonistas femenina y masculina.', 'https://placehold.co/600x800/1a1a1a/ffffff?text=Grand+Theft+Auto+VI', '2026-11-19', ARRAY['Acción', 'Aventura', 'Mundo Abierto'], ARRAY['PS5', 'Xbox Series X|S'], 0, 0, NOW(), NOW()),

-- Juegos sin fecha confirmada pero esperados en 2026
('game-019', 'Fable', 'El reboot de la saga RPG de fantasía de Playground Games.', 'https://placehold.co/600x800/7b1fa2/ffffff?text=Fable', '2026-12-31', ARRAY['RPG', 'Aventura', 'Fantasía'], ARRAY['Xbox Series X|S', 'PC', 'PS5'], 0, 0, NOW(), NOW()),
('game-020', 'Subnautica 2', 'La secuela del survival acuático entra en early access.', 'https://placehold.co/600x800/00695c/ffffff?text=Subnautica+2', '2026-12-31', ARRAY['Survival', 'Aventura', 'Acuático'], ARRAY['Xbox Series X|S', 'PC'], 0, 0, NOW(), NOW()),

-- Juegos clásicos con mejores scores
('game-021', 'The Legend of Zelda: Tears of the Kingdom', 'La épica secuela de Breath of the Wild con nuevas mecánicas de construcción y un mundo aún más vasto.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5n8h.jpg', '2023-05-12', ARRAY['Aventura', 'Acción', 'Mundo Abierto'], ARRAY['Switch'], 96, 88, NOW(), NOW()),
('game-022', 'God of War Ragnarök', 'El épico cierre de la saga nórdica de Kratos y Atreus. Combates épicos contra dioses y criaturas míticas.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5xex.jpg', '2022-11-09', ARRAY['Acción', 'Aventura', 'Hack and Slash'], ARRAY['PS5', 'PS4'], 94, 89, NOW(), NOW()),
('game-023', 'Final Fantasy VII Rebirth', 'La segunda parte del remake de Final Fantasy VII con mundo abierto y sistemas de combate refinados.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6z1i.jpg', '2024-02-29', ARRAY['RPG', 'Acción', 'Aventura'], ARRAY['PS5'], 92, 89, NOW(), NOW()),
('game-024', 'Baldur''s Gate 3', 'El RPG de Larian Studios basado en D&D 5e con narrativa ramificada y combate por turnos épico.', 'https://images.igdb.com/igdb/image/upload/t_original/co670h.webp', '2023-08-03', ARRAY['RPG', 'Aventura', 'Estrategia'], ARRAY['PC', 'PS5', 'Xbox Series X|S'], 96, 90, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Noticias (actualidad del sector)
INSERT INTO news_posts (id, title, slug, excerpt, content, cover_image, published, featured, views, author_id, created_at, updated_at) VALUES
('news-001', '[RUMOR] PlayStation 6: Expectativas para 2028', 'playstation-6-rumores-2028', 'Sony estaría trabajando en la próxima generación de consolas con arquitectura revolucionaria.', 'Según fuentes cercanas a Sony, PlayStation 6 llegaría en 2028 con una arquitectura completamente nueva que permitiría compatibilidad con parte del catálogo anterior. También se rumorea integración con cloud gaming de forma nativa y mejoras significativas en el sistema de ray-tracing.

La industria espera que Sony mantenga su enfoque en exclusivos de alta calidad, pero con mayor énfasis en servicios de suscripción.

Nota: Esta información es un rumor no confirmado por Sony.', 'https://image.api.playstation.com/vulcan/ap/rnd/202401/0100/ps6-concept.jpg', true, true, 15420, 'redactor-001', NOW() - INTERVAL '2 days', NOW()),
('news-002', 'Nintendo anuncia sucesor de Switch para 2025', 'nintendo-sucesor-switch-2025', 'La consola híbrida tendrá mejoras gráficas significativas y mantendrá el concepto portátil.', 'Nintendo ha confirmado que está desarrollando el sucesor de Switch, previsto para lanzarse en 2025. La nueva consola mantendrá el factor forma híbrido que hizo exitoso al original, pero con especificaciones mucho más potentes que permitirán juegos más ambiciosos.

Se espera que la nueva consola sea compatible con los juegos de Switch actuales, similar a cómo PS5 es compatible con PS4.', 'https://www.nintendo.com/images/switch-successor.jpg', true, true, 12350, 'redactor-002', NOW() - INTERVAL '3 days', NOW()),
('news-003', 'Xbox Game Pass alcanza 30 millones de suscriptores', 'xbox-game-pass-30-millones', 'El servicio de suscripción de Microsoft continúa su crecimiento imparable.', 'Microsoft ha anunciado que Xbox Game Pass ha superado los 30 millones de suscriptores activos. Este hito demuestra la viabilidad del modelo de suscripción en gaming, aunque la empresa reconoce que necesita más juegos de primera parte para mantener el momentum.

Phil Spencer, jefe de Xbox, ha prometido más anuncios de estudios internos en los próximos meses.', 'https://news.xbox.com/en-us/2024/game-pass-30m.jpg', true, false, 8920, 'redactor-001', NOW() - INTERVAL '5 days', NOW()),
('news-004', 'El auge de los juegos indie en 2024', 'auge-juegos-indie-2024', 'Títulos independientes dominan las listas de mejores valorados del año.', '2024 está siendo un año excepcional para los juegos independientes. Títulos como "Animal Well", "Another Crab''s Treasure" y "Pizza Tower" han recibido aclamación universal y demuestran que los pequeños estudios pueden competir con los grandes en calidad e innovación.

La accesibilidad de herramientas de desarrollo como Unity y Godot ha democratizado la creación de juegos.', 'https://cdn.cloudflare.steamstatic.com/steam/apps/indie-2024.jpg', true, false, 6780, 'redactor-002', NOW() - INTERVAL '7 days', NOW()),
('news-005', 'IA en el desarrollo de juegos: ¿El futuro o la amenaza?', 'ia-desarrollo-juegos-futuro-amenaza', 'La inteligencia artificial promete revolucionar pero también preocupa a los desarrolladores.', 'La inteligencia artificial generativa está entrando en el desarrollo de juegos de formas que antes eran impensables. Desde generación de assets hasta creación de NPCs con comportamiento realista, las herramientas de IA prometen acelerar el desarrollo.

Sin embargo, muchos desarrolladores temen que esto pueda llevar a reducción de puestos de trabajo y homogeneización del contenido. La industria debate cómo regular su uso ético.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995', true, false, 11200, 'redactor-001', NOW() - INTERVAL '10 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Posts de blog de opinión
DELETE FROM blog_posts WHERE id LIKE 'blog-%';
INSERT INTO blog_posts (id, title, slug, content, published, author_id, created_at, updated_at) VALUES
('blog-001', 'Por qué los Souls-like son el género más influyente de la década', 'soulslike-genero-influyente-decada', 'Desde Demon''s Souls hasta Elden Ring, el género creado por FromSoftware ha redefinido qué significa dificultad en videojuegos. Su influencia se extiende a juegos tan diversos como Starfield, God of War e incluso indie como Hollow Knight.

La clave del éxito no es solo la dificultad, sino el diseño de niveles interconectados, la narrativa ambiental y la satisfacción de superar obstáculos aparentemente imposibles. Los jugadores han aprendido a valorar el esfuerzo sobre la gratificación instantánea.

Este género ha enseñado a toda la industria que los jugadores están dispuestos a aceptar desafíos si el diseño es justo y la recompensa merecida.', true, 'colaborador-001', NOW() - INTERVAL '4 days', NOW()),
('blog-002', 'El declive de los AAA y el renacimiento de los AA', 'decline-aaa-renaissance-aa', 'Los presupuestos de los juegos AAA han alcanzado niveles insostenibles. Cuando un juego necesita vender 5 millones de copias solo para recuperar costes, el riesgo es demasiado alto. Esto explica por qué vemos tantas secuelas y tan poca innovación.

Los juegos AA (double-A) están llenando ese vacío: proyectos con presupuesto moderado pero visión artística clara. Títulos como Hi-Fi Rush, Pizza Tower y Sea of Stars demuestran que no necesitas 200 millones de dólares para hacer algo excelente.

Creo que el futuro de la industria está en estos proyectos medianos que pueden arriesgar más.', true, 'colaborador-002', NOW() - INTERVAL '8 days', NOW()),
('blog-003', 'Mi experiencia como streamer full-time durante un año', 'experiencia-streamer-fulltime-ano', 'Hace un año dejé mi trabajo corporativo para dedicarme a streaming a tiempo completo. Ha sido el año más difícil pero más gratificante de mi vida.

Lo que no te cuentan: no es solo jugar. Es edición, marketing, gestión de comunidad, negociación de sponsors y mantener una mentalidad saludable. Los días que no ganas espectadores duelen más que los días en los que no ganas dinero.

Pero cuando llegas a un hito, cuando la comunidad te apoya en un momento difícil, cuando un juego te hace reír con miles de personas... vale la pena. No es para todos, pero para mí es el mejor trabajo del mundo.', true, 'colaborador-001', NOW() - INTERVAL '12 days', NOW()),
('blog-004', 'La importancia de la accesibilidad en videojuegos', 'importancia-accesibilidad-videojuegos', 'Como diseñadora de juegos, veo a menudo cómo la accesibilidad se trata como una "extra" o algo opcional. Pero debería ser parte fundamental del diseño desde el inicio.

Juegos como The Last of Us Part II, God of War Ragnarök y Hades demuestran que las opciones de accesibilidad no restan valor a la experiencia; al contrario, permiten que más personas disfruten del arte que creamos.

Subtítulos, control remapeable, modo de alto contraste, dificultad ajustable... estas no son características "nice to have", son esenciales para que gaming sea verdaderamente para todos.', true, 'colaborador-002', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Comentarios en blog
DELETE FROM comments WHERE id LIKE 'comment-%';
INSERT INTO comments (id, content, author_id, post_id, created_at, updated_at) VALUES
('comment-001', 'Totalmente de acuerdo. Elden Ring cambió mi forma de ver los juegos. Antes evitaba todo lo difícil, ahora busco el desafío.', 'suscriptor-001', 'blog-001', NOW() - INTERVAL '3 days', NOW()),
('comment-002', 'Interesante perspectiva sobre los AA. Creo que también hay espacio para ambos tipos de juegos, pero el punto sobre el riesgo es muy válido.', 'suscriptor-002', 'blog-002', NOW() - INTERVAL '7 days', NOW()),
('comment-003', '¡Felicidades por el año! Sigo tu stream desde hace tiempo y se nota el esfuerzo que pones. ¡Sigue así!', 'suscriptor-003', 'blog-003', NOW() - INTERVAL '11 days', NOW()),
('comment-004', 'Excelente artículo sobre accesibilidad. Como gamer con discapacidad visual, agradezco mucho cuando los desarrolladores piensan en nosotros.', 'suscriptor-001', 'blog-004', NOW() - INTERVAL '14 days', NOW()),
('comment-005', 'Los Souls-like no son para todos. Yo prefiero juegos que pueda disfrutar sin frustrarme. Cada uno sus gustos.', 'suscriptor-002', 'blog-001', NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Multimedia (vídeos, streams, trailers)
DELETE FROM multimedia WHERE id LIKE 'multimedia-%';
INSERT INTO multimedia (id, title, type, url, thumbnail, platform, featured, created_at) VALUES
('multimedia-001', 'Trailer Oficial - GTA VI', 'trailer', 'https://www.youtube.com/watch?v=QdBZY2fkU-0', 'https://i.ytimg.com/vi/QdBZY2fkU-0/maxresdefault.jpg', 'YouTube', true, NOW() - INTERVAL '1 day'),
('multimedia-002', 'Gameplay - Baldur''s Gate 3: Act 3 Final', 'video', 'https://www.youtube.com/watch?v=example1', 'https://i.ytimg.com/vi/example1/maxresdefault.jpg', 'YouTube', true, NOW() - INTERVAL '3 days'),
('multimedia-003', 'Stream en vivo: Speedrun de Hollow Knight', 'stream', 'https://www.twitch.tv/jamesgaming', 'https://static-cdn.jtvnw.net/previews-ttv/live_user_jamesgaming.jpg', 'Twitch', false, NOW() - INTERVAL '6 hours'),
('multimedia-004', 'Análisis: La evolución de Zelda', 'video', 'https://www.youtube.com/watch?v=example2', 'https://i.ytimg.com/vi/example2/maxresdefault.jpg', 'YouTube', false, NOW() - INTERVAL '5 days'),
('multimedia-005', 'Trailer - Starfield Gameplay', 'trailer', 'https://www.youtube.com/watch?v=example3', 'https://i.ytimg.com/vi/example3/maxresdefault.jpg', 'YouTube', true, NOW() - INTERVAL '2 days'),
('multimedia-006', 'Directo: Anunciando mi nuevo proyecto indie', 'stream', 'https://www.twitch.tv/sofiagames', 'https://static-cdn.jtvnw.net/previews-ttv/live_user_sofiagames.jpg', 'Twitch', false, NOW() - INTERVAL '12 hours'),
('multimedia-007', 'Documental: La historia de Final Fantasy', 'video', 'https://www.youtube.com/watch?v=example4', 'https://i.ytimg.com/vi/example4/maxresdefault.jpg', 'YouTube', false, NOW() - INTERVAL '8 days'),
('multimedia-008', 'Trailer - Dragon Age: The Veilguard', 'trailer', 'https://www.youtube.com/watch?v=example5', 'https://i.ytimg.com/vi/example5/maxresdefault.jpg', 'YouTube', true, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Eventos (lanzamientos, ferias, convenciones)
DELETE FROM events WHERE id LIKE 'event-%';
INSERT INTO events (id, title, description, type, start_date, end_date, location, url, created_at) VALUES
('event-001', 'Gamescom 2024', 'La feria de videojuegos más grande de Europa con anuncios y demos jugables.', 'convention', '2024-08-21', '2024-08-25', 'Colonia, Alemania', 'https://www.gamescom.global', NOW()),
('event-002', 'Tokyo Game Show 2024', 'Convención anual de videojuegos en Japón con foco en títulos asiáticos.', 'convention', '2024-09-26', '2024-09-29', 'Tokio, Japón', 'https://tgs.nikkeibp.co.jp', NOW()),
('event-003', 'Lanzamiento: GTA VI', 'El tan esperado regreso de la serie Grand Theft Auto.', 'launch', '2025-10-26', NULL, 'Mundial', 'https://www.rockstargames.com/gta-vi', NOW()),
('event-004', 'The Game Awards 2024', 'Ceremonia de premios anual con anuncios mundiales.', 'convention', '2024-12-12', '2024-12-12', 'Los Ángeles, EE.UU.', 'https://thegameawards.com', NOW()),
('event-005', 'Lanzamiento: Metroid Prime 4', 'El regreso de la serie tras años de desarrollo.', 'launch', '2025-03-21', NULL, 'Mundial', 'https://www.nintendo.com/metroid-prime-4', NOW()),
('event-006', 'GDC 2025', 'Game Developers Conference: conferencia para desarrolladores profesionales.', 'expo', '2025-03-17', '2025-03-21', 'San Francisco, EE.UU.', 'https://gdconf.com', NOW()),
('event-007', 'E3 2025', 'Electronic Entertainment Expo (si se confirma su regreso).', 'expo', '2025-06-10', '2025-06-13', 'Los Ángeles, EE.UU.', 'https://www.e3expo.com', NOW()),
('event-008', 'Lanzamiento: Hollow Knight: Silksong', 'La secuela del aclamado indie finalmente llega.', 'launch', '2025-06-30', NULL, 'Mundial', 'https://www.teamcherry.com.au', NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Mensajes de contacto
DELETE FROM contact_messages WHERE id LIKE 'contact-%';
INSERT INTO contact_messages (id, name, email, subject, message, read, created_at) VALUES
('contact-001', 'Ana García', 'ana.garcia@email.com', 'Sugerencia: Sección de retro gaming', 'Hola equipo de GameHub, me encanta la web pero me gustaría sugerir una sección dedicada a juegos retro y clásicos. Creo que habría mucho interés en la comunidad. ¡Seguiré visitando!', false, NOW() - INTERVAL '1 day'),
('contact-002', 'Miguel Rodríguez', 'miguel.rodriguez@company.com', 'Propuesta de colaboración', 'Buenos días, represento a una empresa de desarrollo indie y nos gustaría explorar posibilidades de colaboración para promocionar nuestro próximo juego. ¿Podrían indicarnos el proceso para anuncios o patrocinios?', false, NOW() - INTERVAL '3 days'),
('contact-003', 'Laura Chen', 'laura.chen@email.com', 'Reporte de bug en página de noticias', 'Hola, encontré un problema en la página de noticias: al hacer scroll, algunas imágenes no cargan correctamente en móvil. Usando iPhone 14 con Safari. ¡Gracias por el gran contenido!', false, NOW() - INTERVAL '5 days'),
('contact-004', 'Carlos Mendez', 'carlos.mendez@email.com', 'Pregunta sobre registro de redactores', 'Hola, soy periodista de tecnología y me gustaría saber cómo puedo aplicar para ser redactor colaborador en GameHub. Tengo experiencia en medios como IGN España y 3DJuegos.', false, NOW() - INTERVAL '7 days'),
('contact-005', 'Sophie Martin', 'sophie.martin@email.com', 'Felicitaciones', 'Solo quería dejar un mensaje de felicitación por el proyecto. Es exactamente lo que faltaba en la comunidad de habla hispana. El diseño es hermoso y el contenido de alta calidad. ¡Sigan así!', true, NOW() - INTERVAL '10 days');
