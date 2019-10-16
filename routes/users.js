let express = require('express');
let router = express.Router();
let db = require('./login-example.js');

// 这里的根目录实际上是/users
router.get('/', db.toUserinfoManagement);

router.get('/add', db.addUserinfoGET);

router.post('/add', db.addUserinfoPOST);

router.get('/delete/:id', db.deleteUserinfo);

router.get('/update/:id',db.updateUserinfoGET);

router.post('/update', db.updateUserinfoPOST);

router.post('/search', db.queryUserinfo);

module.exports = router;