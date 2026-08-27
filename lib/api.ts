const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthResponse {
  verificado: boolean;
  mensaje: string;
  usuario?: Record<string, unknown>;
  token_verificacion?: string;
}

async function requestAuth(path: string, body: Record<string, string | boolean>) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "No se pudo validar la cuenta.");
  return data as AuthResponse;
}

async function requestJson<T>(path: string, method: string, body?: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "No se pudo completar la operación.");
  return data as T;
}

export function loginCandidato(usuario: string, password: string) {
  return requestAuth("/api/auth/login/candidato", { usuario, password });
}

export function loginEmpresa(usuario: string, password: string) {
  return requestAuth("/api/auth/login/empresa", { usuario, password });
}

export function registerCandidato(data: {
  nombre: string;
  email: string;
  dni: string;
  password: string;
  numConadis: string;
  conadisValido: boolean;
}) {
  return requestAuth("/api/auth/register/candidato", data);
}

export function registerEmpresa(data: {
  ruc: string;
  razon_social: string;
  email: string;
  password: string;
}) {
  return requestAuth("/api/auth/register/empresa", data);
}

export function verifyAccount(token: string) {
  return fetch(`${API_URL}/api/auth/verify/${token}`, { method: "POST" }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "No se pudo verificar la cuenta.");
    return data as AuthResponse;
  });
}

// 1. Análisis de Compatibilidad con Deep Learning (SBERT)
export async function obtenerMatchIA(perfilCandidato: string, descripcionOferta: string) {
  try {
    const res = await fetch(`${API_URL}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        perfil: perfilCandidato,
        oferta: descripcionOferta,
      }),
    });
    
    if (!res.ok) throw new Error("Error en el servidor de IA");
    return await res.json();
  } catch (error) {
    console.error("Error al conectar con la API de IA:", error);
    return null;
  }
}

// 2. Validación de Empresa vía RUC Simulado
export async function validarRUC(ruc: string) {
  try {
    const res = await fetch(`${API_URL}/api/validar-ruc/${ruc}`);
    if (!res.ok) throw new Error("Error en la validación de RUC");
    return await res.json();
  } catch (error) {
    console.error("Error al validar RUC:", error);
    return { valido: false, mensaje: "Error de conexión con el servidor" };
  }
}

// 3. Validación de Carné CONADIS vía DNI Simulado
export async function validarCONADIS(dni: string) {
  try {
    const res = await fetch(`${API_URL}/api/validar-conadis/${dni}`);
    if (!res.ok) throw new Error("Error en la validación de CONADIS");
    return await res.json();
  } catch (error) {
    console.error("Error al validar CONADIS:", error);
    return { registrado: false, mensaje: "Error de conexión con el servidor" };
  }
}

export function updateCandidato(userId: string, data: Record<string, unknown>) {
  return requestJson<AuthResponse>(`/api/users/candidato/${userId}`, "PUT", data);
}

export function deleteCandidato(userId: string) {
  return fetch(`${API_URL}/api/users/candidato/${userId}`, { method: "DELETE" }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "No se pudo eliminar la cuenta.");
    return data as { ok: boolean; mensaje: string };
  });
}

export function updateEmpresa(userId: string, data: Record<string, unknown>) {
  return requestJson<AuthResponse>(`/api/users/empresa/${userId}`, "PUT", data);
}

export function deleteEmpresa(userId: string) {
  return fetch(`${API_URL}/api/users/empresa/${userId}`, { method: "DELETE" }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "No se pudo eliminar la cuenta.");
    return data as { ok: boolean; mensaje: string };
  });
}