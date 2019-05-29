const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const passportToRoom = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);;

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});


// Passport Config
require('./config/passport')(passport);

// require('./config/passportToRoom')(passportToRoom);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(
        'mongodb://127.0.0.1:27017/loginapp', { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use(express.static(__dirname));

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/rooms', require('./routes/rooms.js')(io));

app.use('/static', express.static(__dirname + '/public'));


app.post('/ajax', function (req, res){  
   console.log(req);
   console.log('req received');
   res.redirect('/rooms');

});