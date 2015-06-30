//setup
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var database = require('./config/database');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var passport = require('passport');

mongoose.connect(database.url);
require('./models/Teksty');
require('./models/Comments');
require('./models/Users');
require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);
app.use(methodOverride()); //dodane, nie wiem czy będę używał

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

