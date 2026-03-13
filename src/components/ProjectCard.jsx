import './ProjectCard.css'

export default function ProjectCard({ name, tech, description, period, repo, demo }) {
  const hasLinks = repo || demo

  return (
    <article className="project-card">
      <h3 className="project-card__name">{name}</h3>
      <span className="project-card__period">{period}</span>
      <p className="project-card__description">{description}</p>
      <div className="project-card__tech">
        {tech.map((t) => (
          <span key={t} className="project-card__tag">
            {t}
          </span>
        ))}
      </div>
      {hasLinks && (
        <div className="project-card__links">
          {repo && (
            <a href={repo} target="_blank" rel="noopener noreferrer" className="project-card__link">
              View on GitHub →
            </a>
          )}
          {demo && (
            <a href={demo} target="_blank" rel="noopener noreferrer" className="project-card__link">
              View demo →
            </a>
          )}
        </div>
      )}
    </article>
  )
}
