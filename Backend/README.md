# Backend local

La API usa PostgreSQL local y no requiere Supabase.

## Arranque

Desde la raiz del proyecto:

```powershell
docker compose up -d postgres
python -m pip install -r requirements.txt
python -m uvicorn Backend.main:app --reload --port 8000
```

La API crea sus tablas y ejecuta `Backend/seed.sql` al iniciar. Para una instalacion manual, ejecuta `supabase/schema.sql` y despues `Backend/seed.sql` contra la base.

La variable `DATABASE_URL` permite apuntar a otra instancia PostgreSQL. En desarrollo, `POST /api/auth/register/*` devuelve `token_verificacion`; abre la URL `http://localhost:3000/confirmacion?tipo=candidato&token_hash=<token>` para verificar una cuenta local.

Las postulaciones se guardan en `postulaciones`, una por candidato y oferta. El candidato usa `POST /api/ofertas/{id}/postular`; la empresa consulta `GET /api/postulaciones/empresa` y puede descargar el CV mediante el id de la postulación.

El CV se guarda como `bytea` en PostgreSQL mediante `POST /api/users/candidato/{id}/cv` como multipart con el campo `file`. El limite es 10 MB y solo se acepta PDF.

Al subir un CV, `pypdf` extrae el texto localmente y `extract_cv_profile` simula la inferencia de un modelo de aprendizaje automatico: detecta nombre, puesto, correo, habilidades y trabajo remoto mediante patrones y un catalogo local. El frontend muestra esas sugerencias en el wizard para que la persona las revise y edite antes de guardar el perfil.

La base local incluye los catalogos `ruc_registros` y `conadis_registros`, con registros demo `20123456789` y `12345678`. Los endpoints `/api/validar-ruc/{ruc}` y `/api/validar-conadis/{dni}` consultan esos catalogos.
