import Link from 'next/link'
import { BookOpen, Heart, Globe, Users, Zap } from 'lucide-react'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { label: 'About EduBridge', href: '/about' },
      { label: 'How it Works', href: '/how-it-works' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ],
    features: [
      { label: 'AI Tutor', href: '/features/ai-tutor' },
      { label: 'OCR Notes', href: '/features/ocr' },
      { label: 'Wellness Check', href: '/features/wellness' },
      { label: 'Offline Mode', href: '/features/offline' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Community', href: '/community' },
      { label: 'Accessibility', href: '/accessibility' }
    ]
  }

  return (
    <footer className={cn(
      "bg-muted/30 border-t border-border mt-auto",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary rounded-lg p-2">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">EduBridge</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              AI-powered learning platform bridging educational gaps in underserved communities. 
              Quality education for everyone, everywhere.
            </p>
            
            {/* SDG Alignment */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Supporting UN SDG 4: Quality Education</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Features</h3>
            <ul className="space-y-2">
              {footerLinks.features.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              <span>© {currentYear} EduBridge. All rights reserved.</span>
            </div>

            {/* Mission Statement */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for inclusive education</span>
            </div>

            {/* Key Values */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Inclusive</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>Accessible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
