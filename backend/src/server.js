import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { initSocket } from './socket/socketServer.js';
import cookieParser from 'cookie-parser';

app.use(cookieParser());

const httpServer = createServer(app);

const startServer = async () => {
	try {
		await connectDB();
		initSocket(httpServer);
		httpServer.listen(env.port, () => {
			console.log(`TicketMind API running on port ${env.port}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error.message);
		process.exit(1);
	}
};

startServer();
