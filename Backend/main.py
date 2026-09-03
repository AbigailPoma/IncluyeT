from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os
import re
import secrets
from pathlib import Path
from datetime import datetime, timedelta
from uuid import uuid4

import jwt
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pypdf import PdfReader

try:
    from Backend.database import Candidato, Empresa, Oferta, Postulacion, User, RucRegistro, ConadisRegistro, Base, configure_database, run_seed
except ModuleNotFoundError:
    from database import Candidato, Empresa, Oferta, Postulacion, User, RucRegistro, ConadisRegistro, Base, configure_database, run_seed
import uvicorn

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
if not DATABASE_URL or not JWT_SECRET:
    raise RuntimeError("Configura DATABASE_URL y JWT_SECRET en Backend/.env")
engine, SessionLocal = configure_database(DATABASE_URL)
Base.metadata.create_all(engine)
run_seed(SessionLocal, Path(__file__).with_name("seed.sql"))

app = FastAPI(
    title="IncluyeT - AI Matching Engine",
    description="API de similitud semántica para matching inclusivo usando SBERT",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde Next.js (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar el modelo SBERT ligero optimizado (384 dimensiones)
print("Cargando modelo Sentence-BERT (all-MiniLM-L6-v2)...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Modelo cargado exitosamente.")

class MatchRequest(BaseModel):
    perfil: str
    oferta: str

class MatchResponse(BaseModel):
    match_percentage: float
    nivel: str
    metrica: str
    detalles: dict

class RucResponse(BaseModel):
    valido: bool
    razon_social: str | None = None
    mensaje: str

class ConadisResponse(BaseModel):
    registrado: bool
    carnet: str | None = None
    tipo_discapacidad: str | None = None
    mensaje: str

class CandidatoRegisterRequest(BaseModel):
    nombre: str
    email: str
    dni: str
    password: str
    numConadis: str = ""
    conadisValido: bool = False

class EmpresaRegisterRequest(BaseModel):
    ruc: str
    razon_social: str
    email: str
    password: str

class LoginRequest(BaseModel):
    usuario: str
    password: str

class CandidatoUpdateRequest(BaseModel):
    nombre: str
    numConadis: str = ""
    conadisValido: bool = False
    tituloProfesional: str = ""
    resumenPerfil: str = ""
    habilidades: list[str] = Field(default_factory=list)
    adaptaciones: list[str] = Field(default_factory=list)
    cvNombreFile: str = ""

class EmpresaUpdateRequest(BaseModel):
    razon_social: str
    sector: str = ""
    ciudad: str = ""
    colaboradores: str = ""
    descripcion: str = ""

class OfertaCreateRequest(BaseModel):
    titulo: str
    modalidad: str
    ubicacion: str = ""
    experiencia: str = ""
    salario: str = ""
    funciones: str
    adaptaciones: list[str] = Field(default_factory=list)

class OfertaUpdateRequest(OfertaCreateRequest):
    activa: bool = True

class AuthResponse(BaseModel):
    verificado: bool
    mensaje: str
    usuario: dict | None = None
    token_verificacion: str | None = None

class PostulacionResponse(BaseModel):
    id: str
    oferta_id: str
    oferta_titulo: str
    candidato_id: str
    candidato_nombre: str
    dni: str
    email: str
    titulo_profesional: str
    resumen_perfil: str
    habilidades: list[str]
    adaptaciones: list[str]
    cv_nombre_file: str
    cv_disponible: bool
    estado: str
    created_at: datetime

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str, salt: str | None = None) -> str:
    import hashlib
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"

def verify_password(password: str, stored: str) -> bool:
    salt, _, expected = stored.partition("$")
    return secrets.compare_digest(hash_password(password, salt).split("$", 1)[1], expected)

def auth_user(user: User | None) -> dict | None:
    if not user:
        return None
    return {"id": user.id, "email": user.email, "emailVerificado": user.email_verified}

def bearer_token(authorization: str) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Se requiere una sesión válida.")
    return token

def issue_access_token(user: User) -> str:
    return jwt.encode({"sub": user.id, "role": user.role, "exp": datetime.utcnow() + timedelta(hours=12)}, JWT_SECRET, algorithm="HS256")

def authenticated_user(authorization: str, db: Session) -> User:
    try:
        payload = jwt.decode(bearer_token(authorization), JWT_SECRET, algorithms=["HS256"])
        user = db.get(User, payload.get("sub"))
    except Exception as error:
        raise HTTPException(status_code=401, detail="La sesión no es válida.") from error
    if not user:
        raise HTTPException(status_code=401, detail="La sesión no es válida.")
    return user

def require_owner(user_id: str, tipo: str, authorization: str, db: Session) -> User:
    user = authenticated_user(authorization, db)
    if user.id != user_id or user.role != tipo:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar este perfil.")
    return user

def empresa_response(row: Empresa, user: User | None = None) -> dict:
    return {
        **(auth_user(user) or {}),
        "id": row.id,
        "ruc": row.ruc,
        "razon_social": row.razon_social,
        "sector": row.sector,
        "ciudad": row.ciudad,
        "colaboradores": row.colaboradores,
        "descripcion": row.descripcion,
    }

def oferta_response(row: Oferta, company_name: str) -> dict:
    return {
        "id": row.id,
        "title": row.titulo,
        "company": company_name,
        "location": row.ubicacion,
        "modality": row.modalidad,
        "salary": row.salario,
        "posted": row.created_at,
        "adaptations": row.adaptaciones or [],
        "experience": row.experiencia,
        "description": row.funciones,
    }

def profile_row(tipo: str, user_id: str, db: Session) -> Candidato | Empresa | None:
    return db.get(Candidato if tipo == "candidato" else Empresa, user_id)

def candidato_response(row: Candidato, user: User | None = None) -> dict:
    return {
        **(auth_user(user) or {}),
        "id": row.id,
        "nombre": row.nombre,
        "dni": row.dni,
        "numConadis": row.num_conadis,
        "conadisValido": row.conadis_valido,
        "tituloProfesional": row.titulo_profesional,
        "resumenPerfil": row.resumen_perfil,
        "habilidades": row.habilidades or [],
        "adaptaciones": row.adaptaciones or [],
        "cvNombreFile": row.cv_nombre_file,
        "emailVerificado": bool(user and user.email_verified),
    }

def postulacion_response(postulacion: Postulacion) -> dict:
    candidato = postulacion.candidato
    return {
        "id": postulacion.id,
        "oferta_id": postulacion.oferta_id,
        "oferta_titulo": postulacion.oferta.titulo,
        "candidato_id": candidato.id,
        "candidato_nombre": candidato.nombre,
        "dni": candidato.dni,
        "email": candidato.user.email,
        "titulo_profesional": candidato.titulo_profesional,
        "resumen_perfil": candidato.resumen_perfil,
        "habilidades": candidato.habilidades or [],
        "adaptaciones": candidato.adaptaciones or [],
        "cv_nombre_file": candidato.cv_nombre_file,
        "cv_disponible": bool(candidato.cv_data),
        "estado": postulacion.estado,
        "created_at": postulacion.created_at,
    }

def extract_cv_profile(content: bytes, filename: str) -> dict:
    try:
        import io
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as error:
        raise HTTPException(status_code=400, detail="No se pudo leer el contenido del PDF.") from error

    normalized = " ".join(text.split())
    email_match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", normalized)
    skills_catalog = ["Python", "SQL", "React", "TypeScript", "JavaScript", "Next.js", "Excel", "Power BI", "WCAG", "Java", "Django"]
    skills = [skill for skill in skills_catalog if skill.lower() in normalized.lower()]
    title_patterns = [
        r"(?:puesto|cargo|perfil|profesion|profesión)\s*[:\-]\s*([^|.;]+)",
        r"((?:desarrollador|desarrolladora|analista|diseñador|diseñadora|ingeniero|ingeniera|asistente|contador|contadora)[^|.;]*?)(?=\s+\S+@\S+|\s+experiencia\b|$)",
    ]
    puesto = next((re.search(pattern, normalized, re.IGNORECASE).group(1).strip() for pattern in title_patterns if re.search(pattern, normalized, re.IGNORECASE)), "Profesional en búsqueda activa")
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = next((line for line in lines[:8] if re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ ]{5,80}", line) and len(line.split()) >= 2), "")
    name_parts = name.split(maxsplit=1)
    summary = next((re.search(r"(?:perfil profesional|resumen|sobre mí|sobre mi)\s*[:\-]?\s*(.{40,300})", normalized, re.IGNORECASE).group(1).strip() for _ in [0] if re.search(r"(?:perfil profesional|resumen|sobre mí|sobre mi)\s*[:\-]?\s*(.{40,300})", normalized, re.IGNORECASE)), "")
    if not summary:
        summary = f"Perfil extraído localmente de {filename}. {puesto}. Competencias detectadas: {', '.join(skills) or 'por revisar'}.",
        summary = summary[0]
    return {
        "nombres": name_parts[0] if name_parts else "",
        "apellidos": name_parts[1] if len(name_parts) > 1 else "",
        "puesto": puesto,
        "resumenPerfil": summary,
        "habilidades": skills,
        "adaptaciones": ["Trabajo remoto"] if "remot" in normalized.lower() else [],
        "email": email_match.group(0) if email_match else "",
        "procesadoLocalmente": True,
    }

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API IncluyeT IA activa"}

@app.get("/api/validar-ruc/{ruc}", response_model=RucResponse)
def validar_ruc(ruc: str, db: Session = Depends(get_db)):
    if len(ruc) != 11 or not ruc.isdigit():
        raise HTTPException(status_code=400, detail="El RUC debe tener 11 dígitos.")

    registro = db.get(RucRegistro, ruc)
    if not registro or not registro.activo:
        return RucResponse(valido=False, mensaje="RUC no encontrado en la base de datos simulada.")
    return RucResponse(valido=True, razon_social=registro.razon_social, mensaje="RUC validado correctamente en la base simulada.")

@app.get("/api/validar-conadis/{dni}", response_model=ConadisResponse)
def validar_conadis(dni: str, db: Session = Depends(get_db)):
    if len(dni) != 8 or not dni.isdigit():
        raise HTTPException(status_code=400, detail="El DNI debe tener 8 dígitos.")

    registro = db.get(ConadisRegistro, dni)
    if not registro or not registro.activo:
        return ConadisResponse(registrado=False, mensaje="DNI no encontrado en la base de datos simulada.")
    return ConadisResponse(registrado=True, carnet=registro.carnet, tipo_discapacidad=registro.tipo_discapacidad, mensaje="Registro CONADIS encontrado en la base simulada.")

@app.post("/api/auth/register/candidato", response_model=AuthResponse)
def register_candidato(request: CandidatoRegisterRequest, db: Session = Depends(get_db)):
    if len(request.dni) != 8 or not request.dni.isdigit():
        raise HTTPException(status_code=400, detail="El DNI debe tener 8 dígitos.")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres.")
    if request.numConadis:
        conadis = db.scalar(select(ConadisRegistro).where(ConadisRegistro.carnet.in_((request.numConadis, f"CONADIS-{request.numConadis}")), ConadisRegistro.activo.is_(True)))
        if not conadis:
            raise HTTPException(status_code=400, detail="El código CONADIS no está registrado en la base simulada.")
    user = User(id=str(uuid4()), email=request.email.lower().strip(), password_hash=hash_password(request.password), role="candidato", verification_token=secrets.token_urlsafe(32))
    user.candidato = Candidato(id=user.id, nombre=request.nombre.strip(), dni=request.dni, num_conadis=request.numConadis, conadis_valido=request.conadisValido)
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=400, detail="El correo o DNI ya está registrado.") from error
    return AuthResponse(verificado=False, mensaje="Cuenta creada. Verifica tu correo para iniciar sesión.", usuario=auth_user(user), token_verificacion=user.verification_token)

@app.post("/api/auth/register/empresa", response_model=AuthResponse)
def register_empresa(request: EmpresaRegisterRequest, db: Session = Depends(get_db)):
    if len(request.ruc) != 11 or not request.ruc.isdigit():
        raise HTTPException(status_code=400, detail="El RUC debe tener 11 dígitos.")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres.")
    ruc = db.get(RucRegistro, request.ruc)
    if not ruc or not ruc.activo:
        raise HTTPException(status_code=400, detail="El RUC no está registrado en la base simulada.")
    user = User(id=str(uuid4()), email=request.email.lower().strip(), password_hash=hash_password(request.password), role="empresa", verification_token=secrets.token_urlsafe(32))
    user.empresa = Empresa(id=user.id, ruc=request.ruc, razon_social=request.razon_social.strip())
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=400, detail="El correo o RUC ya está registrado.") from error
    return AuthResponse(verificado=False, mensaje="Cuenta creada. Verifica tu correo para iniciar sesión.", usuario=auth_user(user), token_verificacion=user.verification_token)

@app.post("/api/auth/login/candidato", response_model=AuthResponse)
def login_candidato(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == request.usuario.lower().strip(), User.role == "candidato"))
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas o correo no verificado.")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Debes verificar tu correo antes de iniciar sesión.")
    profile = profile_row("candidato", user.id, db)
    if not isinstance(profile, Candidato):
        raise HTTPException(status_code=404, detail="Perfil de candidato no encontrado.")
    return AuthResponse(verificado=True, mensaje="Inicio de sesión correcto.", usuario={**candidato_response(profile, user), "access_token": issue_access_token(user)})

@app.post("/api/auth/login/empresa", response_model=AuthResponse)
def login_empresa(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == request.usuario.lower().strip(), User.role == "empresa"))
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas o correo no verificado.")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Debes verificar tu correo antes de iniciar sesión.")
    profile = profile_row("empresa", user.id, db)
    if not isinstance(profile, Empresa):
        raise HTTPException(status_code=404, detail="Perfil de empresa no encontrado.")
    return AuthResponse(verificado=True, mensaje="Inicio de sesión correcto.", usuario={**empresa_response(profile, user), "access_token": issue_access_token(user)})

@app.post("/api/auth/verify/{token}", response_model=AuthResponse)
def verify_account(token: str, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.verification_token == token))
    if not user:
        raise HTTPException(status_code=400, detail="El enlace de verificación no es válido o ya fue utilizado.")
    user.email_verified = True
    user.verification_token = None
    db.commit()
    profile = profile_row(user.role, user.id, db)
    usuario = candidato_response(profile, user) if isinstance(profile, Candidato) else empresa_response(profile, user)
    return AuthResponse(verificado=True, mensaje="Cuenta verificada correctamente.", usuario=usuario)

@app.put("/api/users/candidato/{user_id}", response_model=AuthResponse)
def update_candidato(user_id: str, request: CandidatoUpdateRequest, authorization: str = Header(...), db: Session = Depends(get_db)):
    user = require_owner(user_id, "candidato", authorization, db)
    profile = db.get(Candidato, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidato no encontrado.")
    values = request.model_dump()
    for key, value in values.items():
        setattr(profile, {"numConadis": "num_conadis", "conadisValido": "conadis_valido", "tituloProfesional": "titulo_profesional", "resumenPerfil": "resumen_perfil", "cvNombreFile": "cv_nombre_file"}.get(key, key), value)
    db.commit()
    return AuthResponse(verificado=True, mensaje="Perfil actualizado.", usuario=candidato_response(profile, user))

@app.delete("/api/users/candidato/{user_id}")
def delete_candidato(user_id: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    require_owner(user_id, "candidato", authorization, db)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Candidato no encontrado.")
    db.delete(user)
    db.commit()
    return {"ok": True, "mensaje": "Cuenta de candidato eliminada."}

@app.put("/api/users/empresa/{user_id}", response_model=AuthResponse)
def update_empresa(user_id: str, request: EmpresaUpdateRequest, authorization: str = Header(...), db: Session = Depends(get_db)):
    user = require_owner(user_id, "empresa", authorization, db)
    profile = db.get(Empresa, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    for key, value in request.model_dump().items():
        setattr(profile, key, value)
    db.commit()
    return AuthResponse(verificado=True, mensaje="Perfil actualizado.", usuario=empresa_response(profile, user))

@app.delete("/api/users/empresa/{user_id}")
def delete_empresa(user_id: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    require_owner(user_id, "empresa", authorization, db)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    db.delete(user)
    db.commit()
    return {"ok": True, "mensaje": "Cuenta de empresa eliminada."}

@app.post("/api/ofertas", response_model=dict)
def crear_oferta(request: OfertaCreateRequest, authorization: str = Header(...), db: Session = Depends(get_db)):
    empresa = authenticated_user(authorization, db)
    if empresa.role != "empresa":
        raise HTTPException(status_code=403, detail="Solo una empresa puede publicar ofertas.")
    if not request.titulo.strip() or not request.funciones.strip():
        raise HTTPException(status_code=400, detail="El título y las funciones son obligatorios.")
    if request.modalidad not in {"Remoto", "Híbrido", "Presencial"}:
        raise HTTPException(status_code=400, detail="La modalidad no es válida.")
    company = db.get(Empresa, empresa.id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    oferta = Oferta(empresa_id=empresa.id, titulo=request.titulo.strip(), modalidad=request.modalidad, ubicacion=request.ubicacion.strip(), experiencia=request.experiencia.strip(), salario=request.salario.strip(), funciones=request.funciones.strip(), adaptaciones=request.adaptaciones)
    db.add(oferta)
    db.commit()
    return oferta_response(oferta, company.razon_social)

@app.get("/api/ofertas", response_model=list[dict])
def listar_ofertas(db: Session = Depends(get_db)):
    ofertas = db.scalars(select(Oferta).where(Oferta.activa.is_(True)).order_by(Oferta.created_at.desc())).all()
    return [oferta_response(oferta, oferta.empresa.razon_social) for oferta in ofertas]

@app.get("/api/ofertas/mis-ofertas", response_model=list[dict])
def listar_mis_ofertas(authorization: str = Header(...), db: Session = Depends(get_db)):
    empresa = authenticated_user(authorization, db)
    if empresa.role != "empresa":
        raise HTTPException(status_code=403, detail="Solo una empresa puede consultar sus ofertas.")
    ofertas = db.scalars(select(Oferta).where(Oferta.empresa_id == empresa.id).order_by(Oferta.created_at.desc())).all()
    return [oferta_response(oferta, oferta.empresa.razon_social) for oferta in ofertas]

@app.post("/api/ofertas/{oferta_id}/postular", response_model=PostulacionResponse)
def postularse(oferta_id: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    candidato_user = authenticated_user(authorization, db)
    if candidato_user.role != "candidato":
        raise HTTPException(status_code=403, detail="Solo un candidato puede postularse.")
    candidato = db.get(Candidato, candidato_user.id)
    oferta = db.get(Oferta, oferta_id)
    if not candidato or not oferta or not oferta.activa:
        raise HTTPException(status_code=404, detail="La oferta no está disponible.")
    existing = db.scalar(select(Postulacion).where(Postulacion.oferta_id == oferta_id, Postulacion.candidato_id == candidato.id))
    if existing:
        raise HTTPException(status_code=409, detail="Ya te postulaste a esta oferta.")
    postulacion = Postulacion(oferta_id=oferta.id, candidato_id=candidato.id)
    db.add(postulacion)
    db.commit()
    db.refresh(postulacion)
    return postulacion_response(postulacion)

@app.get("/api/postulaciones/empresa", response_model=list[PostulacionResponse])
def listar_postulaciones_empresa(authorization: str = Header(...), db: Session = Depends(get_db)):
    empresa = authenticated_user(authorization, db)
    if empresa.role != "empresa":
        raise HTTPException(status_code=403, detail="Solo una empresa puede consultar postulaciones.")
    postulaciones = db.scalars(
        select(Postulacion)
        .join(Postulacion.oferta)
        .where(Oferta.empresa_id == empresa.id)
        .order_by(Postulacion.created_at.desc())
    ).all()
    return [postulacion_response(postulacion) for postulacion in postulaciones]

@app.get("/api/postulaciones/{postulacion_id}/cv")
def descargar_cv_postulacion(postulacion_id: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    from fastapi.responses import Response
    empresa = authenticated_user(authorization, db)
    postulacion = db.get(Postulacion, postulacion_id)
    if not postulacion or postulacion.oferta.empresa_id != empresa.id:
        raise HTTPException(status_code=404, detail="Postulación no encontrada.")
    candidato = postulacion.candidato
    if not candidato.cv_data:
        raise HTTPException(status_code=404, detail="El candidato no tiene un CV cargado.")
    return Response(content=candidato.cv_data, media_type=candidato.cv_content_type, headers={"Content-Disposition": f'attachment; filename="{candidato.cv_nombre_file}"'})

@app.put("/api/ofertas/{oferta_id}", response_model=dict)
def actualizar_oferta(oferta_id: str, request: OfertaUpdateRequest, authorization: str = Header(...), db: Session = Depends(get_db)):
    empresa = authenticated_user(authorization, db)
    oferta = db.get(Oferta, oferta_id)
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada.")
    if empresa.role != "empresa" or oferta.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta oferta.")
    for key, value in request.model_dump().items():
        setattr(oferta, key, value.strip() if isinstance(value, str) else value)
    db.commit()
    return oferta_response(oferta, oferta.empresa.razon_social)

@app.delete("/api/ofertas/{oferta_id}")
def eliminar_oferta(oferta_id: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    empresa = authenticated_user(authorization, db)
    oferta = db.get(Oferta, oferta_id)
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada.")
    if empresa.role != "empresa" or oferta.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta oferta.")
    db.delete(oferta)
    db.commit()
    return {"ok": True, "mensaje": "Oferta eliminada."}

@app.post("/api/users/candidato/{user_id}/cv")
def upload_cv(user_id: str, file: UploadFile = File(...), authorization: str = Header(...), db: Session = Depends(get_db)):
    require_owner(user_id, "candidato", authorization, db)
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El CV debe estar en formato PDF.")
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="El CV no puede superar los 10 MB.")
    profile = db.get(Candidato, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidato no encontrado.")
    profile.cv_nombre_file = file.filename or "cv.pdf"
    profile.cv_content_type = file.content_type
    profile.cv_data = content
    extracted_profile = extract_cv_profile(content, profile.cv_nombre_file)
    db.commit()
    return {"ok": True, "nombre": profile.cv_nombre_file, "perfil": extracted_profile}

@app.get("/api/users/candidato/{user_id}/cv")
def download_cv(user_id: str, authorization: str = Header(...), db: Session = Depends(get_db)):
    from fastapi.responses import Response
    require_owner(user_id, "candidato", authorization, db)
    profile = db.get(Candidato, user_id)
    if not profile or not profile.cv_data:
        raise HTTPException(status_code=404, detail="Este candidato no tiene un CV cargado.")
    return Response(content=profile.cv_data, media_type=profile.cv_content_type, headers={"Content-Disposition": f'attachment; filename="{profile.cv_nombre_file}"'})

@app.post("/api/match", response_model=MatchResponse)
def calcular_match(request: MatchRequest):
    if not request.perfil.strip() or not request.oferta.strip():
        raise HTTPException(status_code=400, detail="El perfil y la oferta no pueden estar vacíos.")

    # Generar embeddings vectoriales (384 dimensiones cada uno)
    embedding_perfil = model.encode([request.perfil])
    embedding_oferta = model.encode([request.oferta])

    # Calcular la similitud del coseno entre ambos vectores
    similitud = cosine_similarity(embedding_perfil, embedding_oferta)[0][0]
    
    # Convertir similitud [-1, 1] a porcentaje [0, 100]
    match_percentage = round(float(max(0, similitud)) * 100, 1)

    # Clasificar nivel de compatibilidad
    if match_percentage >= 75:
        nivel = "Alta Compatibilidad"
    elif match_percentage >= 50:
        nivel = "Compatibilidad Media"
    else:
        nivel = "Baja Compatibilidad"

    return MatchResponse(
        match_percentage=match_percentage,
        nivel=nivel,
        metrica="Similitud del Coseno (SBERT)",
        detalles={
            "procesado": True,
            "vector_dim": embedding_perfil.shape[1]
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)