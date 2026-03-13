import { projects } from '../data/resume'
import ProjectCard from './ProjectCard'
import './Projects.css'

export default function Projects() {
  return (
    <section id="projects" className="section">
      <h2 className="section__title">Projects</h2>
      <div className="projects__grid">
        {projects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
    </section>
  )
}
