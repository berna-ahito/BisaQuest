// routes/lobbyRoutes.js
// UC-2.1: Lobby API endpoints

import express from 'express';
import { getLobbyProgress } from '../controllers/lobbyController.js';

const router = express.Router();

router.get('/:playerId/progress', getLobbyProgress);

export default router;