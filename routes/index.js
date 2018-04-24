var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/memberAdd', function(req, res, next) {
    res.render('memberAdd');
});


router.get('/orderAdd', function(req, res, next) {
    res.render('orderAdd');
});


module.exports = router;