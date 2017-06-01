const express = require('express')
const requestify = require('requestify')

const app = express()

app.set('views', `${__dirname}/public`)
app.engine('html', require('ejs').renderFile)
app.use(express.static(`${__dirname}/public`))

const APIs = {
  googleMaps: city => {
    return `http://maps.googleapis.com/maps/api/geocode/json?address=${city}&sensor=false`
  },
  geoNames: (lat, lng) => {
    const username = 'YOUR_USERNAME'
    const host = 'http://ws.geonames.org'
    const path = '/timezoneJSON?lat=' + lat + '&lng=' + lng + '&username=' + username
    return host + path
  }
}

app.get('/', (req, res) => {
  res.render('timezone.html')
})

app.get('/getoffset/:city', function (req, res) {
  res.setHeader('Content-Type', 'application/json')

  const googleMapsURL = APIs.googleMaps(req.params.city)

  requestify.get(googleMapsURL)
      .then(function (response) {
        var googleMapsData = response.getBody()

        if (googleMapsData.status === 'OK') {
          var firstRes = googleMapsData.results[0]
          var coords = firstRes.geometry.location

          var lat = coords.lat
          var lng = coords.lng
          var cityName = firstRes.address_components[0].long_name

          var geoNamesURL = APIs.geoNames(lat, lng)

          requestify.get(geoNamesURL)
              .then(function (response) {
                var geoNamesData = response.getBody()

                var offset = geoNamesData.gmtOffset

                res.send(JSON.stringify({ status: 'success', offset: offset, cityName: cityName }))
              })
        } else {
          res.send(JSON.stringify({ status: 'cityNotFound' }))
        };
      }
    )
})

var port = process.env.PORT || 5000

// Listen to server
app.listen(port, function () {
  console.log('Express server listening on %d, in %s mode', port, app.get('env'))
})
