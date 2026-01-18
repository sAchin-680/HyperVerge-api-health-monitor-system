import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import monitorRoutes from './routes/monitorRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_, res) => {
  res.json({ status: 'API IS RUNNING' });
});

app.use('/auth', authRoutes);
app.use('/monitors', monitorRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
