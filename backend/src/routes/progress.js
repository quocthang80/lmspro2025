const express = require('express');
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/events', progressController.trackEvent);
router.get('/summary', progressController.getSummary);
router.get('/:enrollmentId/lessons/:lessonId', progressController.getDetailedProgress);

module.exports = router;
