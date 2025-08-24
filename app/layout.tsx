import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'EduBridge - AI-Powered Learning Platform',
    template: '%s | EduBridge'
  },
  description: 'EduBridge is an AI-powered learning platform for underserved communities, providing quality education through innovative technology. Features include AI tutoring, OCR-based flashcard generation, wellness monitoring, and offline-first learning.',
  keywords: [
    'education',
    'AI tutoring',
    'learning platform',
    'underserved communities',
    'quality education',
    'SDG 4',
    'AI-powered learning',
    'OCR flashcards',
    'student wellness',
    'inclusive education',
    'multilingual learning',
    'offline education'
  ],
  authors: [{ name: 'EduBridge Team' }],
  creator: 'EduBridge',
  publisher: 'EduBridge',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://edubridge.org',
    siteName: 'EduBridge',
    title: 'EduBridge - AI-Powered Learning for Everyone',
    description: 'Quality education through AI-powered tools for underserved communities. Learn with AI tutoring, interactive flashcards, and wellness support.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EduBridge - AI-Powered Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduBridge - AI-Powered Learning Platform',
    description: 'Quality education through AI-powered tools for underserved communities.',
    creator: '@edubridge',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#22c55e',
    'color-scheme': 'light dark',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'EduBridge',
    'application-name': 'EduBridge',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#22c55e',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for potential API endpoints */}
        <link rel="dns-prefetch" href="//api.edubridge.org" />
        
        {/* Performance hints */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Educational context and SDG alignment */}
        <meta name="educationalAlignment" content="UN SDG 4: Quality Education" />
        <meta name="audience" content="students, teachers, educators" />
        <meta name="educationalLevel" content="primary, secondary, adult education" />
        
        {/* Structured data for educational platform */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "EduBridge",
              description: "AI-powered learning platform for underserved communities",
              url: "https://edubridge.org",
              logo: "https://edubridge.org/logo.png",
              sameAs: [
                "https://twitter.com/edubridge",
                "https://linkedin.com/company/edubridge"
              ],
              educationalCredentialAwarded: "Digital Certificates",
              hasEducationalUse: "AI Tutoring, Interactive Learning, Wellness Support",
              teaches: "Mathematics, Science, Languages, General Education",
              audience: {
                "@type": "EducationalAudience",
                educationalRole: ["student", "teacher"],
                audienceType: "underserved communities"
              }
            })
          }}
        />
      </head>
      <body 
        className={`
          ${inter.className} 
          min-h-screen 
          bg-background 
          text-foreground 
          antialiased 
          selection:bg-primary/20 
          selection:text-primary-foreground
          scroll-smooth
          focus-within:scroll-auto
        `}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200"
        >
          Skip to main content
        </a>

        {/* Global loading indicator */}
        <div id="global-loading" className="hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading EduBridge...</p>
            </div>
          </div>
        </div>

        {/* Main application content */}
        <div id="main-content" className="relative min-h-screen flex flex-col">
          {children}
        </div>

        {/* Service Worker registration for offline functionality */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />

        {/* Global error boundary */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                console.error('Global error:', e.error);
                // In production, you might want to send this to an error reporting service
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
                // In production, you might want to send this to an error reporting service
              });
            `,
          }}
        />

        {/* Theme initialization to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('edubridge_theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                console.warn('Could not load theme preference:', e);
              }
            `,
          }}
        />

        {/* Accessibility announcements */}
        <div
          id="aria-live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Performance monitoring (placeholder for production) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                    console.log('Page load time:', loadTime + 'ms');
                    
                    // In production, you might want to send this data to analytics
                  }, 0);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
