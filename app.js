/* Module dependencies */
var express = require('express'),
    config = require('./config'),
    http = require('http'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    contentLength = require('express-content-length-validator'),
    routes = require('./routes/index');


// Get server environment
var serverEnvironment = (process.env.SERVER_ENVIRONMENT || "LOCAL");

var MAX_CONTENT_LENGTH_ACCEPTED = 9999;

// Init express server
var app = express();

// all environments
app.set('environment', serverEnvironment);
app.set('port', config.port || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(contentLength.validateMax({
    max: MAX_CONTENT_LENGTH_ACCEPTED,
    status: 400,
    message: "Payload too large."
}));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(compression());

// Custom headers
app.use(function(req, res, next) {
    res.header('Server', 'Apache'); // Put in any name here, it's spoofed to hide the fact that we're using node (for security)
    res.header("x-powered-by", "CppCMS/1.1.0"); // Put in any web server name here (spoofed for security)
    next();
});

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
    console.log(err);
    res.send('Oops, something went wrong!');
});

app.use(function(req, res) {
    res.send('404');
});

app.listen(app.get('port'), function() {
    console.log('Server running on port ' + app.get('port'));
});

module.exports = app;