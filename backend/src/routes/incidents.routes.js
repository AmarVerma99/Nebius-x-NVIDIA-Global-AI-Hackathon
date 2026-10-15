const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { optionalAuth, authMiddleware } = require('../middleware/authMiddleware');

// Public / Guest accessible for smooth demo experience
router.get('/stats', incidentController.getDashboardStats);
router.post('/seed', incidentController.seedSampleIncidents);
router.get('/', incidentController.getAllIncidents);
router.get('/:id', incidentController.getIncidentById);

// Protected actions (optionalAuth allows demo guest users, or authenticated SREs)
router.patch('/:id/status', optionalAuth, incidentController.updateIncidentStatus);
router.delete('/:id', optionalAuth, incidentController.deleteIncident);

module.exports = router;
