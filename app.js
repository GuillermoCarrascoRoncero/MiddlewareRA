var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var serveIndex = require('serve-index');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var fs = require('fs');

const wadlPath = path.join(__dirname, 'docs', 'api-description.wadl');//

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/logs', serveIndex(path.join(__dirname, 'public/logs'))); // shows you the file list
app.use('/logs', express.static(path.join(__dirname, 'public/logs'))); // serve the actual files

//to include images
// app.use('/images', express.static('images'));

app.get('/wadl', (req, res) => {
  // Lee el archivo WADL y envíalo como respuesta
  fs.readFile(wadlPath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error al leer el archivo WADL:', err);
          return res.status(500).send('Error interno del servidor');
      }
      res.set('Content-Type', 'application/xml');
      res.send(data);
  });
});

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

app.listen(3001, () => {
  console.log(`Server is running`);
});

module.exports = app;