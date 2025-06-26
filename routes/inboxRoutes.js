
const router = require('express').Router();

const InboxController = require('../controllers/inboxController');

const verifyTokenMiddleware = require('../middlewares/auth');

router.get('/', verifyTokenMiddleware, InboxController.getInbox);

module.exports = router;
