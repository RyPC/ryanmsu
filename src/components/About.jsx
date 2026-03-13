import { personal } from '../data/resume'
import './About.css'

export default function About() {
  return (
    <section id="about" className="section">
      <h2 className="section__title">About</h2>
      <p className="about__text">{personal.bio}</p>
    </section>
  )
}
