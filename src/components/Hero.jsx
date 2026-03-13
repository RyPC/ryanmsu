import { personal } from '../data/resume'
import './Hero.css'

export default function Hero() {
  const scrollToWork = () => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="hero">
      <span className="hero__badge">{personal.graduation}</span>
      <h1 className="hero__name">{personal.name}</h1>
      <p className="hero__tagline">{personal.tagline}</p>
      <p className="hero__subline">
        Previously SWE at Veeva • Co-founder at{' '}
        <a href="https://gowithapartner.com" target="_blank" rel="noopener noreferrer">
          GoWith
        </a>
        {' '}• Internal Vice President at{' '}
        <a href="https://ctc-uci.com" target="_blank" rel="noopener noreferrer">
          Commit the Change
        </a>
      </p>
      <button className="hero__cta" onClick={scrollToWork}>
        View My Work
      </button>
    </section>
  )
}
