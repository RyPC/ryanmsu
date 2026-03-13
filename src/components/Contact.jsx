import { personal } from '../data/resume'
import './Contact.css'

export default function Contact() {
  return (
    <section id="contact" className="section">
      <h2 className="section__title">Contact</h2>
      <p className="contact__cta">Let&apos;s build something together.</p>
      <div className="contact__links">
        <a href={`mailto:${personal.email}`} className="contact__link">
          {personal.email}
        </a>
        <a
          href={personal.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
        >
          LinkedIn
        </a>
        <a
          href={personal.github}
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
        >
          GitHub
        </a>
      </div>
      <p className="contact__footer">
        Made with <span className="contact__heart">♥</span> — Ryan Su
      </p>
    </section>
  )
}
