export interface SideTrailSection {
  type: 'text' | 'code' | 'list'
  content: string | string[]
}

export type SideTrailTheme =
  | 'workshop'
  | 'lab'
  | 'campus'
  | 'corporate'
  | 'startup'
  | 'academic'

export interface SideTrailContent {
  id: string
  title: string
  description: string
  techStack: string[]
  url?: string
  theme: SideTrailTheme
  sections: SideTrailSection[]
}

export const themeBackgrounds: Record<SideTrailTheme, string> = {
  workshop:
    'linear-gradient(135deg, #fef3c7 0%, #fed7aa 30%, #fdba74 60%, #fb923c 100%)',
  lab: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 25%, #7dd3fc 50%, #0ea5e9 80%)',
  campus:
    'linear-gradient(180deg, #f5f3ff 0%, #ede9fe 30%, #ddd6fe 60%, #c4b5fd 100%)',
  corporate:
    'linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 25%, #94a3b8 60%, #475569 100%)',
  startup:
    'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 25%, #6ee7b7 50%, #34d399 80%)',
  academic:
    'linear-gradient(160deg, #fefce8 0%, #fef9c3 25%, #fde68a 50%, #fcd34d 80%)',
}

export const sideTrails: Record<string, SideTrailContent> = {
  'first-projects': {
    id: 'first-projects',
    title: 'First Projects',
    description: 'Early full-stack and hardware projects from university.',
    techStack: ['MongoDB', 'Express', 'React', 'Node.js', 'C++', 'ESP32', 'AWS'],
    theme: 'workshop',
    sections: [
      {
        type: 'text',
        content:
          '191 For 191 is a searchable database of 70+ UCI capstone projects, giving stakeholders easy access. Full MERN stack deployed on AWS EC2 and S3.',
      },
      {
        type: 'text',
        content:
          'Heart Sensor Device is an ESP32 IoT device with pulse sensor for heart rate detection. Remote health monitoring hosted on EC2 to alert on abnormal rates.',
      },
    ],
  },
  biorobotics: {
    id: 'biorobotics',
    title: 'UC Irvine Biorobotics Laboratory',
    description: 'Software Developer Intern — LLM chatbot and secure data infrastructure.',
    techStack: ['Python', 'OpenAI', 'NLP', 'AWS RDS', 'PostgreSQL'],
    theme: 'lab',
    sections: [
      {
        type: 'text',
        content:
          'Built and deployed an LLM-driven chatbot using OpenAI APIs to deliver medically relevant guidance. Engineered data privacy by detecting sensitive content with NLP and encrypting via AES.',
      },
      {
        type: 'list',
        content: [
          'Designed secure data infrastructure using AWS RDS with PostgreSQL',
          'Implemented content detection and encryption pipelines',
          'Deployed and maintained chatbot for lab use cases',
        ],
      },
    ],
  },
  'commit-the-change': {
    id: 'commit-the-change',
    title: 'Commit the Change',
    description: 'Internal Vice President — Tech for social good.',
    techStack: ['React', 'Node.js', 'AWS EC2', 'S3', 'PostgreSQL'],
    url: 'https://ctc-uci.com',
    theme: 'campus',
    sections: [
      {
        type: 'text',
        content:
          'Developed scalable React + Node.js applications for local nonprofits, saving admins 200+ hours/year. Collaborated in a team of 14 developers in Scrum sprints.',
      },
      {
        type: 'list',
        content: [
          'Implemented secure data storage with AWS S3 & PostgreSQL',
          'Deployed using AWS EC2',
          'Led internal operations as VP',
        ],
      },
    ],
  },
  veeva: {
    id: 'veeva',
    title: 'Veeva Systems — Software Engineer Intern',
    description: 'Distributed search services and infrastructure tooling.',
    techStack: ['Java', 'Spring Boot', 'React', 'JavaScript'],
    url: 'https://www.veeva.com',
    theme: 'corporate',
    sections: [
      {
        type: 'text',
        content:
          'Engineered search services using Java & Spring Boot, indexing business-critical docs for 1,400+ pharmaceuticals. Created a JavaScript/React dashboard to monitor 6,000+ EC2 nodes and surface critical nodes 75% quicker.',
      },
      {
        type: 'list',
        content: [
          'Automated maintenance scheduling of distributed search nodes, reducing infrastructure workload by 90%',
          'Built distributed search maintenance scheduler',
        ],
      },
    ],
  },
  gowith: {
    id: 'gowith',
    title: 'GoWith LLC — Co-founder / Lead Engineer',
    description: 'React Native app for finding activity partners.',
    techStack: ['React Native', 'TypeScript', 'Supabase', 'PostgreSQL'],
    url: 'https://gowithapartner.com',
    theme: 'startup',
    sections: [
      {
        type: 'text',
        content:
          'Architected React Native/TypeScript app with Supabase/PostgreSQL backend and RLS across 15+ tables. Built production infrastructure with Sentry, standardized error handling, and API rate limiting.',
      },
      {
        type: 'list',
        content: [
          'Implemented OAuth (Google & Apple), real-time messaging',
          'Intelligent caching to reduce external API costs',
        ],
      },
    ],
  },
  'anthropology-research': {
    id: 'anthropology-research',
    title: 'UC Irvine Anthropology Research',
    description: 'Research Assistant — AI-powered labeling and data pipelines.',
    techStack: ['OpenAI GPT-4o', 'MongoDB', 'React', 'Node.js'],
    theme: 'academic',
    sections: [
      {
        type: 'text',
        content:
          'Automating typographic labeling system using OpenAI GPT-4o, reducing labeling time of 1,000+ images by 80%. Architecting pipelines to standardize data from multiple JSONL and CSV sources into MongoDB.',
      },
      {
        type: 'list',
        content: [
          'Building React application with Node.js + Express backend',
          'Visualize trends and conduct data analysis',
        ],
      },
    ],
  },
}
