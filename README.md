# TicketMind

TicketMind is a role-based IT helpdesk platform with modern workflows for users, agents, and admins.

This README is intentionally written in a Gamma-friendly format so you can paste it directly into Gamma AI and generate a presentation.

## How To Use This With Gamma AI

1. Open Gamma and choose Generate from text.
2. Paste this full README.
3. Choose a Professional or Product style.
4. Keep one heading section per slide.
5. Use the "Slide" headings below as your slide structure.

## Slide 1: Title

TicketMind

Smart IT Helpdesk Ticketing Platform

From issue reporting to resolution with role-based control and AI support.

## Slide 2: Problem Statement

Support teams commonly face:

- Unstructured ticket intake and inconsistent triage
- Delays in assignment and status visibility
- Fragmented communication between requester and resolver
- Limited operational insights for decision makers

## Slide 3: Product Vision

TicketMind centralizes the full support lifecycle in one platform:

- Raise, assign, track, and resolve tickets
- Enable clear user-agent communication on each ticket
- Separate role experiences for user, agent, and admin
- Add AI assistance to improve speed and quality

## Slide 4: User Roles

User:

- Creates tickets
- Tracks own tickets
- Communicates with assigned agent

Agent:

- Views assigned/incoming tickets
- Updates ticket status
- Communicates with ticket creator

Admin:

- Views all tickets
- Assigns tickets to agents
- Monitors analytics and category trends

## Slide 5: Core Features

- JWT-based authentication and protected role routes
- Ticket lifecycle management: open, in progress, resolved, closed
- Assignment workflow (admin to agent)
- Ticket comments and communication threads
- AI endpoints for categorization, priority, analysis, reply, and summary
- Admin analytics dashboards

## Slide 6: Frontend Stack

- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS

Frontend provides:

- Dedicated pages and route guards for user, agent, admin
- Modern dark UI with role-specific color systems
- Dashboard, ticket management, and communication experiences

## Slide 7: Backend Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO event server
- OpenAI SDK integration (provider-driven AI service)

Backend qualities:

- Centralized MVC architecture
- Validation layer for ticket and AI payloads
- Standard API response shape

## Slide 8: Architecture Overviewy

Backend folders:

- controllers: request handlers
- services: business logic
- models: Mongoose schemas
- routes: API route definitions
- middlewares: auth and error handling
- modules/*/validators: feature validators
- socket: realtime server and events

Frontend folders:

- pages: role and feature pages
- components: shared UI and layout
- routes: app route map
- services/api: API clients
- context/hooks: auth state and session behavior

## Slide 9: API Surface

Base URL:

- /api/v1

Main route groups:

- /auth
- /tickets
- /analytics
- /ai

Ticket routes include:

- Create ticket
- Get my tickets
- Get all tickets (agent/admin)
- Assign ticket (admin)
- Update status (agent/admin)
- Add comment

## Slide 10: Ticket Lifecycle

1. User submits ticket with title, description, priority, and category.
2. Ticket is visible in system and available for assignment.
3. Admin assigns ticket to a suitable agent.
4. Agent updates status through resolution flow.
5. User and agent communicate through ticket comments.
6. Admin monitors progress and outcomes via analytics.

## Slide 11: Communication Model

Current implemented behavior:

- Comments are persisted in MongoDB via REST API.
- Both communication pages auto-refresh every few seconds.
- After sending a message, thread refreshes immediately.

Realtime readiness:

- Backend already emits Socket.IO events for ticket updates and comments.
- Ticket room join and leave support exists server-side.
- Frontend can be upgraded to live socket subscriptions for instant push updates.

## Slide 12: Security and Access Control

- Bearer token authentication via JWT
- Route-level role restrictions (user, agent, admin)
- Ticket permission checks for status updates and comments
- Centralized not found and error middleware responses

## Slide 13: AI Capabilities

AI route capabilities include:

- Ticket categorization
- Priority detection
- End-to-end ticket analysis
- Agent reply generation (restricted role)
- Conversation summary generation (restricted role)

Value delivered:

- Faster triage
- More consistent responses
- Better support handoff quality

## Slide 14: UI and Experience Highlights

- Role-based AppShell navigation
- Distinct visual language by role
- Clean communication threads for user-agent collaboration
- Responsive layouts for desktop and mobile
- Dashboard-first workflow for each user type

## Slide 15: Business Impact

- Reduced response and resolution friction
- Better accountability through explicit assignment and status
- Improved communication transparency for users
- Better operations visibility for admins
- AI-assisted productivity gains for support teams

## Slide 16: Demo Script

1. Login as user and create a ticket.
2. Open My Tickets and navigate to communication.
3. Login as admin and assign ticket to an agent.
4. Login as agent and post communication updates.
5. Return to user side and show refreshed conversation.
6. Show admin analytics dashboard and category insights.

## Slide 17: Roadmap

Near term:

- Frontend Socket.IO live subscriptions for zero-delay updates
- Notification badges for unread ticket activity
- Better comment search and filtering

Future:

- SLA breach alerts
- File attachment support in threads
- Expanded reporting and trend forecasting

## Slide 18: Closing

TicketMind turns support operations into a clear, role-driven, and scalable system.

Tagline:

"From ticket creation to confident resolution."

## Project Quick Start

### Backend

1. Go to backend folder.
2. Install dependencies with npm install.
3. Add .env variables (Mongo URI, JWT secret, CORS origin, AI keys).
4. Run npm run dev.

### Frontend

1. Go to frontend folder.
2. Install dependencies with npm install.
3. Run npm run dev.

### Production Build

- Frontend build command: npm run build

