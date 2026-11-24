import 'dotenv/config';
import express from 'express';
import connectDB from './db.js';
import languageDetector from './middleware/languageDetector.js';
import authRoutes from './routes/authRoutes.js';
import { CAMEROON_REGIONS } from './config/regions.js';

const app = express();
app.use(express.json());

const clientOrigin = process.env.CLIENT_ORIGIN;
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (clientOrigin && origin === clientOrigin) {
    res.setHeader('Access-Control-Allow-Origin', clientOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, Accept-Language'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }

  next();
});

app.use(languageDetector);

app.use('/api/auth', authRoutes);

app.get('/api/meta/regions', (req, res) => {
  res.json({ regions: CAMEROON_REGIONS });
});

app.get('/', (req, res) => {
  res.json({ status: 'API running', detectedLanguage: req.userLanguage });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
