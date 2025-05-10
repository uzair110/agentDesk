// src/index.ts
import express from 'express';
import cors from 'cors';
import agentsRouter from './routes/agents';
import 'dotenv/config'; 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/agents', agentsRouter);

app.get('/health', (_req, _res) => {
  _res.send('OK');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 listening on ${PORT}`));
