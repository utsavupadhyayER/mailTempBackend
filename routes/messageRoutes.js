
const router = require('express').Router();

const MessageController = require('../controllers/messageController');

const verifyTokenMiddleware = require('../middlewares/auth');

router.post("/", verifyTokenMiddleware, MessageController.createMessage);
router.get('/:id', verifyTokenMiddleware, MessageController.getMessageById);
router.delete('/:id', verifyTokenMiddleware, MessageController.deleteMessageById);

module.exports = router;
