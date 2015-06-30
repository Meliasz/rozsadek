var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

var mongoose = require('mongoose');
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
    req.tekst.populate('comments', function(err,tekst){ //obczaić czy nie musi być osobny router get
        if(err){
            return next(err);
        }
    });
    res.json(req.tekst); //res.json(tekst);
});


router.delete('/teksty/:tekst', function (req, res, next) {
    //for (var key in req.params) {
    //       if (req.params.hasOwnProperty(key)) {
    //           console.log(key + " :: " + req.params[key])
    //       }
    //   }
    console.log("Jestem w /teksty, Method: DELETE" + JSON.stringify(req.params));
    Tekst.findByIdAndRemove(req.params.tekst, req.body, function (err, tekst) {
        console.log("CallBACK DELETE'a +" + tekst);
        if (err) {
            return next(err);
        }

        res.json(tekst);
    });
});

router.put('/teksty/:tekst', function (req, res, next) {

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
    comment.tekst = req.tekst; //przypuszczalnie może być tu błąd, sprawdzić (powiązanie z teksty)
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
            message: "Wypełnij puste pola"
        })
    }
    var user = new User();

    user.username = req.body.username;
    user.setPassword(req.body.password);

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
