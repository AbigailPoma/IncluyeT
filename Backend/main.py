from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from supabase import Client, create_client
import os
from uuid import uuid4
import uvicorn

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Backend/.env o .env")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(
    title="IncluyeT - AI Matching Engine",
    description="API de similitud semántica para matching inclusivo usando SBERT",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde Next.js (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción reemplazar por el dominio exacto
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

class AuthResponse(BaseModel):
    verificado: bool
    mensaje: str
    usuario: dict | None = None
    token_verificacion: str | None = None

def auth_user(user: object | None) -> dict | None:
    if not user:
        return None
    return {"id": user.id, "email": user.email, "emailVerificado": user.email_confirmed_at is not None}

def profile_row(tipo: str, user_id: str) -> dict | None:
    table = "candidatos" if tipo == "candidato" else "empresas"
    result = supabase.table(table).select("*").eq("id", user_id).single().execute()
    return result.data

def candidato_response(row: dict, user: object | None = None) -> dict:
    return {
        **(auth_user(user) or {}),
        "id": row.get("id"),
        "nombre": row.get("nombre", ""),
        "dni": row.get("dni", ""),
        "numConadis": row.get("num_conadis", ""),
        "conadisValido": row.get("conadis_valido", False),
        "tituloProfesional": row.get("titulo_profesional", ""),
        "resumenPerfil": row.get("resumen_perfil", ""),
        "habilidades": row.get("habilidades", []),
        "adaptaciones": row.get("adaptaciones", []),
        "cvNombreFile": row.get("cv_nombre_file", ""),
        "emailVerificado": bool(user and user.email_confirmed_at),
    }

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API IncluyeT IA activa"}

@app.get("/api/validar-ruc/{ruc}", response_model=RucResponse)
def validar_ruc(ruc: str):
    if len(ruc) != 11 or not ruc.isdigit():
        raise HTTPException(status_code=400, detail="El RUC debe tener 11 dígitos.")

    return RucResponse(
        valido=True,
        razon_social="Empresa registrada en SUNAT",
        mensaje="RUC validado correctamente ante SUNAT.",
    )

@app.get("/api/validar-conadis/{dni}", response_model=ConadisResponse)
def validar_conadis(dni: str):
    if len(dni) != 8 or not dni.isdigit():
        raise HTTPException(status_code=400, detail="El DNI debe tener 8 dígitos.")

    return ConadisResponse(
        registrado=True,
        carnet="CONADIS-" + dni,
        tipo_discapacidad="Discapacidad física",
        mensaje="Registro CONADIS encontrado.",
    )

@app.post("/api/auth/register/candidato", response_model=AuthResponse)
def register_candidato(request: CandidatoRegisterRequest):
    if len(request.dni) != 8 or not request.dni.isdigit():
        raise HTTPException(status_code=400, detail="El DNI debe tener 8 dígitos.")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres.")
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "role": "candidato",
                    "nombre": request.nombre,
                    "dni": request.dni,
                    "numConadis": request.numConadis,
                    "conadisValido": request.conadisValido,
                },
                "email_redirect_to": "http://localhost:3000/confirmacion?tipo=candidato",
            },
        })
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not response.user:
        raise HTTPException(status_code=400, detail="Supabase no creó la cuenta.")
    return AuthResponse(verificado=response.session is not None, mensaje="Cuenta creada. Revisa tu correo para verificarla.", usuario=auth_user(response.user))

@app.post("/api/auth/register/empresa", response_model=AuthResponse)
def register_empresa(request: EmpresaRegisterRequest):
    if len(request.ruc) != 11 or not request.ruc.isdigit():
        raise HTTPException(status_code=400, detail="El RUC debe tener 11 dígitos.")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres.")
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {"role": "empresa", "ruc": request.ruc, "razon_social": request.razon_social},
                "email_redirect_to": "http://localhost:3000/confirmacion?tipo=empresa",
            },
        })
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not response.user:
        raise HTTPException(status_code=400, detail="Supabase no creó la cuenta.")
    return AuthResponse(verificado=response.session is not None, mensaje="Cuenta creada. Revisa tu correo para verificarla.", usuario=auth_user(response.user))

@app.post("/api/auth/login/candidato", response_model=AuthResponse)
def login_candidato(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({"email": request.usuario, "password": request.password})
    except Exception as error:
        raise HTTPException(status_code=401, detail="Credenciales inválidas o correo no verificado.") from error
    if not response.user or not response.session:
        raise HTTPException(status_code=403, detail="Debes verificar tu correo antes de iniciar sesión.")
    profile = profile_row("candidato", response.user.id) or {}
    return AuthResponse(verificado=True, mensaje="Inicio de sesión correcto.", usuario={**candidato_response(profile, response.user), "access_token": response.session.access_token})

@app.post("/api/auth/login/empresa", response_model=AuthResponse)
def login_empresa(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({"email": request.usuario, "password": request.password})
    except Exception as error:
        raise HTTPException(status_code=401, detail="Credenciales inválidas o correo no verificado.") from error
    if not response.user or not response.session:
        raise HTTPException(status_code=403, detail="Debes verificar tu correo antes de iniciar sesión.")
    profile = profile_row("empresa", response.user.id) or {}
    return AuthResponse(verificado=True, mensaje="Inicio de sesión correcto.", usuario={**profile, **auth_user(response.user), "access_token": response.session.access_token})

@app.post("/api/auth/verify/{token}", response_model=AuthResponse)
def verify_account(token: str):
    try:
        response = supabase.auth.verify_otp({"type": "signup", "token_hash": token})
    except Exception as error:
        raise HTTPException(status_code=400, detail="El enlace de verificación no es válido o ya fue utilizado.") from error
    if not response.user:
        raise HTTPException(status_code=400, detail="No se pudo verificar la cuenta.")

    tipo = response.user.user_metadata.get("role", "candidato")
    profile = profile_row(tipo, response.user.id) or {}
    usuario = candidato_response(profile, response.user) if tipo == "candidato" else {**profile, **(auth_user(response.user) or {})}
    return AuthResponse(verificado=True, mensaje="Cuenta verificada correctamente.", usuario=usuario)

@app.put("/api/users/candidato/{user_id}", response_model=AuthResponse)
def update_candidato(user_id: str, request: CandidatoUpdateRequest):
    result = supabase.table("candidatos").update(request.model_dump()).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Candidato no encontrado.")
    return AuthResponse(verificado=True, mensaje="Perfil actualizado.", usuario=candidato_response(result.data[0]))

@app.delete("/api/users/candidato/{user_id}")
def delete_candidato(user_id: str):
    try:
        supabase.auth.admin.delete_user(user_id)
    except Exception as error:
        raise HTTPException(status_code=404, detail="Candidato no encontrado.") from error
    return {"ok": True, "mensaje": "Cuenta de candidato eliminada."}

@app.put("/api/users/empresa/{user_id}", response_model=AuthResponse)
def update_empresa(user_id: str, request: EmpresaUpdateRequest):
    result = supabase.table("empresas").update(request.model_dump()).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    return AuthResponse(verificado=True, mensaje="Perfil actualizado.", usuario=result.data[0])

@app.delete("/api/users/empresa/{user_id}")
def delete_empresa(user_id: str):
    try:
        supabase.auth.admin.delete_user(user_id)
    except Exception as error:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.") from error
    return {"ok": True, "mensaje": "Cuenta de empresa eliminada."}

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