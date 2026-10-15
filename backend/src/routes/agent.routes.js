const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { aiIncidentLimiter } = require('../middleware/rateLimiter');

// AI Diagnostics pipeline
router.post('/analyze', aiIncidentLimiter, optionalAuth, agentController.analyzeIncident);
router.post('/tavily-search/:id', optionalAuth, agentController.investigateWithTavily);
router.post('/escalate/:id', aiIncidentLimiter, optionalAuth, agentController.escalateIncident);
router.post('/sandbox/:id', optionalAuth, agentController.executeSandbox);
router.get('/stream', agentController.streamReasoning);

module.exports = router;
