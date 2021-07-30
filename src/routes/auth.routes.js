const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');

router
  .post('/login', controller.login)
  .post('/register', controller.register)
  .post('/refresh', controller.refresh);

router.use(auth);
router
  .get('/me', controller.me)
  .patch('/update', controller.update)
  .patch('/updatePassword', controller.updatePassword);

module.exports = router;
