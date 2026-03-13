import { skills } from '../data/resume'
import './Skills.css'

export default function Skills() {
  return (
    <section id="skills" className="section section--alt">
      <h2 className="section__title">Skills</h2>
      <div className="skills__groups">
        <div className="skills__group">
          <h3 className="skills__label">Languages</h3>
          <div className="skills__list">
            {skills.languages.map((s) => (
              <span key={s} className="skills__item">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="skills__group">
          <h3 className="skills__label">Frameworks & Libraries</h3>
          <div className="skills__list">
            {skills.frameworks.map((s) => (
              <span key={s} className="skills__item">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="skills__group">
          <h3 className="skills__label">Tools & Platforms</h3>
          <div className="skills__list">
            {skills.tools.map((s) => (
              <span key={s} className="skills__item">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
