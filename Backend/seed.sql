INSERT INTO ruc_registros (ruc, razon_social, activo, created_at)
VALUES
  ('20123456789', 'Empresa Demo S.A.C.', TRUE, CURRENT_TIMESTAMP),
  ('20481234567', 'Tecnologia Inclusiva Peru S.A.C.', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (ruc) DO NOTHING;

INSERT INTO conadis_registros (dni, carnet, tipo_discapacidad, activo, created_at)
VALUES
  ('12345678', 'CONADIS-12345678', 'Discapacidad física', TRUE, CURRENT_TIMESTAMP),
  ('87654321', 'CONADIS-87654321', 'Discapacidad auditiva', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (dni) DO NOTHING;
