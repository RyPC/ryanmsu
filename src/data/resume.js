export const personal = {
  name: 'Ryan Su',
  email: 'ryan.parkcity@gmail.com',
  phone: '(435) 731-7530',
  linkedin: 'https://linkedin.com/in/ryan-m-su',
  github: 'https://github.com/RyPC',
  tagline: 'Building software for impact',
  graduation: "UC Irvine '26",
  bio: "I'm a Computer Science student at UC Irvine (GPA 3.9) graduating March 2026. I build scalable systems at companies like Veeva, co-founded GoWith, and contribute to tech for social good at Commit the Change. When I'm not coding, you'll find me skiing, mountain biking, or rock climbing.",
}

export const experience = [
  {
    company: 'Veeva Systems',
    role: 'Software Engineer Intern',
    location: 'Pleasanton, CA',
    dates: 'June 2025 – Sept. 2025',
    url: 'https://www.veeva.com',
    highlights: [
      'Engineered search services using Java & Spring Boot, indexing business-critical docs for 1,400+ pharmaceuticals',
      'Created a JavaScript/React dashboard to monitor 6,000+ EC2 nodes and surface critical nodes 75% quicker',
      'Automated maintenance scheduling of distributed search nodes, reducing infrastructure workload by 90%',
    ],
  },
  {
    company: 'GoWith LLC',
    role: 'Co-founder / Lead Engineer',
    location: 'Park City, UT',
    dates: 'June 2025 – Present',
    url: 'https://gowithapartner.com',
    highlights: [
      'Architected React Native/TypeScript app with Supabase/PostgreSQL backend and RLS across 15+ tables',
      'Built production infrastructure with Sentry error monitoring, standardized error handling, and API rate limiting',
      'Implemented OAuth (Google & Apple), real-time messaging, and intelligent caching to reduce external API costs',
    ],
  },
  {
    company: 'Commit the Change',
    role: 'Internal Vice President',
    location: 'Irvine, CA',
    dates: 'Oct. 2024 – Present',
    url: 'https://ctc-uci.com',
    highlights: [
      'Developed scalable React + Node.js applications for local nonprofits, saving admins 200+ hours/year',
      'Collaborated in a team of 14 developers in Scrum sprints using JavaScript to deliver high-quality software',
      'Implemented secure data storage with AWS S3 & PostgreSQL and deployed using AWS EC2',
    ],
  },
  {
    company: 'UC Irvine Department of Anthropology',
    role: 'Research Assistant',
    location: 'Irvine, CA',
    dates: 'Feb. 2025 – Present',
    highlights: [
      'Automating typographic labeling system using OpenAI GPT-4o, reducing labeling time of 1,000+ images by 80%',
      'Architecting pipelines to standardize data from multiple JSONL and CSV sources into a MongoDB database',
      'Building a React application with Node.js + Express backend to visualize trends and conduct data analysis',
    ],
  },
  {
    company: 'UC Irvine Biorobotics Laboratory',
    role: 'Software Developer Intern',
    location: 'Irvine, CA',
    dates: 'June 2024 – Oct. 2024',
    highlights: [
      'Built and deployed an LLM-driven chatbot leveraging OpenAI APIs to deliver medically relevant guidance',
      'Engineered data privacy and security features by detecting sensitive content with NLP, encrypting data via AES',
      'Designed secure data infrastructure using AWS RDS with PostgreSQL, ensuring reliability for user data storage',
    ],
  },
]

export const projects = [
  {
    name: 'Neuro-Symbolic Paper Tracker',
    tech: ['Python', 'FastAPI', 'TypeScript', 'React', 'Claude'],
    description: 'React/Python app enabling researchers to track and visualize relationships between papers and topics. Integrated Claude LLM to extract topics from PDFs and construct an interactive knowledge graph with semantic search.',
    period: 'October 2025',
    repo: 'https://github.com/RyPC',
    demo: null,
  },
  {
    name: 'Heart Sensor Device',
    tech: ['C++', 'ESP32', 'AWS EC2'],
    description: 'ESP32- and pulse sensor-based IoT device to detect heart rate from electrical activity. Remote health monitoring system hosted on EC2 to alert others of abnormal heart rates.',
    period: 'Oct. 2024 – Dec. 2024',
    repo: 'https://github.com/RyPC',
    demo: null,
  },
  {
    name: '191 For 191',
    tech: ['MongoDB', 'Express', 'React', 'Node.js', 'AWS EC2', 'AWS S3'],
    description: 'Searchable database of 70+ UCI capstone projects, allowing easy access for all stakeholders. Full-stack MERN application deployed with AWS EC2 and S3.',
    period: 'April 2024 – June 2024',
    repo: 'https://github.com/RyPC',
    demo: null,
  },
]

export const skills = {
  languages: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C/C++', 'SQL', 'HTML/CSS'],
  frameworks: ['Spring Boot', 'React', 'Node.js', 'Express.js', 'Pandas', 'NumPy'],
  tools: ['Git', 'Linux', 'AWS', 'MongoDB', 'Jira', 'Docker', 'CI/CD'],
}
