import './globals.css'

export const metadata = {
  title: {
    default:  'AutoReport AI — Relatórios empresariais automáticos',
    template: '%s | AutoReport AI',
  },
  description: 'Controle vendas, gerencie finanças e gere relatórios em PDF e Excel em segundos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website', locale: 'pt_BR',
    title: 'AutoReport AI',
    description: 'Relatórios empresariais automáticos com dashboard em tempo real.',
    siteName: 'AutoReport AI',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
