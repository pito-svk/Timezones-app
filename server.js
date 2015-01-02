'use strict';

var express = require('express');

// Setup server
var app = express();

// Configure views
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

// Configure routes
app.get('/*', function(req, res) {
    res.render('timezone.html');
});

var port = process.env.PORT || 5000;

// Listen to server
app.listen(port, function () {
    console.log('Express server listening on %d, in %s mode', port, app.get('env'));
});