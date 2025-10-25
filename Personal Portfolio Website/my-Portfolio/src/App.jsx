/*
SmartPortfolio — Multi-page React Portfolio (single-file starter)

How to use (quick):
1. Create a new Vite React app:
   npm create vite@latest my-portfolio -- --template react
   cd my-portfolio
2. Install dependencies:
   npm install react-router-dom react-markdown framer-motion
3. Install Tailwind CSS (recommended):
   Follow the Tailwind install for Vite: https://tailwindcss.com/docs/guides/vite
   - npm install -D tailwindcss postcss autoprefixer
   - npx tailwindcss init -p
   - configure content in tailwind.config.js and add @tailwind directives to ./src/index.css
4. Replace src/App.jsx with this file's contents and put the example styles into src/index.css (or adapt to your tailwind setup).
5. Run dev server: npm run dev

Notes:
- This single-file component contains multiple internal components (Home, About, Projects, Resume, Contact, Nav, Footer).
- Expand by splitting components into separate files and connecting to your backend or CMS.

Personalized for: Mohd Juned Ansari — prefilled skills: React, Django, Python, Tailwind, Bootstrap, JavaScript.
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AUTHOR = {
  name: 'Mohd Juned Ansari',
  title: 'Full-Stack Web Developer',
  location: 'Bhopal, India',
  email: 'your.email@example.com',
  about: `I build responsive, scalable web applications using React and Django. I enjoy creating clean UIs,
optimizing performance, and building features that help users learn and achieve their goals. Currently
working on AI-powered e-learning projects and developer tools.`,
  skills: ['React', 'Django', 'Python', 'JavaScript', 'Tailwind CSS', 'Bootstrap', 'REST APIs', 'SQL']
};

const SAMPLE_PROJECTS = [
  {
    id: 'smartlearnai',
    title: 'SmartLearnAI — AI-powered e-learning',
    description: 'Adaptive course recommendations, chat-based tutor, progress tracking, and instructor tools. Built with React, Django, and OpenAI APIs.',
    tags: ['React','Django','AI'],
    github: '#',
    live: '#'
  },
  {
    id: 'donation-system',
    title: 'Donation Platform (Razorpay Integration)',
    description: 'Donation flow with Razorpay, Django backend storing donation records and confirmation emails.',
    tags: ['Django','Payments'],
    github: '#',
    live: '#'
  },
  {
    id: 'chatbot',
    title: 'OpenAI Chatbot Integration',
    description: 'React frontend + Django backend integrating with OpenAI for interactive chat and course assistance.',
    tags: ['React','OpenAI'],
    github: '#',
    live: '#'
  }
];

function App(){
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <Header />
          <main className="py-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

function Header(){
  return (
    <header className="py-6 flex items-center justify-between">
      <div>
        <Link to="/" className="text-2xl font-bold tracking-tight">{AUTHOR.name}</Link>
        <div className="text-sm text-slate-400">{AUTHOR.title} • {AUTHOR.location}</div>
      </div>
      <nav className="space-x-4 text-slate-200">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/resume">Resume</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
  );
}

function NavLink({ to, children }){
  return (
    <Link to={to} className="hover:text-white/90 transition">{children}</Link>
  );
}

function Home(){
  return (
    <section>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Hi, I’m {AUTHOR.name} — <span className="text-indigo-400">I build web apps</span></h1>
          <p className="mt-4 text-slate-300 max-w-xl">{AUTHOR.about}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/projects" className="px-4 py-2 bg-indigo-600 rounded-md">View Projects</a>
            <a href="/contact" className="px-4 py-2 border rounded-md">Contact Me</a>
            <a href="/resume" className="px-4 py-2 bg-slate-700 rounded-md">Download Resume</a>
          </div>

          <div className="mt-8">
            <h3 className="text-sm text-slate-400">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {AUTHOR.skills.map(s => (
                <span key={s} className="px-3 py-1 bg-white/6 rounded text-sm">{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className="p-6 bg-white/3 rounded-lg">
          <div className="text-sm text-slate-300">Contact</div>
          <h2 className="text-xl font-semibold mt-2">{AUTHOR.name}</h2>
          <div className="mt-3 text-slate-300">
            <div><strong>Email:</strong> <a className="text-indigo-300" href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a></div>
            <div className="mt-1"><strong>Location:</strong> {AUTHOR.location}</div>
            <div className="mt-3"><strong>Currently:</strong> Building useful web apps and learning new tech.</div>
          </div>

          <div className="mt-6">
            <a href="/contact" className="px-4 py-2 bg-indigo-600 rounded-md">Work with me</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function About(){
  return (
    <section className="prose prose-invert max-w-none">
      <h2>About Me</h2>
      <p>{AUTHOR.about}</p>
      <h3>Experience</h3>
      <ul>
        <li><strong>Full-Stack Developer</strong> — Built multiple web apps with React and Django, payment integrations, and AI chat features.</li>
        <li><strong>Internships & Projects</strong> — Completed projects in web development, UI design, and API integrations.</li>
      </ul>

      <h3>Education</h3>
      <p>B.Tech (2025) — Prestige Institute of Management and Research</p>
    </section>
  );
}

function Projects(){
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Selected Projects</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {SAMPLE_PROJECTS.map(p => (
          <article key={p.id} className="p-4 rounded-lg bg-white/3">
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="text-slate-300 mt-2">{p.description}</p>
            <div className="mt-3 flex gap-2">
              {p.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-700 rounded text-xs">#{t}</span>)}
            </div>
            <div className="mt-4 flex gap-2">
              <a href={p.github} className="text-sm px-3 py-1 border rounded">GitHub</a>
              <a href={p.live} className="text-sm px-3 py-1 bg-indigo-600 rounded text-white">Live</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Resume(){
  return (
    <section className="prose prose-invert max-w-none">
      <h2>Resume</h2>
      <p>Downloadable resume and highlights below.</p>
      <h3>Skills</h3>
      <ul>
        {AUTHOR.skills.map(s => <li key={s}>{s}</li>)}
      </ul>

      <h3>Work Experience</h3>
      <ol>
        <li><strong>Developer</strong> — Built features and collaborated with teams to deploy reliable web apps.</li>
      </ol>

      <div className="mt-6">
        <a className="px-4 py-2 bg-indigo-600 rounded-md text-white" href="/resume.pdf" download>Download Resume (PDF)</a>
      </div>
    </section>
  );
}

function Contact(){
  return (
    <section className="max-w-2xl">
      <h2>Contact</h2>
      <p>If you'd like to work together or say hi, email me at <a className="text-indigo-300" href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> or use the form below.</p>

      <form action={`mailto:${AUTHOR.email}`} method="post" encType="text/plain" className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" className="w-full p-2 rounded bg-white/5" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" className="w-full p-2 rounded bg-white/5" />
        </div>
        <div>
          <label className="block text-sm">Message</label>
          <textarea name="message" rows={6} className="w-full p-2 rounded bg-white/5" />
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-md">Send</button>
        </div>
      </form>
    </section>
  );
}

function Footer(){
  return (
    <footer className="py-10 text-center text-slate-400 text-sm">
      © {new Date().getFullYear()} {AUTHOR.name} — Built with React & Tailwind
    </footer>
  );
}

export default App;
