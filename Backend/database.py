from datetime import datetime
from pathlib import Path
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, LargeBinary, String, Text, UniqueConstraint, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    role: Mapped[str] = mapped_column(String(20), index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_token: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidato: Mapped["Candidato | None"] = relationship(back_populates="user", cascade="all, delete-orphan")
    empresa: Mapped["Empresa | None"] = relationship(back_populates="user", cascade="all, delete-orphan")


class Candidato(Base):
    __tablename__ = "candidatos"

    id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(160))
    dni: Mapped[str] = mapped_column(String(8), unique=True)
    num_conadis: Mapped[str] = mapped_column(String(80), default="")
    conadis_valido: Mapped[bool] = mapped_column(Boolean, default=False)
    titulo_profesional: Mapped[str] = mapped_column(String(160), default="")
    resumen_perfil: Mapped[str] = mapped_column(Text, default="")
    habilidades: Mapped[list[str]] = mapped_column(JSON, default=list)
    adaptaciones: Mapped[list[str]] = mapped_column(JSON, default=list)
    cv_nombre_file: Mapped[str] = mapped_column(String(255), default="")
    cv_content_type: Mapped[str] = mapped_column(String(100), default="application/pdf")
    cv_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    telefono: Mapped[str] = mapped_column(String(40), default="")
    departamento: Mapped[str] = mapped_column(String(100), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="candidato")


class Empresa(Base):
    __tablename__ = "empresas"

    id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    ruc: Mapped[str] = mapped_column(String(11), unique=True)
    razon_social: Mapped[str] = mapped_column(String(180))
    sector: Mapped[str] = mapped_column(String(120), default="")
    ciudad: Mapped[str] = mapped_column(String(120), default="")
    colaboradores: Mapped[str] = mapped_column(String(80), default="")
    descripcion: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="empresa")
    ofertas: Mapped[list["Oferta"]] = relationship(back_populates="empresa", cascade="all, delete-orphan")


class Oferta(Base):
    __tablename__ = "ofertas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    empresa_id: Mapped[str] = mapped_column(String(36), ForeignKey("empresas.id", ondelete="CASCADE"), index=True)
    titulo: Mapped[str] = mapped_column(String(180))
    modalidad: Mapped[str] = mapped_column(String(20))
    ubicacion: Mapped[str] = mapped_column(String(160), default="")
    experiencia: Mapped[str] = mapped_column(String(160), default="")
    salario: Mapped[str] = mapped_column(String(120), default="")
    funciones: Mapped[str] = mapped_column(Text)
    adaptaciones: Mapped[list[str]] = mapped_column(JSON, default=list)
    activa: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    empresa: Mapped[Empresa] = relationship(back_populates="ofertas")
    postulaciones: Mapped[list["Postulacion"]] = relationship(back_populates="oferta", cascade="all, delete-orphan")


class Postulacion(Base):
    __tablename__ = "postulaciones"
    __table_args__ = (UniqueConstraint("oferta_id", "candidato_id", name="uq_postulacion_oferta_candidato"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    oferta_id: Mapped[str] = mapped_column(String(36), ForeignKey("ofertas.id", ondelete="CASCADE"), index=True)
    candidato_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidatos.id", ondelete="CASCADE"), index=True)
    estado: Mapped[str] = mapped_column(String(30), default="recibida")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    oferta: Mapped[Oferta] = relationship(back_populates="postulaciones")
    candidato: Mapped[Candidato] = relationship()


class OfertaGuardada(Base):
    __tablename__ = "ofertas_guardadas"
    __table_args__ = (UniqueConstraint("oferta_id", "candidato_id", name="uq_oferta_guardada"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    oferta_id: Mapped[str] = mapped_column(String(36), ForeignKey("ofertas.id", ondelete="CASCADE"), index=True)
    candidato_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidatos.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    oferta: Mapped[Oferta] = relationship()


class Curso(Base):
    __tablename__ = "cursos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    titulo: Mapped[str] = mapped_column(String(180))
    entidad: Mapped[str] = mapped_column(String(40))
    modalidad: Mapped[str] = mapped_column(String(40))
    duracion: Mapped[str] = mapped_column(String(80))
    cupos: Mapped[str] = mapped_column(String(100))
    tema: Mapped[str] = mapped_column(String(100))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)


class Inscripcion(Base):
    __tablename__ = "inscripciones"
    __table_args__ = (UniqueConstraint("curso_id", "candidato_id", name="uq_inscripcion_curso_candidato"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    curso_id: Mapped[str] = mapped_column(String(36), ForeignKey("cursos.id", ondelete="CASCADE"), index=True)
    candidato_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidatos.id", ondelete="CASCADE"), index=True)
    estado: Mapped[str] = mapped_column(String(30), default="inscrito")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    curso: Mapped[Curso] = relationship()


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tipo: Mapped[str] = mapped_column(String(30))
    titulo: Mapped[str] = mapped_column(String(180))
    cuerpo: Mapped[str] = mapped_column(Text)
    leida: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RucRegistro(Base):
    __tablename__ = "ruc_registros"

    ruc: Mapped[str] = mapped_column(String(11), primary_key=True)
    razon_social: Mapped[str] = mapped_column(String(180))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ConadisRegistro(Base):
    __tablename__ = "conadis_registros"

    dni: Mapped[str] = mapped_column(String(8), primary_key=True)
    carnet: Mapped[str] = mapped_column(String(80), unique=True)
    tipo_discapacidad: Mapped[str] = mapped_column(String(160))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


DATABASE_URL = ""


def configure_database(database_url: str):
    global DATABASE_URL
    DATABASE_URL = database_url
    engine = create_engine(database_url, pool_pre_ping=True)
    return engine, sessionmaker(bind=engine, autoflush=False, autocommit=False)


def ensure_legacy_columns(engine):
    with engine.begin() as connection:
        for column in ("telefono", "departamento"):
            connection.execute(text(f"ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS {column} VARCHAR(100) NOT NULL DEFAULT ''"))


def run_seed(session_factory, seed_path: str | Path):
    seed_sql = Path(seed_path).read_text(encoding="utf-8")
    with session_factory() as db:
        db.execute(text(seed_sql))
        db.commit()