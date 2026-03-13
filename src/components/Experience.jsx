import { experience } from '../data/resume'
import ExperienceCard from './ExperienceCard'
import './Experience.css'

export default function Experience() {
  return (
    <section id="experience" className="section section--alt">
      <h2 className="section__title">Experience</h2>
      <div className="experience__list">
        {experience.map((job) => (
          <ExperienceCard key={`${job.company}-${job.dates}`} {...job} />
        ))}
      </div>
    </section>
  )
}
