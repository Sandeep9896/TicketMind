# TicketMind Backend API

Backend API for the TicketMind helpdesk platform.

## 1. Quick Start

### Requirements
- Node.js 18+
- MongoDB

### Install
~~~bash
npm install
~~~

### Environment
Create a .env file in backend folder:

~~~env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ticketmind
JWT_ACCESS_SECRET=your-very-strong-secret
JWT_ACCESS_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-very-strong-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Groq AI config (required only if AI routes are used)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com
AI_TIMEOUT_MS=30000
AI_MAX_OUTPUT_TOKENS=800
AI_MAX_CONVERSATION_CHARS=12000
~~~

### Run
~~~bash
npm run dev
~~~

Server starts on:
- http://localhost:5000

Health check:
- GET /health

## 2. API Basics

### Base URL
- http://localhost:5000/api/v1

### Content Type
- application/json

### Auth Header
For protected routes use:

~~~http
Authorization: Bearer <ACCESS_TOKEN>
~~~

### Standard Response Shape
Success:

~~~json
{
  "success": true,
  "message": "Optional success message",
  "data": {}
}
~~~

Error:

~~~json
{
  "success": false,
  "message": "Error message",
  "details": []
}
~~~

## 3. Roles and Access

Roles:
- user
- agent
- admin

Notes:
- Admin accounts cannot self-register.
- Agent registration requires agentType.
- Agent types:
  - hardware
  - software
  - network
  - security
  - account

## 4. Auth API

### 4.1 Register
- POST /api/v1/auth/register
- Public

Example: user registration
~~~bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "john.user@example.com",
    "password": "Password@123",
    "role": "user"
  }'
~~~

Example: agent registration
~~~bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anita Agent",
    "email": "anita.agent@example.com",
    "password": "Password@123",
    "role": "agent",
    "agentType": "network"
  }'
~~~

Response
~~~json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "65f...",
      "name": "Anita Agent",
      "email": "anita.agent@example.com",
      "role": "agent",
      "agentType": "network",
      "createdAt": "2026-03-18T12:00:00.000Z"
    },
    "token": "eyJ..."
  }
}
~~~

### 4.2 Login
- POST /api/v1/auth/login
- Public

~~~bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anita.agent@example.com",
    "password": "Password@123"
  }'
~~~

### 4.3 Get Current User
- GET /api/v1/auth/me
- Protected

~~~bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
~~~

### 4.4 List Agents
- GET /api/v1/auth/agents
- Admin only

~~~bash
curl http://localhost:5000/api/v1/auth/agents \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
~~~

## 5. Ticket API

### 5.1 Create Ticket
- POST /api/v1/tickets
- Protected (any authenticated user)

~~~bash
curl -X POST http://localhost:5000/api/v1/tickets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "VPN disconnects frequently",
    "description": "VPN drops every 10 minutes while connected to office Wi-Fi.",
    "priority": "high",
    "category": "Network"
  }'
~~~

Valid priority:
- low, medium, high, urgent

Valid category:
- Hardware, Software, Network, Access, Security, Account, Billing, Other

### 5.2 Get My Tickets
- GET /api/v1/tickets/my
- Protected

~~~bash
curl http://localhost:5000/api/v1/tickets/my \
  -H "Authorization: Bearer <USER_TOKEN>"
~~~

### 5.3 Get All Tickets
- GET /api/v1/tickets
- Agent or Admin

~~~bash
curl http://localhost:5000/api/v1/tickets \
  -H "Authorization: Bearer <AGENT_OR_ADMIN_TOKEN>"
~~~

### 5.4 Assign Ticket to Agent
- PATCH /api/v1/tickets/:ticketId/assign
- Admin only

~~~bash
curl -X PATCH http://localhost:5000/api/v1/tickets/<TICKET_ID>/assign \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "<AGENT_USER_ID>"
  }'
~~~

### 5.5 Update Ticket Status
- PATCH /api/v1/tickets/:ticketId/status
- Agent or Admin
- Agent can update assigned tickets

~~~bash
curl -X PATCH http://localhost:5000/api/v1/tickets/<TICKET_ID>/status \
  -H "Authorization: Bearer <AGENT_OR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
~~~

Valid status:
- open, in_progress, resolved, closed

### 5.6 Add Ticket Comment
- POST /api/v1/tickets/:ticketId/comments
- Protected
- Allowed for: admin, assigned agent, ticket owner

~~~bash
curl -X POST http://localhost:5000/api/v1/tickets/<TICKET_ID>/comments \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Could you confirm your VPN client version?"
  }'
~~~

## 6. Analytics API

All analytics routes are Admin only.

### 6.1 Overview
- GET /api/v1/analytics/overview

~~~bash
curl http://localhost:5000/api/v1/analytics/overview \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
~~~

### 6.2 Tickets per Category
- GET /api/v1/analytics/categories

~~~bash
curl http://localhost:5000/api/v1/analytics/categories \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
~~~

### 6.3 Agent Performance
- GET /api/v1/analytics/agent-performance

~~~bash
curl http://localhost:5000/api/v1/analytics/agent-performance \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
~~~

## 7. AI API

Only analyze route is public. Other AI routes require authentication.

### 7.1 Categorize Ticket
- POST /api/v1/ai/categorize

~~~bash
curl -X POST http://localhost:5000/api/v1/ai/categorize \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "My laptop does not detect HDMI monitor after update."
  }'
~~~

### 7.2 Detect Priority
- POST /api/v1/ai/priority

~~~bash
curl -X POST http://localhost:5000/api/v1/ai/priority \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Production API is down for all users."
  }'
~~~

### 7.3 Analyze Ticket
- POST /api/v1/ai/analyze
- Public

~~~bash
curl -X POST http://localhost:5000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "description": "VPN disconnects every few minutes while remote working."
  }'
~~~

### 7.4 Generate Professional Reply
- POST /api/v1/ai/reply
- Agent or Admin only

~~~bash
curl -X POST http://localhost:5000/api/v1/ai/reply \
  -H "Authorization: Bearer <AGENT_OR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "ticketTitle": "VPN issue",
    "description": "VPN disconnects frequently.",
    "conversation": "User says issue started after latest OS update."
  }'
~~~

### 7.5 Summarize Conversation
- POST /api/v1/ai/summarize
- Agent or Admin only

~~~bash
curl -X POST http://localhost:5000/api/v1/ai/summarize \
  -H "Authorization: Bearer <AGENT_OR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "VPN disconnects frequently.",
    "conversation": "Agent asked logs, user shared screenshots, DNS reset was attempted."
  }'
~~~

## 8. Role Test Endpoints

Useful to verify token role permissions.

- GET /api/v1/auth/admin-only
- GET /api/v1/auth/agent-only
- GET /api/v1/auth/user-only
- GET /api/v1/auth/agent-or-admin

Example:
~~~bash
curl http://localhost:5000/api/v1/auth/admin-only \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
~~~

## 9. Common Errors

- 400 Bad Request
  - Missing required fields
  - Invalid ObjectId
  - Invalid enum values
- 401 Unauthorized
  - Missing or invalid token
- 403 Forbidden
  - Role permission denied
- 404 Not Found
  - Route or resource not found
- 409 Conflict
  - Duplicate email during registration

## 10. Useful Tips

- Register normal users and agents using auth/register.
- Admin cannot be self-registered; promote user manually via database if needed.
- Keep JWT_ACCESS_SECRET strong and private.
- For local frontend integration, keep CORS_ORIGIN aligned with frontend origin.
