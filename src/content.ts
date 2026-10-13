// Everything you'd want to edit lives here. The components only read from this file.

/** One entry on the site. Both experience and projects use this shape. */
export type Entry = {
  /** Used in the page address: #work-<slug>. Lowercase letters, digits and dashes; unique across both lists. */
  slug: string;
  /** The big name: a company, school or project. */
  title: string;
  /** Your role or degree, shown under the title. */
  role: string;
  kind: 'Role' | 'Company' | 'Education' | 'Teaching' | 'Research' | 'Thesis' | 'Side project';
  /** Shown as written, e.g. 'Jun – Aug 2025'. */
  period?: string;
  /** Sort key for the timeline, YYYY-MM. */
  start?: string;
  place?: string;
  /** One or two sentences for the card. */
  blurb: string;
  stack?: string[];
  /** Detail page: a few paragraphs, then a short list of highlights. */
  body: string[];
  highlights?: string[];
  /** Résumé points, shown on the detail page under "What I did". */
  bullets?: string[];
  /** Links shown on the detail page. Outside sites open in a new tab; '#work-…' links stay on the site. */
  links?: { label: string; href: string }[];
};

/** A project also gets outbound buttons on the home page. */
export type Project = Entry & { live?: string; source?: string };

export const site = {
  name: 'Sterling',
  // Shown under the name in the hero.
  intro:
    'Engineer and founder. I build applied machine learning systems and the software that ships them.',
  base: 'New York and Princeton, NJ',
  availability: 'Based in New York and open to new opportunities.',
  heroTag: 'Machine learning, software and hardware',

  about: [
    "I'm an engineer with a BSE and an MS in Electrical and Computer Engineering from Princeton. My work spans machine learning, full-stack software and hardware, and I've applied it in sports science, healthcare, finance and cybersecurity.",
    "I co-founded eir, an AI sports analytics company for female athletes, and built everything from its wearable prototype to its models and apps. Since then I've shipped production financing software at Substrate and now work on AI-driven email threat detection at AegisAI.",
    'Whatever the field, I take the same approach: understand the problem, build carefully, and deliver work that holds up in the real world.',
  ],

  marquee: "Let's build something loud",

  // The wormhole at the bottom of the home page, and the contact page it leads to.
  leap: { kicker: 'Ready to make the leap?', title: 'Click to connect' },
  contact: {
    lede: "Have a project, a role or an idea in mind? I'd like to hear about it.",
    openTo: ['Engineering and machine learning roles', 'New products and early-stage companies', 'Research and technical collaborations'],
    replyTime: 'Usually within two business days.',
  },

  // Your résumé lives at public/resume/Hall_Sterling.pdf. Replace that file to update it.
  resume: { label: 'Résumé (PDF)', file: 'resume/Hall_Sterling.pdf' },

  // Booking calendar on the contact page. Paste your Calendly event link here,
  // e.g. 'https://calendly.com/sterlingahall/30min'. Leave it empty to hide the calendar.
  calendly: '',

  email: 'hallsterling123@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/HallSterling123' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sterlingahall' },
  ],

  // "Now playing": what you're doing at the moment.
  now: [
    { what: 'Security Analyst', where: 'AegisAI', detail: 'Building the data and detection logic behind AI-driven email security.' },
  ],

  // The work tunnel. Any order here; the site sorts by `start`, oldest first, so the camera flies toward now.
  experience: [
    {
      slug: 'princeton-bse',
      title: 'Princeton University',
      role: 'BSE, Electrical and Computer Engineering',
      kind: 'Education',
      period: 'Sep 2021 – May 2025',
      start: '2021-09',
      place: 'Princeton, NJ',
      blurb: 'Undergraduate degree in electrical and computer engineering, with a thesis on privacy-preserving machine learning for healthcare.',
      body: [
        'My undergraduate studies combined machine learning, embedded systems and computer security. My senior thesis brought these together in a federated learning architecture that lets healthcare models learn from patient data without centralizing it. Outside the classroom, I led an engineering team in Engineers Without Borders.',
      ],
      bullets: [
        'Thesis: GRU-SFL: A Private, Secure, Efficient Machine Learning Architecture for Healthcare; designed a split federated learning architecture with GRU models for privacy-preserving healthcare ML',
        'Officer, Engineers Without Borders (Sep 2021 – May 2025): led a 7-member team designing and simulating a pipeline addition to serve 1,500+ community members using EPANET, with professional advisors and MIWASCO',
      ],
      links: [
        { label: 'Read about the thesis', href: '#work-gru-sfl' },
        { label: 'Princeton ECE', href: 'https://ece.princeton.edu/' },
      ],
    },
    {
      slug: 'consert',
      title: 'CoNSeRT Lab',
      role: 'Software Engineering Research Intern',
      kind: 'Role',
      period: 'Jun – Aug 2023',
      start: '2023-06',
      place: 'Athens, Greece',
      blurb: 'Low-latency messaging and mobile software for an augmented-reality rescue system.',
      stack: ['MQTT', 'Kotlin', 'Android', 'Vuzix HUD'],
      body: [
        'At the CoNSeRT Lab at the University of West Attica, I worked on an augmented-reality system for rescue operations. The challenge was delivering critical health alerts quickly and securely on headsets with very limited computing power.',
      ],
      bullets: [
        'Engineered a lightweight MQTT messaging network for a resource-constrained AR environment, creating a secure subscription-based notification system for critical vitals thresholds with 250ms end-to-end latency',
        'Developed an Android application in Kotlin using Vuzix HUD packages for simultaneous biometrics monitoring and rescue operations',
      ],
      links: [{ label: 'CoNSeRT Lab', href: 'https://consert.eee.uniwa.gr/' }],
    },
    {
      slug: 'teaching',
      title: 'Princeton ECE',
      role: 'Teaching Assistant, ECE 115, 203 and 206',
      kind: 'Teaching',
      period: 'Sep 2023 – May 2026',
      start: '2023-09',
      place: 'Princeton, NJ',
      blurb: 'Teaching circuits, digital logic and drone control to more than 75 students.',
      body: [
        'Over three years I taught across three Princeton ECE courses, guiding students through the hands-on side of engineering, from their first circuits to autonomous drone control.',
      ],
      bullets: [
        'Led labs and tutorials in circuit design, computer logic design, and drone robotics control for 75+ students across three courses',
        'Developed supplementary materials and evaluated autonomous navigation projects and circuit implementations',
      ],
      links: [{ label: 'Princeton ECE', href: 'https://ece.princeton.edu/' }],
    },
    {
      slug: 'eir',
      title: 'eir',
      role: 'Co-founder and COO',
      kind: 'Company',
      period: 'Dec 2023 – May 2025',
      start: '2023-12',
      place: 'Princeton, NJ',
      blurb: 'An AI sports analytics company for female athletes, spanning wearable hardware, machine learning and apps.',
      stack: ['LLM fine-tuning', 'LSTM', 'React Native', 'TypeScript', 'Supabase'],
      body: [
        'Most performance technology is designed around male physiology. I co-founded eir to change that for female athletes, combining a chest-worn wearable with machine learning that tracks training load, readiness and cycle-related symptoms. As COO, I worked across fundraising, partnerships, hardware and software.',
      ],
      bullets: [
        'Founded an AI sports analytics company for female athletes; raised pre-seed funding from multiple sources and established a partnership with USA Rowing to validate the platform through athlete trials',
        'Fine-tuned an LLM with Supervised Fine-Tuning (SFT) and QLoRA on a curated dataset, and built an LSTM neural network to predict menstrual cycle symptoms and performance trends from biosignal data',
        'Led design and rapid prototyping of a chest-worn wearable based on Polar H10; trials showed increased comfort and equivalent accuracy to established market alternatives',
        'Built mobile and web applications using React Native, TypeScript, and Supabase',
        'Selected for Keller Center\u2019s eLab Summer Accelerator program (Summer 2024)',
      ],
      links: [
        { label: 'eir at the Keller Center', href: 'https://kellercenter.princeton.edu/people/startups-teams/eir-formerly-luna' },
        { label: 'USA Rowing', href: 'https://usrowing.org/' },
      ],
    },
    {
      slug: 'substrate',
      title: 'Substrate Industries',
      role: 'Full-Stack Developer',
      kind: 'Role',
      period: 'Jun – Aug 2025',
      start: '2025-06',
      place: 'San Francisco, CA',
      blurb: 'Production financing software that helps U.S. manufacturers access flexible capital.',
      stack: ['React', 'NestJS', 'Prisma', 'AWS Cognito', 'Zustand'],
      body: [
        'Substrate offers embedded equipment financing for industrial vendors. I joined during an early growth phase and built across the full stack, from database design and APIs to the interfaces customers use.',
      ],
      bullets: [
        'Led 0-to-1 development of two production applications, credit modules, and three customizable demo platforms helping U.S. manufacturers access $15M+ in flexible financing across 8 early customers',
        'Designed Prisma backend schemas and NestJS endpoints for secure inter-app data sharing, and built React UI components across the platform',
      ],
      links: [{ label: 'Substrate', href: 'https://joinsubstrate.com/' }],
    },
    {
      slug: 'princeton-ms',
      title: 'Princeton University',
      role: 'MS, Electrical and Computer Engineering',
      kind: 'Education',
      period: 'Sep 2025 – May 2026',
      start: '2025-09',
      place: 'Princeton, NJ',
      blurb: 'Graduate study in machine learning, computational biology and security.',
      body: [
        'My graduate work deepened my foundation in machine learning and applied it to problems in medicine and biology, from automated measurement on X-rays to protein design.',
      ],
      bullets: [
        'Relevant coursework: Reinforcement Learning Theory, Computational Biology, Molecular Modeling Methods, Computer Security',
        'Research: automated DTCA measurement from ankle X-rays, and uncertainty-aware inverse folding for protein design',
      ],
      links: [
        { label: 'DTCA measurement', href: '#work-dtca' },
        { label: 'Inverse folding', href: '#work-inverse-folding' },
        { label: 'Princeton ECE', href: 'https://ece.princeton.edu/' },
      ],
    },
    {
      slug: 'aegis',
      title: 'AegisAI',
      role: 'Security Analyst',
      kind: 'Role',
      period: 'Sep 2026 – Present',
      start: '2026-09',
      place: 'New York, NY',
      blurb: 'Training data and detection logic for AI-driven email security.',
      body: [
        'AegisAI builds agentic email security for Microsoft 365 and Google Workspace. I work at the intersection of threat intelligence and machine learning, producing the labeled data that trains its detection models and the rules that back them up.',
      ],
      bullets: [
        'Annotate 5,000+ emails per week with 99.7% accuracy, building labeled training datasets for ML-based email threat detection models',
        'Issue indicator of compromise (IOC) rulings on suspicious and malicious domains to support threat intelligence and email security',
        'Integrate identified threat patterns into rules-based detection systems, complementing ML models with deterministic detection logic',
      ],
      links: [{ label: 'AegisAI', href: 'https://www.aegisai.com/' }],
    },
  ] satisfies Entry[],

  // The Projects section on the home page. Add `live` and `source` links and they show up as buttons.
  projects: [
    {
      slug: 'ma-covid',
      title: 'Massachusetts COVID-19, wave one',
      role: 'Designer and developer',
      kind: 'Side project',
      blurb: 'An interactive data story showing how distance to care shaped survival during the first wave of COVID-19 in Massachusetts.',
      stack: ['React', 'D3', 'TopoJSON', 'Python'],
      live: 'https://hallsterling123.github.io/ma-covid-viz/',
      source: 'https://github.com/HallSterling123/ma-covid-viz',
      body: [
        'This scrolling data story follows 9,106 synthetic COVID-19 patients across all 14 Massachusetts counties from January 20 to March 30, 2020, using Synthea™ synthetic health records. Its central finding is that where patients lived strongly shaped their outcomes.',
        'It runs in three parts. An animated flow map draws every patient visit as an arc from home to provider, showing that routine care reached almost everyone while intensive care sat in a narrow corridor. The second part ties travel distance to survival, and the third maps the conditions patients already had before the pandemic arrived. Python scripts turn about 2.9 million rows of raw CSV data into compact JSON for the browser.',
      ],
      highlights: [
        'Animated home-to-provider flow map of every visit',
        'Hexbin maps, a chord diagram and a body map of comorbidities',
        'Explore pages for demographics, conditions, medications, vitals and payers',
      ],
      links: [
        { label: 'View the project', href: 'https://hallsterling123.github.io/ma-covid-viz/' },
        { label: 'Source code', href: 'https://github.com/HallSterling123/ma-covid-viz' },
        { label: 'Synthea synthetic data', href: 'https://synthetichealth.github.io/synthea/' },
      ],
    },
    {
      slug: 'dtca',
      title: 'Automated DTCA measurement',
      role: 'Researcher',
      kind: 'Research',
      blurb: 'A deep learning model that measures a key ankle angle directly from X-rays.',
      stack: ['PyTorch', 'U-Net', 'Computer vision'],
      body: [
        'Surgeons measure the distal tibial component angle (DTCA) on ankle X-rays by hand, which is slow and varies from reader to reader. This project automates the measurement with deep learning.',
        'A multi-task U-Net finds the anatomy and the angle is computed from its output. Along the way I compared spatial configuration networks, stacked hourglass networks, EfficientNet-B0 and nnU-Net, building on earlier work that used weakly supervised landmark detection.',
      ],
      highlights: ['Mean absolute error of 2.15°', '12× better than the baseline', 'Written up as a paper'],
      links: [{ label: 'Princeton MS', href: '#work-princeton-ms' }],
    },
    {
      slug: 'inverse-folding',
      title: 'Uncertainty-aware inverse folding',
      role: 'Researcher',
      kind: 'Research',
      blurb: 'Teaching a protein design model which parts of a structure to trust, using cryo-EM data.',
      stack: ['ProteinMPNN', 'Cryo-EM', 'PyTorch'],
      body: [
        'Inverse folding models such as ProteinMPNN design a sequence for a fixed backbone, and treat every residue as equally certain. Cryo-EM structures say otherwise: B-factors show which regions are flexible. I conditioned ProteinMPNN on that signal.',
        'The main result was negative: an ensemble approach lowered sequence recovery overall instead of improving flexible regions, and temperature scaling only matched the single-structure baseline. I reported that result directly, since a clear negative finding is useful to others working on the problem.',
      ],
      highlights: ['Prepared for the MLSB workshop at NeurIPS', 'A clearly reported negative result'],
      links: [
        { label: 'ProteinMPNN', href: 'https://github.com/dauparas/ProteinMPNN' },
        { label: 'MLSB workshop', href: 'https://www.mlsb.io/' },
      ],
    },
    {
      slug: 'gru-sfl',
      title: 'GRU-SFL',
      role: 'Senior thesis',
      kind: 'Thesis',
      blurb: 'A privacy-preserving machine learning architecture for healthcare data.',
      stack: ['PyTorch', 'GRU', 'Federated learning'],
      body: [
        'Health data is hard to share, and the best models need a lot of it. GRU-SFL splits a GRU network between clients and a server and combines that with federated learning, so each participant keeps its raw patient data while still contributing to one shared model.',
        'The thesis designs the architecture and evaluates the trade-offs between privacy, security and efficiency.',
      ],
      highlights: ['Princeton BSE thesis in Electrical and Computer Engineering'],
      links: [{ label: 'Princeton BSE', href: '#work-princeton-bse' }],
    },
  ] satisfies Project[],
};

/** Experience, oldest first. */
export const timeline = [...site.experience].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
/** Every entry with a page, for looking one up by slug. */
export const allEntries: Entry[] = [...timeline, ...site.projects];
