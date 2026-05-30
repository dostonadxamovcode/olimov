import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6]">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Olimov</span>
            </Link>
            <p className="text-gray-400 text-sm">{t('footer.tagline')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-[#0ea5e9] transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/#services" className="text-gray-400 text-sm hover:text-[#0ea5e9] transition-colors">{t('footer.services')}</Link></li>
              <li><Link to="/#results" className="text-gray-400 text-sm hover:text-[#0ea5e9] transition-colors">{t('footer.results')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.contact')}</h3>
            <p className="text-gray-400 text-sm mb-2">Email: olimovmax2003@gmail.com</p>
            <p className="text-gray-400 text-sm">Phone: +998 90 040 67 28</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; {currentYear} Olimov. {t('footer.allRights')}</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-[#0ea5e9] transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-[#0ea5e9] transition-colors">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
