import './ExperienceCard.css'

export default function ExperienceCard({ company, role, location, dates, url, highlights }) {
  return (
    <article className="experience-card">
      <div className="experience-card__header">
        <div>
          <h3 className="experience-card__company">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {company}
              </a>
            ) : (
              company
            )}
          </h3>
          <p className="experience-card__role">{role}</p>
        </div>
        <div className="experience-card__meta">
          <span className="experience-card__dates">{dates}</span>
          <span className="experience-card__location">{location}</span>
        </div>
      </div>
      <ul className="experience-card__highlights">
        {highlights.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </article>
  )
}
