export type CheckpointIcon = 'campsite' | 'peak' | 'lab' | 'computer' | 'startup' | 'trailhead'
export type CheckpointType = 'trailhead' | 'checkpoint' | 'summit'
export type CheckpointVariant = 'experience' | 'project' | 'education'

export interface Checkpoint {
  id: string
  title: string
  type: CheckpointType
  variant: CheckpointVariant
  description: string
  locationOnTrail: number
  icon: CheckpointIcon
  techStack?: string[]
  sideTrail?: boolean
  sideTrailId?: string
  url?: string
  dates?: string
}

export const experiences: Checkpoint[] = [
  {
    id: 'trailhead',
    title: 'Ryan Su',
    type: 'trailhead',
    variant: 'experience',
    description:
      "Computer Science at UC Irvine '26. Building software for impact — scalable systems, tech for social good, and the occasional ski run.",
    locationOnTrail: 0.02,
    icon: 'trailhead',
    sideTrail: false,
  },
  {
    id: 'first-projects',
    title: 'First Projects',
    type: 'checkpoint',
    variant: 'project',
    description:
      '191 For 191 — MERN stack database of 70+ UCI capstone projects. Heart Sensor Device — ESP32 IoT for remote health monitoring.',
    locationOnTrail: 0.15,
    icon: 'campsite',
    techStack: ['MongoDB', 'Express', 'React', 'Node.js', 'C++', 'ESP32', 'AWS'],
    sideTrail: true,
    sideTrailId: 'first-projects',
  },
  {
    id: 'uc-irvine',
    title: 'UC Irvine',
    type: 'checkpoint',
    variant: 'education',
    description:
      'Computer Science student, GPA 3.9. Graduating March 2026. Building foundations in systems, algorithms, and software engineering.',
    locationOnTrail: 0.25,
    icon: 'peak',
    sideTrail: false,
  },
  {
    id: 'biorobotics',
    title: 'Biorobotics Laboratory',
    type: 'checkpoint',
    variant: 'experience',
    description:
      'Software Developer Intern. Built LLM-driven chatbot with OpenAI APIs, data privacy via NLP detection, AWS RDS infrastructure.',
    locationOnTrail: 0.35,
    icon: 'lab',
    techStack: ['Python', 'OpenAI', 'NLP', 'AWS RDS', 'PostgreSQL'],
    sideTrail: true,
    sideTrailId: 'biorobotics',
    dates: 'June 2024 – Oct. 2024',
  },
  {
    id: 'commit-the-change',
    title: 'Commit the Change',
    type: 'checkpoint',
    variant: 'experience',
    description:
      'Internal Vice President. React + Node.js apps for nonprofits, 200+ hours saved/year. Team of 14, Scrum, AWS deployment.',
    locationOnTrail: 0.45,
    icon: 'computer',
    techStack: ['React', 'Node.js', 'AWS EC2', 'S3', 'PostgreSQL'],
    sideTrail: true,
    sideTrailId: 'commit-the-change',
    url: 'https://ctc-uci.com',
    dates: 'Oct. 2024 – Present',
  },
  {
    id: 'veeva',
    title: 'Veeva Systems',
    type: 'checkpoint',
    variant: 'experience',
    description:
      'Software Engineer Intern. Search services with Java/Spring Boot. React dashboard for 6,000+ EC2 nodes. Automated maintenance scheduling.',
    locationOnTrail: 0.6,
    icon: 'computer',
    techStack: ['Java', 'Spring Boot', 'React', 'JavaScript'],
    sideTrail: true,
    sideTrailId: 'veeva',
    url: 'https://www.veeva.com',
    dates: 'June 2025 – Sept. 2025',
  },
  {
    id: 'gowith',
    title: 'GoWith LLC',
    type: 'checkpoint',
    variant: 'experience',
    description:
      'Co-founder / Lead Engineer. React Native app, Supabase/PostgreSQL, RLS. OAuth, real-time messaging, Sentry, API rate limiting.',
    locationOnTrail: 0.75,
    icon: 'startup',
    techStack: ['React Native', 'TypeScript', 'Supabase', 'PostgreSQL'],
    sideTrail: true,
    sideTrailId: 'gowith',
    url: 'https://gowithapartner.com',
    dates: 'June 2025 – Present',
  },
  {
    id: 'anthropology-research',
    title: 'Anthropology Research',
    type: 'checkpoint',
    variant: 'experience',
    description:
      'Research Assistant. GPT-4o labeling automation, 80% time reduction. Data pipelines, MongoDB, React visualization app.',
    locationOnTrail: 0.85,
    icon: 'lab',
    techStack: ['OpenAI GPT-4o', 'MongoDB', 'React', 'Node.js'],
    sideTrail: true,
    sideTrailId: 'anthropology-research',
    dates: 'Feb. 2025 – Present',
  },
  {
    id: 'summit',
    title: 'The Summit',
    type: 'summit',
    variant: 'experience',
    description:
      'Building impactful software at scale. Full-stack systems, clean architecture, and tech that makes a difference.',
    locationOnTrail: 0.95,
    icon: 'peak',
    sideTrail: false,
  },
]
