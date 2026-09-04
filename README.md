# IncluyeT

Plataforma web de empleo inclusivo que conecta candidatos con discapacidad y empresas. El proyecto permite crear perfiles, cargar CV, extraer sugerencias de perfil localmente, publicar ofertas, calcular compatibilidad, postularse, gestionar cursos y notificaciones, y revisar candidatos desde la cuenta empresarial.

La aplicación utiliza PostgreSQL local como única base de datos. Supabase no forma parte del proyecto.

## 1. Arquitectura

```text
Next.js / React
      |
      | HTTP + JSON / multipart
      v
FastAPI (Backend/main.py)
      |
      | SQLAlchemy
      v
PostgreSQL 16 (Docker)
```

### Capas principales

- `app/`: páginas y flujos de la interfaz Next.js.
- `components/`: componentes reutilizables, incluida la tarjeta de oferta y controles de accesibilidad.
- `lib/api.ts`: cliente HTTP del frontend.
- `lib/data.ts`: contenido editorial de fallback y tipos de presentación. Los datos operativos se leen desde la API.
- `Backend/main.py`: API FastAPI, autenticación JWT, validaciones, matching y reglas de negocio.
- `Backend/database.py`: modelos SQLAlchemy y conexión a PostgreSQL.
- `Backend/seed.sql`: datos iniciales integrados al arranque de la API.
- `docker-compose.yml`: servicio local PostgreSQL y volumen persistente.
- `public/`: imágenes y recursos estáticos.

## 2. Requisitos

- Windows, macOS o Linux.
- Node.js 20 o superior recomendado.
- npm o pnpm.
- Python 3.11 o superior recomendado.
- Docker Desktop con Compose.
- Aproximadamente 2 GB adicionales para el modelo `all-MiniLM-L6-v2` usado por el matching.

## 3. Instalación local

Desde la raíz del repositorio:

```powershell
docker compose up -d postgres
python -m pip install -r requirements.txt
npm install
```

Configura `Backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql+psycopg://incluye_t:incluye_t_dev@localhost:5432/incluye_t
JWT_SECRET=pon-aqui-una-clave-larga-de-al-menos-32-caracteres
```

El frontend usa `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Inicia el backend en una terminal:

```powershell
python -m uvicorn Backend.main:app --reload --port 8000
```

Inicia el frontend en otra terminal:

```powershell
npm run dev
```

URLs locales:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- Documentación interactiva FastAPI: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## 4. Base de datos

La API ejecuta `Base.metadata.create_all()` y después carga `Backend/seed.sql` cada vez que inicia. El seed usa operaciones idempotentes, por lo que puede ejecutarse varias veces sin duplicar los registros demo.

El volumen de Docker se llama `plataforma-de-empleo-inclusivo_incluyeT-postgres-data` y conserva los datos al reiniciar el contenedor.

### Tablas

| Tabla | Propósito |
| --- | --- |
| `users` | Email, hash de contraseña, rol, verificación y token temporal. |
| `candidatos` | Perfil profesional, datos CONADIS, contacto y CV binario. |
| `empresas` | RUC, razón social y datos institucionales. |
| `ofertas` | Ofertas laborales publicadas por empresas. |
| `postulaciones` | Relación candidato-oferta, estado y fecha. |
| `ofertas_guardadas` | Ofertas guardadas por candidatos. |
| `cursos` | Catálogo de capacitaciones. |
| `inscripciones` | Cursos inscritos por candidatos. |
| `notificaciones` | Eventos para candidatos y empresas. |
| `ruc_registros` | Catálogo simulado para validar RUC. |
| `conadis_registros` | Catálogo simulado para validar DNI/carnet CONADIS. |

Las relaciones importantes tienen eliminación en cascada: eliminar un usuario elimina su perfil, ofertas, postulaciones, inscripciones y notificaciones relacionadas.

## 5. Autenticación

La autenticación es propia y local:

1. El registro crea una fila en `users` y otra en `candidatos` o `empresas`.
2. La contraseña se almacena mediante PBKDF2-HMAC-SHA256 con salt aleatorio.
3. El registro devuelve un `token_verificacion` para la demo local.
4. `POST /api/auth/verify/{token}` marca el correo como verificado.
5. El login busca el email y rol en PostgreSQL, verifica el hash y devuelve un JWT de 12 horas.
6. Las operaciones privadas reciben `Authorization: Bearer <token>`.

El frontend conserva la sesión en `localStorage`. El backend sigue siendo la autoridad: cada operación privada vuelve a validar el JWT, su usuario y sus permisos.

## 6. Flujos funcionales

### Registro y validación

- Empresa: valida el RUC contra `ruc_registros` antes del registro.
- Candidato: valida el DNI contra `conadis_registros`; si se proporciona un carnet, también se comprueba.
- La verificación local redirige a `/confirmacion` con el token generado por la API.

Registros de prueba:

```text
RUC válido: 20123456789
DNI CONADIS válido: 12345678
```

### Perfil y CV

El candidato puede editar sus datos y cargar un PDF de hasta 10 MB. El archivo se guarda en `candidatos.cv_data` como `bytea`.

Al cargarlo, el backend:

1. Extrae texto con `pypdf`.
2. Detecta nombre, puesto, correo, habilidades y adaptaciones con reglas locales.
3. Devuelve sugerencias al wizard.
4. El candidato puede editarlas.
5. Al guardar, el perfil corregido se actualiza en PostgreSQL.

La extracción de perfil es una simulación local; el cálculo semántico de compatibilidad sí usa `SentenceTransformer`.

### Matching automático

El dashboard del candidato obtiene las ofertas activas y envía automáticamente el perfil completo al endpoint `/api/match` para cada oferta. El texto combina:

```text
puesto + resumen + habilidades + adaptaciones
```

El backend genera embeddings con `all-MiniLM-L6-v2`, calcula similitud coseno y devuelve porcentaje y nivel:

- 75 o más: `Alta Compatibilidad`.
- 50 a 74.9: `Compatibilidad Media`.
- Menos de 50: `Baja Compatibilidad`.

No existe un botón manual para iniciar el análisis.

### Ofertas y postulaciones

- La empresa crea, edita y elimina sus ofertas.
- Los candidatos consultan ofertas activas.
- `Postular ahora` crea una fila en `postulaciones`.
- No se permite postular dos veces a la misma oferta.
- La postulación genera notificaciones para ambas partes.
- La empresa visualiza nombre, DNI, email, resumen, habilidades, adaptaciones, estado y CV.
- La empresa puede cambiar el estado a `recibida`, `en revisión`, `entrevista`, `aceptada` o `rechazada`.

### Cursos y notificaciones

- Los cursos se cargan desde PostgreSQL.
- Las inscripciones se persisten en `inscripciones`.
- Las notificaciones se cargan desde PostgreSQL y pueden marcarse como leídas.
- Las ofertas guardadas se persisten en `ofertas_guardadas`.

## 7. API

Todos los endpoints privados requieren `Authorization: Bearer <JWT>`.

### Sistema y validaciones

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/` | Público | Estado de la API. |
| `GET` | `/api/validar-ruc/{ruc}` | Público | Consulta `ruc_registros`. |
| `GET` | `/api/validar-conadis/{dni}` | Público | Consulta `conadis_registros`. |
| `POST` | `/api/match` | Público | Calcula compatibilidad semántica. |

### Autenticación

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register/candidato` | Público | Crea candidato y devuelve token de verificación local. |
| `POST` | `/api/auth/register/empresa` | Público | Crea empresa validando RUC. |
| `POST` | `/api/auth/login/candidato` | Público | Busca y autentica candidato. |
| `POST` | `/api/auth/login/empresa` | Público | Busca y autentica empresa. |
| `POST` | `/api/auth/verify/{token}` | Público | Verifica una cuenta local. |

### Perfiles y CV

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `PUT` | `/api/users/candidato/{id}` | Candidato propietario | Actualiza perfil. |
| `DELETE` | `/api/users/candidato/{id}` | Candidato propietario | Elimina cuenta. |
| `POST` | `/api/users/candidato/{id}/cv` | Candidato propietario | Guarda y procesa PDF. |
| `GET` | `/api/users/candidato/{id}/cv` | Candidato propietario | Descarga su CV. |
| `PUT` | `/api/users/empresa/{id}` | Empresa propietaria | Actualiza perfil. |
| `DELETE` | `/api/users/empresa/{id}` | Empresa propietaria | Elimina cuenta. |
| `GET` | `/api/empresas/{id}` | Público | Perfil y ofertas activas. |

### Ofertas

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/ofertas` | Público | Ofertas activas. |
| `POST` | `/api/ofertas` | Empresa | Publica oferta. |
| `GET` | `/api/ofertas/mis-ofertas` | Empresa | Ofertas propias. |
| `PUT` | `/api/ofertas/{id}` | Empresa propietaria | Actualiza oferta. |
| `DELETE` | `/api/ofertas/{id}` | Empresa propietaria | Elimina oferta. |
| `POST` | `/api/ofertas/{id}/guardar` | Candidato | Guarda oferta. |

### Postulaciones

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/ofertas/{id}/postular` | Candidato | Crea postulación única. |
| `GET` | `/api/postulaciones/candidato` | Candidato | Historial propio. |
| `GET` | `/api/postulaciones/empresa` | Empresa | Postulaciones de sus ofertas. |
| `PATCH` | `/api/postulaciones/{id}/estado?estado=entrevista` | Empresa propietaria | Cambia estado y notifica candidato. |
| `GET` | `/api/postulaciones/{id}/cv` | Empresa propietaria | Descarga CV del postulante. |

### Cursos y notificaciones

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/cursos` | Público | Catálogo activo. |
| `GET` | `/api/cursos/inscripciones` | Candidato | IDs de cursos inscritos. |
| `POST` | `/api/cursos/{id}/inscribirse` | Candidato | Crea inscripción única. |
| `GET` | `/api/notificaciones` | Usuario | Notificaciones propias. |
| `PATCH` | `/api/notificaciones/leidas` | Usuario | Marca las propias como leídas. |

## 8. Datos para demostración

El seed integrado contiene:

- 5 usuarios.
- 3 candidatos.
- 2 empresas.
- 4 ofertas.
- 4 postulaciones.
- 6 cursos.
- Inscripciones, ofertas guardadas y notificaciones relacionadas.
- Catálogos de RUC y CONADIS.
- CVs demo asociados a los candidatos.

Credenciales:

```text
Empresa
Correo: demo.empresa@incluyet.local
Contraseña: EmpresaDemo123!

Candidato
Correo: maria.silva@incluyet.local
Contraseña: CandidatoDemo123!
```

Recorrido recomendado para una demostración:

1. Iniciar sesión como candidato.
2. Revisar recomendaciones automáticas.
3. Abrir el perfil y cargar un PDF.
4. Corregir las sugerencias extraídas y guardar.
5. Volver a ofertas y postularse.
6. Cerrar sesión e ingresar como empresa.
7. Revisar la postulación y descargar el CV.
8. Cambiar el estado de la postulación.
9. Volver al candidato y revisar la notificación.
10. Abrir cursos e inscribirse en uno.

## 9. Comandos útiles

```powershell
# Base de datos
docker compose up -d postgres
docker compose stop postgres
docker compose logs postgres

# Backend
python -m uvicorn Backend.main:app --reload --port 8000
python -m py_compile Backend/main.py Backend/database.py

# Frontend
npm run dev
npm run build
npm start
```

Para revisar tablas directamente:

```powershell
docker exec -it incluyeT-postgres psql -U incluye_t -d incluye_t
```

Para reiniciar completamente la base de demostración y borrar el volumen persistente:

```powershell
docker compose down -v
docker compose up -d postgres
```

El último comando es destructivo: elimina todos los datos locales.

## 10. Solución de problemas

### La API no inicia

1. Comprueba que PostgreSQL esté saludable:

```powershell
docker compose ps
```

2. Comprueba `Backend/.env` y que `DATABASE_URL` apunte a `localhost:5432`.
3. Comprueba que el puerto 8000 esté libre.
4. La primera carga puede tardar porque descarga el modelo de Sentence Transformers.

### El frontend muestra ofertas de ejemplo

Comprueba que la API esté disponible en `http://localhost:8000` y que `.env` contenga `NEXT_PUBLIC_API_URL=http://localhost:8000`. Algunas páginas conservan contenido editorial de fallback para no quedar vacías cuando la API no responde.

### El login no funciona

- La cuenta debe estar verificada.
- El correo debe coincidir con la fila de `users`.
- La contraseña diferencia mayúsculas y minúsculas.
- Para la demo usa las credenciales incluidas arriba.

## 11. Consideraciones para producción

Esta configuración está pensada para desarrollo y demostración local. Antes de publicar:

- Cambiar `JWT_SECRET` por un secreto seguro de 32 bytes o más.
- No usar contraseñas demo.
- Añadir migraciones versionadas con Alembic en lugar de depender solo de `create_all`.
- Mover CVs a almacenamiento de objetos si el volumen crece.
- Usar cookies `HttpOnly` o una estrategia de sesión más resistente que `localStorage`.
- Configurar HTTPS, límites de subida, antivirus y control de tipos de archivo.
- Añadir correo real para verificación y recuperación de contraseña.
- No usar los registros de RUC/CONADIS simulados como validación legal.
- Añadir pruebas automatizadas de permisos, cascadas, duplicados y flujos de postulación.

## 12. Estado de validación

La versión documentada fue comprobada con:

- Build de Next.js exitoso.
- TypeScript sin errores.
- Compilación Python sin errores.
- PostgreSQL 16 en Docker en estado `healthy`.
- Login de candidato y empresa contra PostgreSQL.
- Validación de RUC y CONADIS desde tablas.
- Creación, actualización, listado y eliminación de ofertas.
- Persistencia de perfiles.
- Carga y extracción local de CV.
- Postulación y visualización empresarial.
