// src/index.ts
import express from 'express';
import cors from 'cors';
import agentsRouter from './routes/agents';
import toolsRootRouter from "./routes/toolsRoot";
import 'dotenv/config'; 
import metalogsRouter from './routes/metalogsRouter';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/tools",  toolsRootRouter); 
app.use('/agents', agentsRouter);
app.use('/metalogs', metalogsRouter);

app.get('/health', (_req, _res) => {
  _res.send('OK');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 listening on ${PORT}`));
