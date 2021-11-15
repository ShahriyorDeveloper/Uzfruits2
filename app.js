const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const courseRouter = require('./routes/course');
const userRouter = require('./routes/user');
const categoriesRouter = require('./routes/categories');
const teacherRouter = require('./routes/teacher');

const app = express();


// validatorlar

const flash = require('connect-flash')
const validator = require('express-validator')
const session = require('express-session')
const passport = require('passport')


app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


//validator

app.use(validator({
  errorFormatter: (params, msg, value) => {
    let namespace = params.split('.'),
    root = namespace.shift(),
    formParam = root

    while(namespace.length){
      formParams += '[' + namespace.shift() + ']';
    }
    return{
      params: formParam,
      msg: msg,
      value: value
    }
  }
}))




// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

const db2 = require('./cf/db')

const mongoose = require('mongoose');
mongoose.connect(db2.db, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Mongo DB ga online ulanish hosil qilindi');
});


//pasport js ulash

require('./cf/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())

//global router yoqish

app.get('*', (req,res,next) => {
  res.locals.user = req.user || null;
  next();
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', categoriesRouter);
app.use('/', courseRouter);
app.use('/', userRouter);
app.use('/teacher', teacherRouter);
app.use(function (req, res, next) {
  //Capture All 404 errors
  res.redirect("/")
  res.status(404)
  })

// app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
