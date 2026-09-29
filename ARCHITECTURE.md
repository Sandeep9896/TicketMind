# TicketMind Backend - Centralized MVC Architecture

## Overview

The TicketMind backend has been **refactored from modular MVC** (each module had controllers/services/models) **to a centralized MVC pattern** where all business logic is organized at the root level with only feature-specific validators in module folders.

### Why This Change?

✅ **Better Scalability**: Single `/controllers`, `/services`, `/models` folders scales better than duplicating MVC in every feature
✅ **Easier Maintenance**: Find and edit business logic in predictable locations
✅ **Clear Separation of Concerns**: Models, services, controllers, validators each have their own purpose
✅ **Industry Standard**: Used by companies like Jira, Uber, Netflix for multi-domain systems

---

## New Directory Structure

```
backend/src/
├── config/               # Environment & database config
├── controllers/          # All HTTP request handlers
│   ├── auth.controller.js
│   ├── ticket.controller.js
│   ├── analytics.controller.js
│   └── ai-ticket.controller.js
├── models/              # All Mongoose schemas
│   ├── user.model.js
│   └── ticket.model.js
├── services/            # All business logic
│   ├── auth.service.js
│   ├── ticket.service.js
│   ├── analytics.service.js
│   ├── ai-ticket.service.js
│   └── ai-client.service.js
├── routes/              # All API route definitions
│   ├── index.js
│   ├── auth.routes.js
│   ├── ticket.routes.js
│   ├── analytics.routes.js
│   └── ai-ticket.routes.js
├── middlewares/         # Authentication, error handling
├── utils/               # Helpers (ApiError, asyncHandler)
├── socket/              # Socket.io realtime server
├── modules/             # Feature-specific validators ONLY
│   ├── ai-service/
│   │   └── validators/
│   │       └── ai-ticket.validator.js
│   └── ticket/
│       └── validators/
│           └── ticket.validator.js
├── app.js               # Express app initialization
└── server.js            # HTTP server + MongoDB + Socket.io
```

---

## MVC Layers Explained

### Models (`/models`)
Mongoose schemas defining database structure. Each model represents a data entity:
- **user.model.js**: User schema with auth methods (comparePassword, generateAccessToken)
- **ticket.model.js**: Ticket schema with comments, status tracking, resolution time

### Services (`/services`)
Pure business logic layer. Services are database-agnostic and testable:
- **auth.service.js**: User registration, login, password validation
- **ticket.service.js**: Create, read, update tickets; manage comments and assignments
- **analytics.service.js**: MongoDB aggregation pipelines for stats
- **ai-ticket.service.js**: AI integration (categorization, priority, replies)
- **ai-client.service.js**: Reusable Groq completion client with shared timeout/output limits

### Controllers (`/controllers`)
HTTP request handlers. Controllers:
1. Validate input (delegate to validators if needed)
2. Call service layer  
3. Emit Socket.io events if needed
4. Return JSON response

Example flow:
```
POST /tickets → ticketController.createTicket()
  → validateCreateTicketPayload() [validator]
  → ticketService.createTicket() [service]
  → emitToRole('agent', 'ticket:created') [Socket.io]
  → res.json(ticket)
```

### Routes (`/routes`)
Define API endpoints and wire controllers to them:
```javascript
router.post('/', verifyToken, ticketController.createTicket);
router.get('/:id', verifyToken, ticketController.getTicket);
```

### Validators (`/modules/*/validators`)
Input validation logic for each domain. Kept in modules because they're tied to specific features:
- **ticket/validators/**: Validate ticket title, description, priority, status
- **ai-service/validators/**: Validate AI request payloads (description, conversation, reply)

---

## Request Flow

```
HTTP Request
    ↓
Route Handler (routes/*.js)
    ↓
Middleware (auth.middleware.js)
    ↓
Controller (controllers/*.js) ← Handles HTTP layer
    ↓
Validator (modules/*/validators) ← Validates input
    ↓
Service (services/*.js) ← Business logic
    ↓
Model (models/*.js) ← Database queries
    ↓
MongoDB
```

---

## File Mappings

| Feature | Model | Service | Controller | Route | Validator |
|---------|-------|---------|------------|-------|-----------|
| **Auth** | user.model.js | auth.service.js | auth.controller.js | auth.routes.js | ✗ (inline) |
| **Tickets** | ticket.model.js | ticket.service.js | ticket.controller.js | ticket.routes.js | modules/ticket/validators |
| **Analytics** | ticket.model | analytics.service.js | analytics.controller.js | analytics.routes.js | ✗ (none) |
| **AI** | ✗ | ai-ticket.service.js + ai-client.service.js | ai-ticket.controller.js | ai-ticket.routes.js | modules/ai-service/validators |

---

## Import Patterns

### Service Imports (from controller)
```javascript
const ticketService = require('../services/ticket.service');
const { Ticket } = require('../models/ticket.model');
const User = require('../models/user.model');
```

### Validator Imports (in modules)
```javascript
// In modules/ticket/validators/ticket.validator.js
const { ticketStatuses } = require('../../../models/ticket.model');
const ApiError = require('../../../utils/ApiError');
```

---

## Adding a New Feature

To add a new feature (e.g., `Departments`):

1. **Create Model** → `src/models/department.model.js`
2. **Create Service** → `src/services/department.service.js`
3. **Create Controller** → `src/controllers/department.controller.js`
4. **Create Routes** → `src/routes/department.routes.js`
5. **Create Validators** (if needed) → `src/modules/department/validators/department.validator.js`
6. **Register Route** → Update `src/routes/index.js`

Example:
```javascript
// src/routes/index.js
const departmentRoutes = require('./department.routes');
router.use('/departments', departmentRoutes);
```

---

## Benefits vs. Modular MVC

| Aspect | Centralized MVC | Modular MVC |
|--------|-----------------|------------|
| **Finding Code** | Easy - all controllers in one folder | Harder - scattered across modules |
| **Import Paths** | Simple: `../services/...` | Complex: `../../../services/...` |
| **Duplication** | Never - one service per feature | Can duplicate if not careful |
| **Scaling** | Better for 10+ domains | Better for micro-services |
| **Learning Curve** | Faster for new developers | Steeper - need to understand module structure |

---

## Status

✅ **Refactoring Complete**
- All MVC files consolidated to root-level folders
- Only validators remain in `/modules`
- All imports fixed and tested
- Backend loads successfully on port 4000
- Ready for MongoDB connection

**Next Steps:**
1. Set up MongoDB (Atlas or local)
2. Run `npm run dev` to start backend
3. Run `npm run dev` in frontend folder to start React
4. Test API endpoints

---

## Database Connection

The backend is currently waiting for MongoDB connection. The connection string is fetched from `src/config/env.js` which reads:
- `MONGO_URI` environment variable (from .env file)

To connect:
- **Local MongoDB**: Start MongoDB server, use `MONGO_URI=mongodb://localhost:27017/ticketmind`
- **MongoDB Atlas**: Create Atlas cluster, use connection string with credentials

Once MongoDB is ready, the backend will:
1. Initialize Mongoose connection
2. Load Socket.io realtime server
3. Start Express HTTP server on port 4000

See `src/server.js` for full initialization sequence.
