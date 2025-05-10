import { Router } from 'express';
import {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
} from '../controllers/agents';
import { chatAgent } from '../controllers/chat';

const router = Router();

router.post('/', createAgent);
router.get('/', listAgents);
router.get('/:id', getAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);
router.post('/:id/chat', chatAgent);

export default router;
