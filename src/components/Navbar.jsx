import { useState, useEffect } from 'react'
import './Navbar.css'

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

const getActiveSection = () => {
  if (window.scrollY < 100) return ''
  const scrollY = window.scrollY + 120
  let active = ''
  for (const { id } of navItems) {
    const el = document.getElementById(id)
    if (el && el.offsetTop <= scrollY) active = id
  }
  return active
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setActiveSection(getActiveSection())
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      role="banner"
    >
      <nav className="navbar__inner">
        <a href="#" className="navbar__logo" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
          Ryan Su
        </a>
        <button
          className="navbar__toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(id); }}
                className={`navbar__link ${activeSection === id ? 'navbar__link--active' : ''}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
