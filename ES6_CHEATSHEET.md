# ES6 Module Cheat Sheet - TicketMind

## Quick Copy-Paste Guide for New Files

### Service File Template
```javascript
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { Ticket } from '../models/ticket.model.js';

// Your logic here

export { functionName1, functionName2 };
```

### Controller File Template
```javascript
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import * as serviceModule from '../services/service.service.js';

const myHandler = asyncHandler(async (req, res) => {
  // Your handler logic
});

export { myHandler };
```

### Route File Template
```javascript
import express from 'express';
import * as Controller from '../controllers/controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, Controller.myHandler);

export default router;
```

### Model File Template
```javascript
import mongoose from 'mongoose';

const Schema = new mongoose.Schema({ /* fields */ });
const Model = mongoose.model('ModelName', Schema);

export default Model; // for single model
// OR
export { Model, otherExports }; // for multiple exports
```

### Middleware File Template
```javascript
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const myMiddleware = (req, res, next) => {
  // Logic
  return next();
};

export { myMiddleware };
```

---

## Important Rules

✅ **DO**:
- Always use `.js` extension in relative imports: `import x from './file.js'`
- Use `export default` for single exports (models, configs, main files)
- Use `export { }` for multiple named exports (services, controllers)
- Use `import * as namespace` when importing many items from a module
- Keep file names lowercase with hyphens: `auth-service.js`

❌ **DON'T**:
- ~~`const module = require('...')`~~ → Use `import ... from '...'`
- ~~`module.exports = ...`~~ → Use `export ...`
- Don't forget `.js` extension on relative imports
- Don't mix `import` and `require` in same file
- Don't export class constructors with `export default new Class()`

---

## Examples in Project

### Single Default Export (Models, Config)
```javascript
// user.model.js
export default User;

// env.js  
export default env;

// Import:
import User from '../models/user.model.js';
import env from '../config/env.js';
```

### Multiple Named Exports (Services)
```javascript
// auth.service.js
export { register, login };

// Import:
import { register, login } from '../services/auth.service.js';
// OR
import * as authService from '../services/auth.service.js';
```

### Route Default Export
```javascript
// auth.routes.js
export default router;

// Import:
import authRoutes from './auth.routes.js';
```

---

## Testing New Files

After creating a new file, test it:

```bash
node -e "import('./src/path/to/file.js').then(() => console.log('✓ Works')).catch(e => console.error('✗', e.message))"
```

---

## Migration Checklist

When adding new files, ensure:

- [ ] `package.json` has `"type": "module"`
- [ ] File uses `import` statements (not `require`)
- [ ] File uses `export` statements (not `module.exports`)
- [ ] Relative imports include `.js` extension
- [ ] No top-level `await` outside async context
- [ ] Tested with `node -e` verification command

---

That's it! Happy coding with ES6 modules! 🚀
