import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(cors(
	{
		origin: env.corsOrigin,
		credentials: true
	}
));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'TicketMind API is healthy'
	});
});

app.use('/api/v1', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
