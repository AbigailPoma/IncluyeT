export type Company = {
  id: string
  name: string
  initials: string
  sector: string
  location: string
  openRoles: number
  accreditations: string[]
}

export const companies: Company[] = [
  {
    id: 'tech-peru',
    name: 'Tech Perú',
    initials: 'TP',
    sector: 'Tecnología',
    location: 'Lima',
    openRoles: 6,
    accreditations: ['Empresa Inclusiva MTPE', 'Sello CONADIS'],
  },
  {
    id: 'banco-andino',
    name: 'Banco Andino',
    initials: 'BA',
    sector: 'Finanzas',
    location: 'Lima / Arequipa',
    openRoles: 4,
    accreditations: ['Sello CONADIS'],
  },
  {
    id: 'salud-total',
    name: 'Salud Total',
    initials: 'ST',
    sector: 'Salud',
    location: 'Trujillo',
    openRoles: 3,
    accreditations: ['Empresa Inclusiva MTPE'],
  },
  {
    id: 'retail-sur',
    name: 'Retail Sur',
    initials: 'RS',
    sector: 'Comercio',
    location: 'Cusco',
    openRoles: 5,
    accreditations: ['Sello CONADIS', 'Accesibilidad AA'],
  },
]

export type Job = {
  id: string
  title: string
  company: string
  location: string
  modality: 'Remoto' | 'Híbrido' | 'Presencial'
  salary: string
  posted: string
  adaptations: string[]
}

export const jobs: Job[] = [
  {
    id: 'j1',
    title: 'Analista de Datos Junior',
    company: 'Tech Perú',
    location: 'Lima',
    modality: 'Remoto',
    salary: 'S/ 2,800 - 3,500',
    posted: 'Hace 2 días',
    adaptations: ['Trabajo remoto', 'Jornada flexible', 'Software lector de pantalla'],
  },
  {
    id: 'j2',
    title: 'Asistente Administrativo',
    company: 'Banco Andino',
    location: 'Arequipa',
    modality: 'Híbrido',
    salary: 'S/ 2,200 - 2,600',
    posted: 'Hace 3 días',
    adaptations: ['Accesibilidad física', 'Intérprete LSP disponible'],
  },
  {
    id: 'j3',
    title: 'Diseñador/a UX',
    company: 'Retail Sur',
    location: 'Cusco',
    modality: 'Remoto',
    salary: 'S/ 3,200 - 4,000',
    posted: 'Hace 5 días',
    adaptations: ['Trabajo remoto', 'Herramientas accesibles', 'Mentoría'],
  },
  {
    id: 'j4',
    title: 'Recepcionista Bilingüe',
    company: 'Salud Total',
    location: 'Trujillo',
    modality: 'Presencial',
    salary: 'S/ 1,800 - 2,100',
    posted: 'Hace 1 semana',
    adaptations: ['Accesibilidad física', 'Rampa y ascensor', 'Baño adaptado'],
  },
]

export type Course = {
  id: string
  title: string
  entity: 'MTPE' | 'CONADIS' | 'SENATI'
  modality: 'Virtual' | 'Presencial' | 'Semipresencial'
  duration: string
  seats: string
  topic: string
}

export const courses: Course[] = [
  {
    id: 'c1',
    title: 'Habilidades Digitales para el Empleo',
    entity: 'MTPE',
    modality: 'Virtual',
    duration: '40 horas',
    seats: 'Inscripciones abiertas',
    topic: 'Tecnología',
  },
  {
    id: 'c2',
    title: 'Emprendimiento Inclusivo',
    entity: 'CONADIS',
    modality: 'Semipresencial',
    duration: '60 horas',
    seats: '12 vacantes',
    topic: 'Negocios',
  },
  {
    id: 'c3',
    title: 'Atención al Cliente Accesible',
    entity: 'SENATI',
    modality: 'Presencial',
    duration: '30 horas',
    seats: '8 vacantes',
    topic: 'Servicios',
  },
  {
    id: 'c4',
    title: 'Ofimática Certificada',
    entity: 'MTPE',
    modality: 'Virtual',
    duration: '50 horas',
    seats: 'Inscripciones abiertas',
    topic: 'Tecnología',
  },
  {
    id: 'c5',
    title: 'Lengua de Señas Peruana Nivel 1',
    entity: 'CONADIS',
    modality: 'Virtual',
    duration: '45 horas',
    seats: '20 vacantes',
    topic: 'Comunicación',
  },
  {
    id: 'c6',
    title: 'Contabilidad Básica',
    entity: 'SENATI',
    modality: 'Semipresencial',
    duration: '80 horas',
    seats: '15 vacantes',
    topic: 'Negocios',
  },
]

export const companyProfile = {
  id: 'tech-peru',
  name: 'Tech Perú',
  sector: 'Tecnología',
  location: 'Lima, Perú',
  size: '250+',
  inclusionScore: 'AA',
  about:
    'Somos una empresa de tecnología comprometida con la transformación digital del país. Creemos que la diversidad de nuestro equipo es nuestra mayor fortaleza y trabajamos activamente para construir un entorno donde todas las personas puedan desarrollar su máximo potencial.',
  accreditations: ['Empresa Inclusiva MTPE', 'Sello CONADIS', 'Accesibilidad Web AA'],
  culture: [
    'Espacios físicos accesibles con rampas, ascensores y baños adaptados.',
    'Servicio de intérprete de lengua de señas peruana en reuniones clave.',
    'Modalidades de trabajo remoto e híbrido con jornadas flexibles.',
    'Programa de mentoría y capacitación continua para todo el equipo.',
    'Documentación y software compatibles con lectores de pantalla.',
  ],
}
