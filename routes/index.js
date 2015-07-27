var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();
var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});


/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

var mongoose = require('mongoose');
var passport = require('passport');
var Tekst = mongoose.model('Tekst');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

router.get('/teksty', function (req, res, next) {
    console.log("Jestem w /teksty, Method: get (all)");
    Tekst.find(function (err, teksty) {
        if (err) {
            return next(err);
        }

        res.json(teksty);
    });
});

router.post('/teksty', auth, function (req, res, next) {
    var tekst = new Tekst(req.body);
    tekst.author = req.payload.username;

    console.log("Jestem w /teksty, Method: post ");
    tekst.save(function (err, tekst) {
        if (err) {
            return next(err);
        }

        res.json(tekst);
    })
});

router.param('tekst', function (req, res, next, id) {
    var query = Tekst.findById(id);
    console.log("router.param ");
    query.exec(function (err, tekst) {
        if (err) {
            return next(err);
        }
        if (!tekst) {
            return next(new Error("can't find (tekst)"));
        }
        req.tekst = tekst;
        return next();
    });
});

router.get('/teksty/:tekst', function (req, res, next) {
    console.log("Jestem w /teksty/:id, Method: get (one tekst)");
    req.tekst.populate('comments', function(err,tekst){
        if(err){
            return next(err);
        }
        res.json(tekst);
    });
});


router.delete('/teksty/:tekst', auth, function (req, res, next) {

    console.log("Jestem w /teksty, Method: DELETE" + JSON.stringify(req.params));
    Tekst.findByIdAndRemove(req.params.tekst, req.body, function (err, tekst) {
        console.log("CallBACK DELETE'a +" + tekst);
        if (err) {
            return next(err);
        }

        res.json(tekst);
    });
});

router.put('/teksty/:tekst', auth, function (req, res, next) {

    console.log("Jestem w /teksty, Method: PUT" + JSON.stringify(req.params));
    Tekst.findByIdAndUpdate(req.params.tekst, req.body, function (err, tekst) {
        console.log("CallBACK PUT'a +" + tekst);
        if (err) {
            return next(err);
        }


        console.log("test0 co to tekst" + JSON.stringify(tekst));
        res.json(tekst);
    });
});

/*/
 COMMENTS
 */

router.post('/teksty/:tekst/comments', auth, function (req, res, next) {
    var comment = new Comment(req.body);
    comment.tekst = req.tekst;
    comment.author = req.payload.username;
    comment.save(function (err, comment) {
        if (err) {
            return next(err);
        }
        req.tekst.comments.push(comment);
        req.tekst.save(function (err, tekst) {
            if (err) {
                return next(err);
            }
            res.json(comment);
        });
    });
});

/*/
 Register nad login
 */
router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Wypełnij puste pola'
        });
    }
    var user = new User();

    user.username = req.body.username;
    console.log('Przekazuję username' + user.username);
    user.setPassword(req.body.password);
    console.log('Przekazuję haslo ??');
    user.save(function (err) {
        if (err) {
            return next(err);
        }
        return res.json({token: user.generateJWT()});
    });
});
router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Uzupełnij puste pola'
        })
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (user) {
            return res.json({
                token: user.generateJWT()
            });
        } else {
            res.status(401).json(info);
        }
    })(req, res, next);
});


module.exports = router;
