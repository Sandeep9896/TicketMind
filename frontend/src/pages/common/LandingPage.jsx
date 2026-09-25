import { Link } from 'react-router-dom';

const metrics = [
  { label: 'Avg First Response', value: '< 5 min' },
  { label: 'Resolved Tickets', value: '25k+' },
  { label: 'Live Agent Teams', value: '120+' }
];

const features = [
  {
    title: 'Role-Centric Workspaces',
    description:
      'Dedicated dashboards for users, agents, and admins to keep each workflow clean and focused.'
  },
  {
    title: 'Real-Time Ticket Operations',
    description:
      'Track status updates, ownership, and comments instantly so support conversations stay in sync.'
  },
  {
    title: 'AI-Assisted Support',
    description:
      'Use AI tools for issue analysis, priority suggestions, and professional response generation.'
  }
];

const aiHighlights = [
  {
    title: 'Auto Triage Suggestions',
    description:
      'TicketMind AI analyzes incoming issue descriptions and suggests category plus urgency to reduce manual sorting.'
  },
  {
    title: 'Agent Reply Assistant',
    description:
      'Draft clear, empathetic support responses with AI context from ticket history and user conversation.'
  },
  {
    title: 'Conversation Summaries',
    description:
      'Generate concise summaries and next actions so handoffs between shifts stay accurate and fast.'
  }
];

const workflowSteps = [
  {
    step: '01',
    title: 'User Submits Ticket',
    detail: 'Users raise issues through a simple guided form with priority and category hints.'
  },
  {
    step: '02',
    title: 'Admin Assigns Team',
    detail: 'Admins view all tickets, assign work to agents, and monitor SLA progress in real time.'
  },
  {
    step: '03',
    title: 'Agent Resolves and Communicates',
    detail: 'Agents update status, collaborate with users, and close tickets with documented resolution.'
  }
];

const faqs = [
  {
    question: 'Can different roles access separate interfaces?',
    answer: 'Yes. TicketMind provides dedicated dashboards for user, agent, and admin roles.'
  },
  {
    question: 'Does TicketMind support AI workflows?',
    answer: 'Yes. It supports AI-based categorization, priority detection, reply drafting, and conversation summaries.'
  },
  {
    question: 'Is this platform suitable for internal IT teams?',
    answer: 'Yes. It is designed for internal support operations with assignment, status control, and audit-friendly communication.'
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen scroll-smooth bg-slate-950 text-slate-100" style={{ fontFamily: 'Trebuchet MS, Avenir Next, Segoe UI, sans-serif' }}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-2xl font-semibold tracking-tight">TicketMind</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Intelligent Helpdesk Platform</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <a href="#features" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-900">
              Features
            </a>
            <a href="#ai" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-900">
              AI
            </a>
            <a href="#workflow" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-900">
              Workflow
            </a>
            <Link to="/login" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-900">
              User Login
            </Link>
            <Link to="/agent/login" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-900">
              Agent Login
            </Link>
            <Link to="/admin/login" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-900">
              Admin Login
            </Link>
          </nav>
        </header>

        <main className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-7">
            <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
              Modern Service Desk
            </p>

            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Deliver Faster IT Support With Clarity and Control.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              TicketMind centralizes ticket creation, triage, assignment, and communication into one sleek workflow designed for modern support teams.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                Create User Account
              </Link>
              <Link to="/agent/register" className="rounded-full border border-emerald-300/60 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30">
                Register as Agent
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl shadow-cyan-950/30">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Live Metrics</p>
              <div className="mt-4 grid gap-3">
                {metrics.map((metric) => (
                  <article key={metric.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs text-slate-400">{metric.label}</p>
                    <p className="mt-1 text-lg font-semibold text-cyan-100">{metric.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-3xl font-semibold text-white">Built For Every Ticket Journey</h2>
          <p className="mt-2 text-slate-300">
            From user request creation to admin oversight and agent collaboration, TicketMind keeps operations structured and fast.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/60"
            >
              <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 p-6 lg:p-8">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">AI Engine</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">TicketMind AI Works Alongside Your Team</h2>
            <p className="mt-3 text-slate-300">
              Instead of replacing agents, TicketMind AI speeds up repetitive work and improves decision quality in every stage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {aiHighlights.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-cyan-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-3xl font-semibold text-white">How TicketMind Flows</h2>
          <p className="mt-2 text-slate-300">A predictable support lifecycle that teams can trust and scale.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {workflowSteps.map((item) => (
            <article key={item.step} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-sm font-semibold tracking-wide text-emerald-200">Step {item.step}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
            <div className="mt-5 space-y-4">
              {faqs.map((item) => (
                <article key={item.question} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold text-slate-100">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-800/40 bg-gradient-to-b from-emerald-900/30 to-slate-900 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Get Started</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Bring Calm To Support Chaos</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Start with user signup, onboard your agents by specialization, and monitor support quality through admin dashboards.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/register"
                className="block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Start as User
              </Link>
              <Link
                to="/agent/register"
                className="block rounded-xl border border-emerald-300/50 bg-emerald-500/20 px-4 py-3 text-center text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
              >
                Join as Agent
              </Link>
              <Link
                to="/admin/login"
                className="block rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              >
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
