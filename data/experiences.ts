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
  links?: Array<{ label: string; href: string }>
  dates?: string
  /**
   * When true, this checkpoint is a landmark — rendered directly on the trail
   * with a glowing orange dot and a binary-snap blurb card. No branch or modal.
   */
  isLandmark?: boolean
}

// --- Location assignment ---
// Trailhead and summit are pinned. All entries in between are distributed
// evenly between TRAIL_START and TRAIL_END — add or remove entries freely.
const TRAILHEAD_LOCATION = 0.02
const SUMMIT_LOCATION = 0.95
const TRAIL_START = 0.25
const TRAIL_END = 0.90

type CheckpointDraft = Omit<Checkpoint, 'locationOnTrail'>

function assignLocations(drafts: CheckpointDraft[]): Checkpoint[] {
  const middle = drafts.filter(d => d.type !== 'trailhead' && d.type !== 'summit')
  return drafts.map(d => {
    if (d.type === 'trailhead') return { ...d, locationOnTrail: TRAILHEAD_LOCATION }
    if (d.type === 'summit') return { ...d, locationOnTrail: SUMMIT_LOCATION }
    const idx = middle.indexOf(d)
    const location =
      middle.length === 1
        ? (TRAIL_START + TRAIL_END) / 2
        : TRAIL_START + (idx / (middle.length - 1)) * (TRAIL_END - TRAIL_START)
    return { ...d, locationOnTrail: location }
  })
}

// --- Data ---
// Do not add locationOnTrail here — it is computed automatically from array order.

const checkpointData: CheckpointDraft[] = [
  {
    id: 'trailhead',
    title: 'Ryan Su',
    type: 'trailhead',
    variant: 'experience',
    description:
      "Computer Science at UC Irvine '26. Building software for impact — scalable systems, tech for social good, and the occasional ski run.",
    icon: 'trailhead',
    sideTrail: false,
  },
  {
    id: 'about-me',
    title: 'About Me',
    type: 'checkpoint',
    variant: 'education',
    description:
      "Incoming SWE @ BlackRock. CS grad from UC Irvine, GPA 3.9. Built distributed search infrastructure at Veeva Systems, shipped apps saving nonprofits 200+ hours a year, and co-founded a React Native startup.",
    icon: 'trailhead',
    sideTrail: false,
    isLandmark: true,
    links: [
      { label: 'GitHub', href: 'https://github.com/RyPC' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/ryan-m-su' },
    ],
  },
  {
    id: 'first-projects',
    title: 'First Projects',
    type: 'checkpoint',
    variant: 'project',
    description:
      '191 For 191 — MERN stack database of 70+ UCI capstone projects. Heart Sensor Device — ESP32 IoT for remote health monitoring.',
    icon: 'campsite',
    techStack: ['MongoDB', 'Express', 'React', 'Node.js', 'C++', 'ESP32', 'AWS'],
    sideTrail: true,
    sideTrailId: 'first-projects',
    sideTrailEndpoint: { side: 'left' },
    branchLength: 0.8,
  },
  {
    id: 'uc-irvine',
    title: 'UC Irvine',
    type: 'checkpoint',
    variant: 'education',
    description:
      'Computer Science, GPA 3.92. Graduated March 2026. B.S. from UC Irvine.',
    icon: 'peak',
    sideTrail: false,
    isLandmark: true,
  },
  {
    id: 'biorobotics',
    title: 'Biorobotics Laboratory',
    type: 'checkpoint',
    variant: 'experience',
    description:
      'Software Developer Intern. Built LLM-driven chatbot with OpenAI APIs, data privacy via NLP detection, AWS RDS infrastructure.',
    icon: 'lab',
    techStack: ['Python', 'OpenAI', 'NLP', 'AWS RDS', 'PostgreSQL'],
    sideTrail: true,
    sideTrailId: 'biorobotics',
    sideTrailEndpoint: { side: 'left' },
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
    icon: 'computer',
    techStack: ['React', 'Node.js', 'AWS EC2', 'S3', 'PostgreSQL'],
    sideTrail: true,
    sideTrailId: 'commit-the-change',
    sideTrailEndpoint: { side: 'right' },
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
    icon: 'computer',
    techStack: ['Java', 'Spring Boot', 'React', 'JavaScript'],
    sideTrail: true,
    sideTrailId: 'veeva',
    sideTrailEndpoint: { side: 'left' },
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
    icon: 'startup',
    techStack: ['React Native', 'TypeScript', 'Supabase', 'PostgreSQL'],
    sideTrail: true,
    sideTrailId: 'gowith',
    sideTrailEndpoint: { side: 'right' },
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
    icon: 'lab',
    techStack: ['OpenAI GPT-4o', 'MongoDB', 'React', 'Node.js'],
    sideTrail: true,
    sideTrailId: 'anthropology-research',
    sideTrailEndpoint: { side: 'left' },
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
    icon: 'peak',
    sideTrail: false,
  },
]

export const experiences: Checkpoint[] = assignLocations(checkpointData)
