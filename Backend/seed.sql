INSERT INTO ruc_registros (ruc, razon_social, activo, created_at) VALUES
  ('20123456789', 'Empresa Demo S.A.C.', TRUE, CURRENT_TIMESTAMP),
  ('20481234567', 'Tecnología Inclusiva Perú S.A.C.', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (ruc) DO UPDATE SET razon_social = EXCLUDED.razon_social, activo = EXCLUDED.activo;

INSERT INTO conadis_registros (dni, carnet, tipo_discapacidad, activo, created_at) VALUES
  ('12345678', 'CONADIS-12345678', 'Discapacidad física', TRUE, CURRENT_TIMESTAMP),
  ('87654321', 'CONADIS-87654321', 'Discapacidad auditiva', TRUE, CURRENT_TIMESTAMP),
  ('11112222', 'CONADIS-11112222', 'Discapacidad visual', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (dni) DO UPDATE SET carnet = EXCLUDED.carnet, tipo_discapacidad = EXCLUDED.tipo_discapacidad, activo = EXCLUDED.activo;

INSERT INTO users (id, email, password_hash, role, email_verified, verification_token, created_at) VALUES
  ('10000000-0000-4000-8000-000000000001', 'demo.empresa@incluyet.local', 'demo-salt-10000000-0000-4000-8000-000000000001$043d06ca99e23fbbf692fe4ca10456bbc6c7ab95ca41df1a8b3b1196af45f958', 'empresa', TRUE, NULL, CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000002', 'talento@tecnologiainclusiva.local', 'demo-salt-10000000-0000-4000-8000-000000000002$93fb35ca8f855b5993c4b558f4055e18a561e6f2a329df990202d2b3a4b90672', 'empresa', TRUE, NULL, CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000001', 'maria.silva@incluyet.local', 'demo-salt-20000000-0000-4000-8000-000000000001$d0764ce603b0d9a60e0aca65979b94902da87a5780be5fb6262b18d5ba02f3de', 'candidato', TRUE, NULL, CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000002', 'carlos.perez@incluyet.local', 'demo-salt-20000000-0000-4000-8000-000000000002$6bc1927470066c6523361a8efc71f6cd323fdb9cb5036cf0ceb30ab95d95671e', 'candidato', TRUE, NULL, CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000003', 'lucia.torres@incluyet.local', 'demo-salt-20000000-0000-4000-8000-000000000003$601434d14984ed9b116ee503e1dbfef5b97281601c500af7c8b65bcf44fb4ca0', 'candidato', TRUE, NULL, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, email_verified = TRUE, verification_token = NULL;

INSERT INTO empresas (id, ruc, razon_social, sector, ciudad, colaboradores, descripcion, updated_at) VALUES
  ('10000000-0000-4000-8000-000000000001', '20123456789', 'Empresa Demo S.A.C.', 'Tecnología', 'Lima', '201-500', 'Tecnología comprometida con el empleo inclusivo.', CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000002', '20481234567', 'Tecnología Inclusiva Perú S.A.C.', 'Software', 'Arequipa', '51-200', 'Desarrollamos soluciones accesibles para todas las personas.', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET ruc = EXCLUDED.ruc, razon_social = EXCLUDED.razon_social, sector = EXCLUDED.sector, ciudad = EXCLUDED.ciudad, colaboradores = EXCLUDED.colaboradores, descripcion = EXCLUDED.descripcion, updated_at = EXCLUDED.updated_at;

INSERT INTO candidatos (id, nombre, dni, num_conadis, conadis_valido, titulo_profesional, resumen_perfil, habilidades, adaptaciones, cv_nombre_file, cv_content_type, cv_data, updated_at) VALUES
  ('20000000-0000-4000-8000-000000000001', 'María Silva', '12345678', 'CONADIS-12345678', TRUE, 'Desarrolladora Frontend Senior', 'Desarrolladora especializada en React, TypeScript y accesibilidad web WCAG.', '["React", "TypeScript", "Next.js", "WCAG"]', '["Trabajo remoto", "Lector de pantalla"]', 'CV_Maria_Silva.pdf', 'application/pdf', decode('255044462d312e330a2525454f460a', 'hex'), CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000002', 'Carlos Pérez', '87654321', 'CONADIS-87654321', TRUE, 'Analista de Datos', 'Analista con experiencia en SQL, Python y visualización de indicadores.', '["SQL", "Python", "Power BI", "Excel"]', '["Jornada flexible", "Intérprete de lengua de señas"]', 'CV_Carlos_Perez.pdf', 'application/pdf', decode('255044462d312e330a2525454f460a', 'hex'), CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000003', 'Lucía Torres', '11112222', 'CONADIS-11112222', TRUE, 'Diseñadora UX', 'Diseñadora UX enfocada en investigación y productos digitales accesibles.', '["UX", "Figma", "WCAG", "Investigación"]', '["Trabajo remoto", "Pausas adicionales"]', 'CV_Lucia_Torres.pdf', 'application/pdf', decode('255044462d312e330a2525454f460a', 'hex'), CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, dni = EXCLUDED.dni, num_conadis = EXCLUDED.num_conadis, conadis_valido = EXCLUDED.conadis_valido, titulo_profesional = EXCLUDED.titulo_profesional, resumen_perfil = EXCLUDED.resumen_perfil, habilidades = EXCLUDED.habilidades, adaptaciones = EXCLUDED.adaptaciones, cv_nombre_file = EXCLUDED.cv_nombre_file, cv_content_type = EXCLUDED.cv_content_type, cv_data = EXCLUDED.cv_data, updated_at = EXCLUDED.updated_at;

INSERT INTO ofertas (id, empresa_id, titulo, modalidad, ubicacion, experiencia, salario, funciones, adaptaciones, activa, created_at, updated_at) VALUES
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Analista de Datos Junior', 'Remoto', 'Lima', '0-2 años', 'S/ 2,800 - 3,500', 'Analizar indicadores y crear reportes para equipos de negocio.', '["Trabajo remoto", "Jornada flexible"]', TRUE, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Desarrollador Frontend Accesible', 'Híbrido', 'Lima', '2-4 años', 'S/ 4,000 - 5,500', 'Construir interfaces React accesibles y mantener componentes reutilizables.', '["Accesibilidad física", "Software accesible"]', TRUE, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Diseñador UX Inclusivo', 'Remoto', 'Arequipa', '1-3 años', 'S/ 3,200 - 4,200', 'Investigar necesidades y diseñar experiencias digitales inclusivas.', '["Trabajo remoto", "Herramientas accesibles"]', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 'Asistente Administrativo', 'Presencial', 'Arequipa', '1 año', 'S/ 2,000 - 2,600', 'Gestionar documentación y coordinación administrativa.', '["Accesibilidad física", "Jornada flexible"]', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET empresa_id = EXCLUDED.empresa_id, titulo = EXCLUDED.titulo, modalidad = EXCLUDED.modalidad, ubicacion = EXCLUDED.ubicacion, experiencia = EXCLUDED.experiencia, salario = EXCLUDED.salario, funciones = EXCLUDED.funciones, adaptaciones = EXCLUDED.adaptaciones, activa = EXCLUDED.activa, updated_at = EXCLUDED.updated_at;

INSERT INTO postulaciones (id, oferta_id, candidato_id, estado, created_at) VALUES
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'recibida', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'en revisión', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'recibida', CURRENT_TIMESTAMP),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'recibida', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET oferta_id = EXCLUDED.oferta_id, candidato_id = EXCLUDED.candidato_id, estado = EXCLUDED.estado;

INSERT INTO cursos (id, titulo, entidad, modalidad, duracion, cupos, tema, activo) VALUES
  ('c1', 'Habilidades Digitales para el Empleo', 'MTPE', 'Virtual', '40 horas', 'Inscripciones abiertas', 'Tecnología', TRUE),
  ('c2', 'Emprendimiento Inclusivo', 'CONADIS', 'Semipresencial', '60 horas', '12 vacantes', 'Negocios', TRUE),
  ('c3', 'Atención al Cliente Accesible', 'SENATI', 'Presencial', '30 horas', '8 vacantes', 'Servicios', TRUE),
  ('c4', 'Ofimática Certificada', 'MTPE', 'Virtual', '50 horas', 'Inscripciones abiertas', 'Tecnología', TRUE),
  ('c5', 'Lengua de Señas Peruana Nivel 1', 'CONADIS', 'Virtual', '45 horas', '20 vacantes', 'Comunicación', TRUE),
  ('c6', 'Contabilidad Básica', 'SENATI', 'Semipresencial', '80 horas', '15 vacantes', 'Negocios', TRUE)
ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, entidad = EXCLUDED.entidad, modalidad = EXCLUDED.modalidad, duracion = EXCLUDED.duracion, cupos = EXCLUDED.cupos, tema = EXCLUDED.tema, activo = EXCLUDED.activo;

INSERT INTO inscripciones (id, curso_id, candidato_id, estado, created_at) VALUES
  ('50000000-0000-4000-8000-000000000001', 'c1', '20000000-0000-4000-8000-000000000001', 'inscrito', CURRENT_TIMESTAMP),
  ('50000000-0000-4000-8000-000000000002', 'c4', '20000000-0000-4000-8000-000000000001', 'inscrito', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET curso_id = EXCLUDED.curso_id, candidato_id = EXCLUDED.candidato_id, estado = EXCLUDED.estado;

INSERT INTO ofertas_guardadas (id, oferta_id, candidato_id, created_at) VALUES
  ('60000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET oferta_id = EXCLUDED.oferta_id, candidato_id = EXCLUDED.candidato_id;

INSERT INTO notificaciones (id, user_id, tipo, titulo, cuerpo, leida, created_at) VALUES
  ('70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'postulacion', 'Postulación registrada', 'Tu postulación a Analista de Datos Junior fue recibida.', FALSE, CURRENT_TIMESTAMP),
  ('70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'postulacion', 'Nueva postulación', 'María Silva postuló a Desarrollador Frontend Accesible.', FALSE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, cuerpo = EXCLUDED.cuerpo, leida = EXCLUDED.leida;
