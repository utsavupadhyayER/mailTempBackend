
const router = require('express').Router();

const MessageController = require('../controllers/messageController');

const verifyTokenMiddleware = require('../middlewares/auth');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.any(), MessageController.createMessage);
router.get('/:id', verifyTokenMiddleware, MessageController.getMessageById);
router.delete('/:id', verifyTokenMiddleware, MessageController.deleteMessageById);

module.exports = router;
