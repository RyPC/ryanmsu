export type CheckpointIcon = 'campsite' | 'peak' | 'lab' | 'computer' | 'startup' | 'trailhead'
export type CheckpointType = 'trailhead' | 'checkpoint' | 'summit'
export type CheckpointVariant = 'experience' | 'project' | 'education'
export type SideTrailBranchSide = 'left' | 'right'

export interface SideTrailEndpoint {
  side: SideTrailBranchSide
  /**
   * Horizontal offset in TrailLayer SVG units (0-400 width).
   * Positive values move farther to the selected side.
   */
  xOffset?: number
  /**
   * Vertical offset in TrailLayer SVG units (0-4000 height).
   * Positive values move endpoint lower than the branch start.
   */
  yOffset?: number
  /** Optional compact label override shown next to marker. */
  label?: string
}

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
  sideTrailEndpoint?: SideTrailEndpoint
  /**
   * Multiplier applied to the branch path length (default 1.0).
   * Values > 1.0 produce longer detours; values < 1.0 produce shorter ones.
   * Scales both the visual branch geometry and pin travel duration.
   */
  branchLength?: number
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
    sideTrailEndpoint: {
      side: 'left',
      xOffset: 632,
      yOffset: 95,
    },
    branchLength: 0.8,
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
    sideTrailEndpoint: {
      side: 'left',
      xOffset: 592,
      yOffset: 100,
    },
    branchLength: 1.0,
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
    sideTrailEndpoint: {
      side: 'right',
      xOffset: 672,
      yOffset: 88,
    },
    branchLength: 1.3,
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
    sideTrailEndpoint: {
      side: 'left',
      xOffset: 648,
      yOffset: 105,
    },
    branchLength: 1.15,
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
    sideTrailEndpoint: {
      side: 'right',
      xOffset: 700,
      yOffset: 92,
    },
    branchLength: 1.5,
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
    sideTrailEndpoint: {
      side: 'left',
      xOffset: 608,
      yOffset: 98,
    },
    branchLength: 0.9,
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
