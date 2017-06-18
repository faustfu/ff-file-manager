'use strict';

global.__base = __dirname;
global.ENV = require('./config'); //load environment config and constant

const express = require('express');
const session = require('express-session');
const flash = require('express-flash')
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const morgan = require('morgan');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');
const cors = require('./config/middlewares/cors');
const uploadErrorHandler = require("./config/middlewares/errorHandler");
const passport = require('./config/middlewares/passport');

const app = express();

//middleware
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cors);
app.use(uploadErrorHandler(ENV.setting.maxFileSize));
app.use(morgan('[:date[iso]] :status ":method :url :response-time ms :res[content-length] HTTP/:http-version" :remote-user ":user-agent" ":referrer"'));

// multer options
const options = {
  storage: multer.diskStorage({
    destination: function(req, file, cb){ cb(null, ENV.setting.uploadDir); },
    filename: function(req, file, cb){
      const toName = Date.now().toString()+'-'+crypto.createHash('md5').update(file.originalname).digest('hex')+'.'+mime.extension(file.mimetype);
      cb(null, toName);
    }
  }),
  limits: {
    fileSize: ENV.setting.maxFileSize
  }
};
app.use(multer(options).array('file', 7));
app.use(flash());

app.set('view engine', 'ejs');    // Set the template engine
app.engine('ejs', ejs.__express);

//global variables
global._ = require('lodash');
global.fn = require('./src/modules/fn');
global.passport = passport;
global.modules = require('./src/modules/interface')(app, ENV);

require('./config/routes')(app, ENV);

app.listen(process.env.PORT || ENV.setting.port);
console.log('Express app started on port: ' + ENV.setting.port);
console.log('NODE_ENV=', process.env.NODE_ENV);
