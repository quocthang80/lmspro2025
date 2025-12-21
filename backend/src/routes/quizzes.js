const express = require('express');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.use(authMiddleware);

router.get('/', quizController.getAll);
router.get('/:id', quizController.getById);
router.post('/', checkRole('ADMIN'), auditLog('CREATE', 'QUIZ'), quizController.create);
router.put('/:id', checkRole('ADMIN'), auditLog('UPDATE', 'QUIZ'), quizController.update);
router.delete('/:id', checkRole('ADMIN'), auditLog('DELETE', 'QUIZ'), quizController.delete);

router.post('/:id/attempts', quizController.startAttempt);
router.post('/attempts/:id/submit', quizController.submitAttempt);
router.get('/attempts', quizController.getAttempts);

module.exports = router;
