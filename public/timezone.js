'use strict'

var app = angular.module('timezoneApp', [])

// Creates http request and returns UTC offset
.factory('GetOffset', function ($q, $http) {
  var getOffset = function (city) {
    return $http.get('/getoffset/' + city)
  }
  return getOffset
})

.controller('TimeCtrl', function ($scope, $timeout, GetOffset) {
    // Define static variables
  var black = '#000000'
  var gray = '#444444'
  var tickInterval = 1000

    // Define global variables
  $scope.delimeterColor = black
  $scope.firstGray = false

  $scope.city = { input: 'New York', result: 'New York' }
  $scope.time = { hours: '.', delimeter: '.', minutes: '.' }

  $scope.offset = null

    // Call when user change the city
  $scope.changeCity = function () {
    $scope.time = { hours: '.', delimeter: '.', minutes: '.' }
    $scope.delimeterColor = black
    $scope.firstGray = false

    GetOffset($scope.city.input)
          .then(function success (response) {
            var data = response.data

            if (data.status === 'cityNotFound') {
              $scope.city.input = $scope.city.result
            } else {
              $scope.city.result = $scope.city.input

              var offset = data.offset
              var cityName = data.cityName

              $scope.offset = offset

              $scope.city.input = cityName
              $scope.city.result = cityName
            };
          })
  }

  $scope.changeCity()

    // Get current ISO time
  var getISOTime = function () {
    var localeDate = new Date()
    var ISODate = new Date(localeDate.getTime() + (localeDate.getTimezoneOffset() * 60000))
    return {
      hours: ISODate.getHours(),
      minutes: ISODate.getMinutes()
    }
  }

    // Update time every second
  var getTime = function () {
    var ISOTime = getISOTime()
    var ISOHours = ISOTime.hours
    var ISOMinutes = ISOTime.minutes

    var hours = ISOHours + ($scope.offset | 0)
    var minutes = ISOMinutes + (($scope.offset % 1) * (60))

    var period = (hours >= 0 && hours < 12) ? 'AM' : 'PM'

    if (hours <= 0) {
      hours += 12
    } else if (hours > 12) {
      hours -= 12
    };

    if (minutes >= 60) {
      minutes -= 60
      hours += 1
    };

    $scope.time.hours = hours
    $scope.time.delimeter = ':'
    $scope.time.minutes = minutes
    $scope.time.period = period

    $timeout(getTime, tickInterval)

    if ($scope.firstGray && $scope.delimeterColor == black) {
      $scope.delimeterColor = gray
    } else {
      $scope.delimeterColor = black
      $scope.firstGray = true
    };
  }
  $timeout(getTime, tickInterval)
})

// Call event when pressing Enter
.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter)
        })
        event.preventDefault()
      }
    })
  }
})

.filter('time', function () {
  return function (n) {
    return (n < 10) ? '0' + n : n
  }
})
