
const router = require('express').Router();

const UserController = require('../controllers/userController');

const verifyTokenMiddleware = require('../middlewares/auth');

router.get('/', verifyTokenMiddleware, UserController.getUserById);
router.put('/', verifyTokenMiddleware, UserController.updateUser);
router.delete('/', verifyTokenMiddleware, UserController.deleteUser);

module.exports = router;
