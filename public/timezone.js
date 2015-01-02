'use strict';

var app = angular.module('timezoneApp', []);

var GetOffset = app.factory('GetOffset', function($q, $http) {
    var getOffset = function(city) {
        var API_KEY = 'AIzaSyBSEddQuZj3hnlEVb3HSRWfR-CTKYwcgGk'
        var defer = $q.defer();
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&sensor=false').
          success(function(data, status, headers, config) {
            if (data.results.length > 0) {
                var lat = data.results[0].geometry.location.lat;
                var lng = data.results[0].geometry.location.lng;
                var timecity = data.results[0].address_components[0].long_name;
                $http.get('http://ws.geonames.org/timezoneJSON?lat=' + lat + '&lng=' + lng + '&username=peterparada').success(function(data, status, headers, config) {
                var offset = data.gmtOffset;
                defer.resolve([offset, timecity]);
            });

            } else {
                defer.resolve('nocityfound');
            }
          });
          return defer.promise;
    };
    return getOffset;
});

var timeCtrl = app.controller('TimeCtrl', function($scope, $timeout, GetOffset) {
    $scope.data = { city: 'New York', timecity: 'New York', color: '#000000' };
    $scope.time = { hours:'.', delimeter:'.', minutes:'.' }

    $scope.content = 'show';
    $scope.err = 'hidden'

    $scope.firstBlack = false;
    $scope.tickInterval = 1000;

    $scope.changeCity = function() {
        var passed = true;
        if (passed) {
            $scope.firstBlack = false;
            $scope.time = { hours:'.', delimeter:'.', minutes:'.' }
            GetOffset($scope.data.city).then(function success(data) {
                if (data === 'nocityfound') {
                    $scope.data.city = $scope.data.timecity;
                } else {
                    $scope.data.timecity = $scope.data.city;
                    var offset = data[0];
                    $scope.data.timecity = data[1];
                    $scope.data.city = data[1];
                    if (offset % 1 != 0) {
                        $scope.offsetHours = offset + 0.5;
                        $scope.offsetMinutes = -30;
                    } else {
                        $scope.offsetHours = offset;
                        $scope.offsetMinutes = 0;
                }
            };
                
                
            }, function error(msg) {
              console.error(msg);
            });
        };
    };

    $scope.changeCity();
    $scope.getTime = function() {
        var localeDate = new Date();
        var ISODate = new Date( localeDate.getTime() + (localeDate.getTimezoneOffset() * 60000));
        var hours = ISODate.getHours();
        var minutes = ISODate.getMinutes();
        hours += $scope.offsetHours;
        minutes += $scope.offsetMinutes;
        if (hours > 12) {
            hours -= 12;
            $scope.time.period = 'PM';
        } else if (hours < 0) {
            hours += 12;
            $scope.time.period = 'PM';
        } else if (hours == 0) {
            hours += 12;
            $scope.time.period = 'AM';
        } else {
            $scope.time.period = 'AM';
        }
        if (minutes < 0) {
            hours -= 1;
            minutes += 60;
            if (hours == 0) {
                hours += 12;
            }
        } 
        var hoursString = hours.toString();
        var minutesString = minutes.toString();
        if (hoursString.length == 1) {
            hoursString = '0' + hoursString; 
        }
        if (minutesString.length == 1) {
            minutesString = '0' + minutesString;
        }
        $scope.time.hours = hoursString;
        $scope.time.minutes = minutesString;
        $scope.time.delimeter = ':';
        $timeout($scope.getTime, $scope.tickInterval);
        if ($scope.firstBlack && $scope.data.color == '#000000') {
            $scope.data.color = '#444444'
        } else {
            $scope.firstBlack = true;
            $scope.data.color = '#000000'
        } 
    };
    $timeout($scope.getTime, $scope.tickInterval);
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});