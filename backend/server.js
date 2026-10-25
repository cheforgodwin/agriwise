import 'dotenv/config';
import express from 'express';
import connectDB from './db.js';
import languageDetector from './middleware/languageDetector.js';
import authRoutes from './routes/authRoutes.js';
import { CAMEROON_REGIONS } from './config/regions.js';

const app = express();
app.use(express.json());

connectDB();

app.use(languageDetector);

app.use('/api/auth', authRoutes);

app.get('/api/meta/regions', (req, res) => {
  res.json({ regions: CAMEROON_REGIONS });
});

app.get('/', (req, res) => {
  res.json({ status: 'API running', detectedLanguage: req.userLanguage });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
