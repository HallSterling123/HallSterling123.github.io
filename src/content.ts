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
  /** Outbound links shown on the detail page. */
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
  availability: 'Building from New York. Open to early-stage teams.',
  heroTag: 'Engineer / Founder / Applied ML',

  about: [
    'I work where machine learning meets product. I co-founded eir, an AI sports analytics company for female athletes, and I hold a BSE and an MS in Electrical and Computer Engineering from Princeton.',
    'My research has covered medical imaging and protein design. My day job is security: deciding which emails and domains are malicious, and turning those calls into training data.',
    'I like small teams, hard problems, and owning the whole stack, from the model to the API to the screen someone actually touches.',
  ],

  marquee: "Let's build something loud",

  // The wormhole at the bottom of the home page, and the contact page it leads to.
  leap: { kicker: 'Ready to make the leap?', title: 'Click to connect' },
  contact: {
    lede: 'Building something early and technical? Tell me about it.',
    openTo: ['Founding and early engineering roles', 'Applied ML projects that need to ship', 'Research collaborations'],
    replyTime: 'Usually within a couple of days.',
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
    { what: 'Security Analyst', where: 'Aegis AI', detail: 'Email threat data for model training, IOC rulings on malicious domains, rules-based threat detection.' },
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
      blurb: 'Undergraduate engineering, ending in a thesis on private, secure machine learning for healthcare.',
      body: [
        'I studied electrical and computer engineering, with most of my time going to machine learning, embedded systems and security.',
        'My senior thesis, GRU-SFL, designed a split federated learning architecture with GRU models so healthcare models could learn from patient time-series data without pooling it in one place.',
      ],
      highlights: [
        'Thesis: GRU-SFL, a private, secure, efficient ML architecture for healthcare',
        'Officer, Engineers Without Borders: led a 7-person team designing a pipeline addition to serve 1,500+ people, simulated in EPANET',
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
      blurb: 'Real-time vitals alerts for rescue crews wearing AR headsets.',
      stack: ['MQTT', 'Kotlin', 'Android', 'Vuzix HUD'],
      body: [
        'I built the messaging layer for an augmented-reality system used in rescue operations, where the headsets have little compute and every millisecond counts.',
        'A lightweight MQTT network lets responders subscribe to the vitals that matter and get notified the moment a reading crosses a critical threshold. I also wrote the Android app, in Kotlin with Vuzix HUD packages, that shows biometrics and rescue information side by side.',
      ],
      highlights: ['250 ms end-to-end alert latency', 'Secure, subscription-based notifications for critical vitals'],
    },
    {
      slug: 'teaching',
      title: 'Princeton ECE',
      role: 'Teaching Assistant, ECE 115, 203 and 206',
      kind: 'Teaching',
      period: 'Sep 2023 – May 2026',
      start: '2023-09',
      place: 'Princeton, NJ',
      blurb: 'Labs and tutorials in circuits, logic design and drone control for 75+ students.',
      body: [
        'Across three courses I ran labs and tutorials on circuit design, computer logic design and drone robotics control.',
        'I also wrote supplementary materials and evaluated students\' autonomous navigation projects and circuit builds.',
      ],
      highlights: ['75+ students across three courses'],
    },
    {
      slug: 'eir',
      title: 'eir',
      role: 'Co-founder and COO',
      kind: 'Company',
      period: 'Dec 2023 – May 2025',
      start: '2023-12',
      place: 'Princeton, NJ',
      blurb: 'AI sports analytics for female athletes, from the wearable to the models to the app.',
      stack: ['LLM fine-tuning', 'LSTM', 'React Native', 'TypeScript', 'Supabase'],
      body: [
        'I co-founded eir to build sports analytics for female athletes, a group most performance tools ignore. We raised pre-seed funding from several sources and partnered with USA Rowing to validate the platform through athlete trials.',
        'On the technical side I fine-tuned an LLM with supervised fine-tuning and QLoRA on a curated dataset, built an LSTM that predicts menstrual-cycle symptoms and performance trends from biosignal data, and led the design of a chest-worn wearable based on the Polar H10. I also built the mobile and web apps in React Native, TypeScript and Supabase.',
      ],
      highlights: [
        'Pre-seed funding and a USA Rowing partnership',
        'Wearable matched market alternatives on accuracy, with better comfort in trials',
        'Selected for the Keller Center eLab Summer Accelerator, 2024',
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
      blurb: 'Zero-to-one financing software helping U.S. manufacturers access flexible capital.',
      stack: ['React', 'NestJS', 'Prisma', 'AWS Cognito', 'Zustand'],
      body: [
        'I led 0-to-1 development of two production applications, credit modules and three customizable demo platforms, in a NestJS, Prisma and React monorepo.',
        'I designed the Prisma schemas and NestJS endpoints that let the apps share data securely, and built the React side: applicant forms validated with react-hook-form and Zod, digital signatures, and a shared UI kit. I also handled AWS Cognito authentication and schema migrations.',
      ],
      highlights: [
        'Helped U.S. manufacturers access $15M+ in flexible financing across 8 early customers',
        'Shared components: DataTable, SearchAndFilter, RangeSlider, StepProgress',
      ],
    },
    {
      slug: 'princeton-ms',
      title: 'Princeton University',
      role: 'MS, Electrical and Computer Engineering',
      kind: 'Education',
      period: 'Sep 2025 – May 2026',
      start: '2025-09',
      place: 'Princeton, NJ',
      blurb: 'Graduate work in machine learning for medicine and biology.',
      body: [
        'My master\'s coursework covered reinforcement learning theory, computational biology, molecular modeling methods and computer security.',
        'My research applied deep learning to medical imaging and protein design. Both projects are listed under Projects.',
      ],
      highlights: ['Automated DTCA measurement from ankle X-rays', 'Uncertainty-aware inverse folding'],
    },
    {
      slug: 'aegis',
      title: 'Aegis AI',
      role: 'Security Analyst',
      kind: 'Role',
      period: 'Sep 2026 – Present',
      start: '2026-09',
      place: 'New York, NY',
      blurb: 'Labeled threat data and detection rules for ML-based email security.',
      body: [
        'I build the labeled datasets that train Aegis AI\'s email threat detection models, and issue indicator-of-compromise rulings on suspicious and malicious domains.',
        'When I find a pattern worth catching every time, I turn it into rules-based detection logic that backs up the models.',
      ],
      highlights: ['5,000+ emails a week at 99.7% accuracy'],
    },
  ] satisfies Entry[],

  // The Projects section on the home page. Add `live` and `source` links and they show up as buttons.
  projects: [
    {
      slug: 'ma-covid',
      title: 'Massachusetts COVID-19, wave one',
      role: 'Designer and developer',
      kind: 'Side project',
      blurb: 'An interactive data story on how distance to care shaped who survived the first wave of COVID-19 in Massachusetts.',
      stack: ['React', 'D3', 'TopoJSON', 'Python'],
      live: 'https://hallsterling123.github.io/ma-covid-viz/',
      source: 'https://github.com/HallSterling123/ma-covid-viz',
      body: [
        'Where you lived decided your odds. This scrolling data story follows 9,106 synthetic COVID-19 patients across all 14 Massachusetts counties from January 20 to March 30, 2020, using Synthea™ synthetic health records.',
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
      ],
    },
    {
      slug: 'dtca',
      title: 'Automated DTCA measurement',
      role: 'ML engineer',
      kind: 'Research',
      blurb: 'Deep learning that measures the distal tibial component angle directly from ankle X-rays.',
      stack: ['PyTorch', 'U-Net', 'Computer vision'],
      body: [
        'Surgeons measure the distal tibial component angle (DTCA) on ankle X-rays by hand. It is slow and varies between readers. This project automates the measurement.',
        'A multi-task U-Net finds the anatomy and the angle is computed from its output. Along the way I compared spatial configuration networks, stacked hourglass networks, EfficientNet-B0 and nnU-Net, building on earlier work that used weakly supervised landmark detection.',
      ],
      highlights: ['Mean absolute error of 2.15°', '12× better than the baseline', 'Written up as a paper'],
    },
    {
      slug: 'inverse-folding',
      title: 'Uncertainty-aware inverse folding',
      role: 'Researcher',
      kind: 'Research',
      blurb: 'ProteinMPNN conditioned on cryo-EM B-factors, so sequence design knows which parts of a structure to trust.',
      stack: ['ProteinMPNN', 'Cryo-EM', 'PyTorch'],
      body: [
        'Inverse folding models such as ProteinMPNN design a sequence for a fixed backbone, and treat every residue as equally certain. Cryo-EM structures say otherwise: B-factors show which regions are flexible. I conditioned ProteinMPNN on that signal.',
        'The headline result was negative. An ensemble approach lowered sequence recovery across the board instead of helping on flexible residues, and temperature scaling only matched the single-structure baseline. I rewrote the paper to report that plainly rather than bury it.',
      ],
      highlights: ['Targeted the MLSB workshop at NeurIPS', 'An honest null result, reported as one'],
    },
    {
      slug: 'gru-sfl',
      title: 'GRU-SFL',
      role: 'Senior thesis',
      kind: 'Thesis',
      blurb: 'Split federated learning with GRU models, for healthcare ML that never pools patient data in one place.',
      stack: ['PyTorch', 'GRU', 'Federated learning'],
      body: [
        'Health data is hard to share, and the best models need a lot of it. GRU-SFL splits a GRU network between clients and a server and combines that with federated learning, so each participant keeps its raw patient data while still contributing to one shared model.',
        'The thesis designs the architecture and weighs it on privacy, security and efficiency.',
      ],
      highlights: ['Princeton BSE thesis in Electrical and Computer Engineering'],
    },
  ] satisfies Project[],
};

/** Experience, oldest first. */
export const timeline = [...site.experience].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
/** Every entry with a page, for looking one up by slug. */
export const allEntries: Entry[] = [...timeline, ...site.projects];
