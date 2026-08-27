import Link from 'next/link'
import { Logo } from '@/components/logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-300 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Plataforma de empleo inclusivo que conecta talento con
            discapacidad y empresas comprometidas en el Perú.
          </p>
        </div>
        <FooterCol
          title="Candidatos"
          links={[
            ['Buscar empleo', '/candidato'],
            ['Crear perfil', '/registro/candidato'],
            ['Cursos del Estado', '/candidato/cursos'],
          ]}
        />
        <FooterCol
          title="Empresas"
          links={[
            ['Publicar oferta', '/registro/empresa'],
            ['Iniciar sesión', '/login/empresa'],
          ]}
        />
        <FooterCol
          title="Recursos"
          links={[
            ['CONADIS', 'https://www.gob.pe/conadis'],
            ['MTPE', 'https://www.gob.pe/mtpe'],
          ]}
        />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-300 px-4 py-4 text-xs text-muted-foreground lg:px-6">
          © {new Date().getFullYear()} IncluyeT. Prototipo con fines
          demostrativos. Conforme a WCAG 2.1 AA.
        </p>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-sm font-bold text-foreground">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
