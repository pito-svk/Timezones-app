'use strict';

var express = require('express'),
    requestify = require('requestify');

// Setup server
var app = express();

// Configure views
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

// Configure third-party APIs
var APIs = {
    googleMaps: function(city) {
        var host = 'http://maps.googleapis.com';
        var path = '/maps/api/geocode/json?address=' + city + '&sensor=false';
        return host + path;
    },
    geoNames: function(lat, lng) {
        var username = 'YOUR_USERNAME';
        var host = 'http://ws.geonames.org';
        var path = '/timezoneJSON?lat=' + lat + '&lng=' + lng + '&username=' + username;
        return host + path;
    }
};

// Configure routes
app.get('/', function(req, res) {
    res.render('timezone.html');
});

app.get('/getoffset/:city', function(req, res) {

    // Send response as JSON
    res.setHeader('Content-Type', 'application/json');

    var googleMapsURL = APIs.googleMaps(req.params.city);

    // Send request
    requestify.get(googleMapsURL)
      .then(function(response) {
          var googleMapsData = response.getBody();

          if (googleMapsData.status === 'OK') {
            var firstRes = googleMapsData.results[0];
            var coords = firstRes.geometry.location;

            var lat = coords.lat;
            var lng = coords.lng;
            var cityName = firstRes.address_components[0].long_name;

            var geoNamesURL = APIs.geoNames(lat, lng);

            requestify.get(geoNamesURL)
              .then(function(response) {
                var geoNamesData = response.getBody();

                var offset = geoNamesData.gmtOffset;

                res.send(JSON.stringify({ status: 'success', offset: offset, cityName: cityName }));
              });

          } else {
              res.send(JSON.stringify({ status: 'cityNotFound' }));
          };
      }
    );
});

var port = process.env.PORT || 5000;

// Listen to server
app.listen(port, function () {
    console.log('Express server listening on %d, in %s mode', port, app.get('env'));
});
