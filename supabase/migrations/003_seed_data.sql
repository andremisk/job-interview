-- Segments
INSERT INTO public.segments (name, slug, description) VALUES
  ('Technology', 'tech', 'Software, hardware, and tech product companies'),
  ('Design', 'design', 'Architecture, UX, graphic design, and creative studios'),
  ('Finance', 'finance', 'Banking, investment, fintech, and financial services'),
  ('Healthcare', 'health', 'Hospitals, biotech, pharma, and health tech'),
  ('Law', 'law', 'Law firms, legal tech, and compliance-focused organizations');

-- Technology companies
INSERT INTO public.companies (name, slug, website, industry, segment_id, location, description, culture_notes, notable_facts) VALUES
(
  'Figma',
  'figma',
  'https://figma.com',
  'Design Software',
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'San Francisco, CA',
  'Figma is a collaborative design platform used by over 4 million product teams worldwide.',
  'Figma values collaboration deeply. Interviews emphasize systems thinking, strong opinions loosely held, and how you work with cross-functional teams. They want people who can design for scale but still care about pixel-level craft.',
  'Acquisition by Adobe in 2022 was later abandoned. Known for their open and transparent culture. Strong focus on developer and designer collaboration.'
),
(
  'Linear',
  'linear',
  'https://linear.app',
  'Project Management Software',
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'San Francisco, CA',
  'Linear is a modern project management tool built for software teams who care about quality and speed.',
  'Linear is famous for extreme attention to design and performance. Interviews emphasize craft, taste, and opinionated thinking about product. They look for people who use the tools they build and care deeply about quality in every detail.',
  'Known for viral product announcement posts. Famous for sub-100ms response times and keyboard-first UX.'
),
(
  'Vercel',
  'vercel',
  'https://vercel.com',
  'Developer Tools',
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'San Francisco, CA',
  'Vercel is the platform for frontend developers, providing speed and reliability at scale.',
  'Vercel values developers who think about the full deployment lifecycle. Culture is fast-moving and remote-first. Technical depth combined with clear writing is highly valued.',
  'Created Next.js, the most popular React framework. Known for their deployment UX and developer experience.'
),
(
  'Stripe',
  'stripe',
  'https://stripe.com',
  'Fintech',
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'San Francisco, CA',
  'Stripe builds financial infrastructure for the internet, processing payments for millions of businesses.',
  'Stripe is famous for its writing culture and long-form internal documentation. Interviews are rigorous and involve system design, product thinking, and clear communication. They value people who think deeply and write clearly.',
  'Processes hundreds of billions in payments annually. Known for excellent developer documentation and first-principles thinking.'
),
(
  'Notion',
  'notion',
  'https://notion.so',
  'Productivity Software',
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'San Francisco, CA',
  'Notion is an all-in-one workspace for notes, docs, wikis, and project management.',
  'Notion values strong generalists who care about craft and are comfortable with ambiguity. They look for people who are strong writers, empathetic to users, and excited about building tools that change how people work.',
  'Grew to a $10B valuation. Known for community-driven growth and a highly customizable product.'
);

-- Design and Architecture companies
INSERT INTO public.companies (name, slug, website, industry, segment_id, location, description, culture_notes, notable_facts) VALUES
(
  'IDEO',
  'ideo',
  'https://ideo.com',
  'Design Consultancy',
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'San Francisco, CA',
  'IDEO is a global design consultancy famous for inventing human-centered design and design thinking.',
  'IDEO values radical collaboration, human empathy, and prototyping over planning. Interviews involve creative exercises and case studies. Showing your design process matters more than the final artifact.',
  'Designed the first Apple mouse. Invented design thinking as a methodology. Work spans product, service, and organizational design.'
),
(
  'Gensler',
  'gensler',
  'https://gensler.com',
  'Architecture',
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'San Francisco, CA',
  'Gensler is the world largest architecture and design firm, with 50+ offices globally.',
  'Gensler emphasizes collaborative design, workplace strategy, and sustainability. Portfolio reviews are central to interviews. Client communication and project management skills are highly valued.',
  'Over 6,000 employees worldwide. Projects range from airports to office interiors. Publishes an annual Workplace Survey.'
),
(
  'Bjarke Ingels Group',
  'big',
  'https://big.dk',
  'Architecture',
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'Copenhagen and New York',
  'BIG is an internationally acclaimed architecture firm known for innovative, sustainable, and narrative-driven design.',
  'BIG values ambitious and pragmatic architecture. Interviews focus on your design narrative and ability to tell a story about your work. They look for designers who think at multiple scales, from urban planning to material detail.',
  'Known for projects like The LEGO House and VIA 57 West. About 500 architects and designers. Strong culture of formal experimentation.'
),
(
  'Pentagram',
  'pentagram',
  'https://pentagram.com',
  'Graphic Design',
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'New York and San Francisco',
  'Pentagram is the world largest independent design consultancy, working across brand, identity, and visual communication.',
  'Pentagram is partner-led and every project is owned by a partner. They value independent thinking, strong craft, and a distinct point of view. Portfolio quality is everything.',
  'Founded in 1972. Famous clients include NYPD and Citibank. Each partner has full autonomy over their studio.'
),
(
  'Snohetta',
  'snohetta',
  'https://snohetta.com',
  'Architecture',
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'Oslo and New York',
  'Snohetta is an award-winning architecture and landscape firm known for landmark public buildings.',
  'Snohetta emphasizes a non-hierarchical and collaborative process. They mix architects, landscape architects, and artists in teams. They value cultural sensitivity, public impact, and sustainability.',
  'Famous for the Oslo Opera House and the San Francisco SFMOMA expansion. Strong commitment to public architecture and social impact.'
);

-- Finance companies
INSERT INTO public.companies (name, slug, website, industry, segment_id, location, description, culture_notes, notable_facts) VALUES
(
  'Goldman Sachs',
  'goldman-sachs',
  'https://goldmansachs.com',
  'Investment Banking',
  (SELECT id FROM public.segments WHERE slug = 'finance'),
  'New York, NY',
  'Goldman Sachs is a leading global investment bank providing a wide range of financial services.',
  'Goldman values analytical rigor, attention to detail, and a strong work ethic. Interviews include market knowledge questions, behavioral questions using STAR format, and case studies.',
  'Over 40,000 employees. One of the most prestigious firms on Wall Street. Known for their analyst training program.'
);

-- Generic fallback positions (no company_id)
INSERT INTO public.positions (title, company_id, segment_id, level, description, responsibilities, requirements) VALUES
(
  'Design Intern',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'intern',
  'Internship supporting the design team on active projects.',
  'Support design projects, create assets, participate in critiques, learn team processes.',
  'Currently enrolled in a design program, basic Figma skills, strong curiosity.'
),
(
  'Junior Designer',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'junior',
  'Entry-level design position focused on visual communication and layout.',
  'Create visual assets, support senior designers, participate in design reviews, iterate on feedback.',
  'Proficiency in Figma or Adobe Creative Suite, strong visual fundamentals, portfolio showing typography and composition skills.'
),
(
  'Mid-Level Designer',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'mid',
  'Independent designer who owns projects from brief to delivery.',
  'Lead design for features or campaigns, present work to stakeholders, mentor junior designers.',
  '3-5 years experience, strong portfolio, ability to present design rationale clearly.'
),
(
  'Senior Designer',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'senior',
  'Senior design leader who shapes design direction and mentors teams.',
  'Define design strategy, lead cross-functional design work, establish standards.',
  '5+ years experience, proven track record of shipping impactful design, leadership experience.'
),
(
  'Junior Frontend Engineer',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'junior',
  'Entry-level frontend role building and maintaining UI components.',
  'Build React components, fix bugs, write tests, participate in code review.',
  'Proficiency in HTML, CSS, and JavaScript, familiarity with React, understanding of git.'
),
(
  'Mid-Level Software Engineer',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'mid',
  'Independently own features end-to-end across the full stack.',
  'Design, build, and ship features, participate in system design discussions, mentor engineers.',
  '3-5 years professional experience, strong CS fundamentals.'
),
(
  'Senior Software Engineer',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'tech'),
  'senior',
  'Technical leader who shapes architecture and drives engineering quality.',
  'Lead technical design, mentor engineers, drive cross-team initiatives.',
  '5+ years experience, deep expertise in system design, strong collaboration skills.'
),
(
  'Junior Analyst',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'finance'),
  'junior',
  'Entry-level analyst supporting financial modeling and client work.',
  'Build financial models, conduct research, prepare presentations and client materials.',
  'Strong Excel skills, understanding of financial statements, analytical mindset.'
),
(
  'Junior Product Manager',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'health'),
  'junior',
  'Entry-level PM working on digital health products.',
  'Write PRDs, coordinate with engineering and design, gather user feedback.',
  'Strong written communication, ability to prioritize, comfort with ambiguity.'
),
(
  'Junior Associate',
  NULL,
  (SELECT id FROM public.segments WHERE slug = 'law'),
  'junior',
  'Entry-level associate supporting senior attorneys on cases and matters.',
  'Legal research, drafting memos and briefs, client communication support.',
  'JD from accredited law school, strong research and writing skills, attention to detail.'
);

-- Company-specific positions
INSERT INTO public.positions (title, company_id, segment_id, level, description, responsibilities, requirements) VALUES
(
  'Junior Product Designer',
  (SELECT id FROM public.companies WHERE slug = 'figma'),
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'junior',
  'Join Figma product design team to help shape the future of collaborative design tools.',
  'Design new features for the Figma editor, collaborate with product managers and engineers, participate in design critiques, create prototypes and specs.',
  'Strong visual design skills, proficiency in Figma, ability to think about systems and edge cases, portfolio showing product design work.'
),
(
  'Junior Designer',
  (SELECT id FROM public.companies WHERE slug = 'linear'),
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'junior',
  'Help Linear maintain its reputation for the highest-quality UI/UX in the project management space.',
  'Design UI components and flows for the Linear app, maintain and evolve the design system, work closely with engineers for pixel-perfect implementation.',
  'Exceptional attention to detail, strong portfolio demonstrating product and UI craft, ability to articulate design decisions.'
),
(
  'Junior Architectural Designer',
  (SELECT id FROM public.companies WHERE slug = 'gensler'),
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'junior',
  'Join Gensler studio to work on interior and architectural design projects across workplace, retail, and hospitality sectors.',
  'Produce design drawings and 3D models, support project documentation, participate in client presentations, coordinate with consultants.',
  'Professional degree in Architecture or Interior Design, proficiency in Revit and Rhino, AutoCAD skills, strong graphic communication abilities.'
),
(
  'Architectural Designer',
  (SELECT id FROM public.companies WHERE slug = 'big'),
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'junior',
  'Work at the forefront of innovative architecture on BIG portfolio of globally significant projects.',
  'Develop design proposals across all stages, create compelling visuals and models, contribute to design development meetings, support competition entries.',
  'Architecture degree, strong parametric design skills with Grasshopper and Rhino, ability to create renders and diagrams, strong conceptual thinking.'
),
(
  'Visual Designer',
  (SELECT id FROM public.companies WHERE slug = 'pentagram'),
  (SELECT id FROM public.segments WHERE slug = 'design'),
  'junior',
  'Support Pentagram partner studios on brand identity and visual communication projects.',
  'Design brand systems, create production files, support pitches and presentations, maintain quality across deliverables.',
  'Strong portfolio in identity and graphic design, mastery of Adobe Creative Suite, typography skills, attention to detail.'
);
