// Everything you'd want to edit lives here. The components only read from this file.

export type Release = {
  /** Used in the page address: #work-<slug>. Lowercase letters, digits and dashes only. */
  slug: string;
  /** Catalogue number, record-label style. Keep them in release order. */
  cat: string;
  title: string;
  kind: 'Company' | 'Research' | 'Product' | 'Side project';
  role: string;
  /** One or two sentences for the work card. */
  blurb: string;
  stack?: string[];
  /** Detail page: a few paragraphs, then a short list of highlights. */
  body: string[];
  highlights?: string[];
  /** Optional outbound links shown on the detail page. */
  links?: { label: string; href: string }[];
};

export const site = {
  name: 'Sterling',
  // Shown under the name in the hero.
  intro:
    'Engineer and founder. I build applied machine learning systems and the software that ships them.',
  base: 'New York and Princeton, NJ',
  availability: 'Building from New York. Open to early-stage teams.',
  heroTag: 'Engineer / Founder / Applied ML',

  about: [
    "I work where machine learning meets product. I co-founded eir, an AI sports analytics company, and I'm finishing an MS in Electrical and Computer Engineering at Princeton.",
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

  // TODO: add your GitHub handle.
  email: 'hallsterling123@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/your-handle' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sterlingahall' },
  ],

  // "Now playing": what you're doing at the moment.
  now: [
    { what: 'Security Analyst', where: 'Aegis AI', detail: 'Email threat data for model training, IOC rulings on malicious domains, rules-based threat detection.' },
    { what: 'MS, Electrical and Computer Engineering', where: 'Princeton University', detail: 'Applied ML: medical imaging and protein design.' },
  ],

  releases: [
    {
      slug: 'eir',
      cat: 'STR-001',
      title: 'eir',
      kind: 'Company',
      role: 'Co-founder',
      blurb: 'AI sports analytics.',
      // TODO: replace with the real story.
      body: [
        'eir is an AI sports analytics company I co-founded. Write a sentence here about the problem it solves and who it is for.',
        'Then a paragraph on what you built: the models, the data pipeline, and the product people use.',
      ],
      highlights: ['Add a result, a metric, or a customer here', 'Add another'],
      links: [{ label: 'Website', href: '#' }],
    },
    {
      slug: 'substrate',
      cat: 'STR-002',
      title: 'Substrate financing platform',
      kind: 'Product',
      role: 'Full-stack engineer',
      blurb: 'A financing application built as a typed monorepo, from database schema to UI.',
      stack: ['React', 'NestJS', 'Prisma', 'AWS Cognito', 'Zustand'],
      body: [
        'At Substrate Industries I work across a NestJS, Prisma and React monorepo that runs a financing application end to end.',
        'On the front end I build the forms applicants fill in, validated with react-hook-form and Zod, plus digital signature components and a shared UI kit. On the back end I handle authentication with AWS Cognito, Prisma schema migrations, and the dependency-injection and database issues that come with a growing NestJS service.',
      ],
      highlights: [
        'Shared components: DataTable, SearchAndFilter, RangeSlider, StepProgress',
        'Digital signature flow for applications',
        'Vendor branding context and a migration to Zustand for state',
      ],
    },
    {
      slug: 'dtca',
      cat: 'STR-003',
      title: 'Automated DTCA measurement',
      kind: 'Research',
      role: 'ML engineer',
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
      cat: 'STR-004',
      title: 'Uncertainty-aware inverse folding',
      kind: 'Research',
      role: 'Researcher',
      blurb: 'ProteinMPNN conditioned on cryo-EM B-factors, so sequence design knows which parts of a structure to trust.',
      stack: ['ProteinMPNN', 'Cryo-EM', 'PyTorch'],
      body: [
        'Inverse folding models such as ProteinMPNN design a sequence for a fixed backbone, and treat every residue as equally certain. Cryo-EM structures say otherwise: B-factors show which regions are flexible. I conditioned ProteinMPNN on that signal.',
        'The headline result was negative. An ensemble approach lowered sequence recovery across the board instead of helping on flexible residues, and temperature scaling only matched the single-structure baseline. I rewrote the paper to report that plainly rather than bury it.',
      ],
      highlights: ['Targeted the MLSB workshop at NeurIPS', 'An honest null result, reported as one'],
    },
  ] satisfies Release[],
};
