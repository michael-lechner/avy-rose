/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* Constants */
var dir = {
    e: 0,
    se: 1,
    s: 2,
    sw: 3,
    w: 4,
    nw: 5,
    n: 6,
    ne: 7
}

var dColor = {
    low: '#4DB848',
    moderate: '#FFF200',
    considerable: '#F7931D',
    high: '#ED1C23',
    extreme: '#000000'
}

var dIndex = {
    low: 1,
    moderate: 2,
    considerable: 3,
    high: 4,
    extreme: 4
}

var dangerDescrip = {
    low: 'Generally safe avalanche conditions. Watch for unstable snow on isolated terrain features',
    moderate: 'Heightened avalanche conditions on specific terrain features. Evaluate snow and terrain carefully; identify features of concern',
    considerable: 'Dangerous avalanche conditions. Careful snowpack evaluation, cautious route-finding and conservative decision-making essential',
    high: 'Very dangerous avalanche conditions. Travel in avalanche terrain NOT recommended.',
    extreme: 'Avoid all avalanche terrain'
}

var testing = false;
var prevHeading = 0;
var mainHeading = 0;
/*************/
var app = {
    compassInit: function () {
        var pollFreq = { frequency: 100 };
        
        function onError() {
            if(testing){
                $('#heading').html('err no compass');
            }
        };

        function onSuccess(heading) {
            if(testing){
                var headingDisplay = $('#heading');
                headingDisplay.html('Heading: ' + heading.magneticHeading);
                console.log(heading.magneticHeading);
            }

            mainHeading = (360 - heading.magneticHeading);

            var el = $('svg');
            TweenMax.to(el, 0.2, {rotationZ: mainHeading + 'short'});
        };

        var watchID = navigator.compass.watchHeading(onSuccess, onError, pollFreq);        
    },
    checkConnection: function () {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = true
            states[Connection.ETHERNET] = true
            states[Connection.WIFI]     = true
            states[Connection.CELL_2G]  = true
            states[Connection.CELL_3G]  = true
            states[Connection.CELL_4G]  = true
            states[Connection.CELL]     = true
            states[Connection.NONE]     = false;

            return states[networkState];
    },
    drawCompass: function (forecast, forecastNum) {

        var sWidth = $(window).width();
        var sHeight = $(window).height();
        var containerDim = sWidth*0.9
        var paper = Raphael(sWidth*0.05, sHeight*0.3, containerDim, containerDim + 100);
        var offset = containerDim/2;
        var yOffset = sHeight*0.1
        var subAng = Math.PI / 4;
        var radius = [70, 110, 140];
        var pollFreq = { frequency: 100 };
        var avyRose = [];
        var vals = ['at', 'tl', 'bt'];

        var lvlColor = [dColor[forecast.atRating], dColor[forecast.tlRating], dColor[forecast.btRating]];

        var Slice = function (bt, at, tl) {
            this.bt = bt
            this.at = at
            this.tl = tl
        }

        var getPt = function (ang, val){
            var x = Math.cos(ang) * val + offset;
            var y = Math.sin(ang) * val + offset + yOffset;
            return {x:x, y:y};
        }

        for(var key in forecast.forecast[forecastNum]){
            if(key !== 'title'){
                avyRose[dir[key]] = new Slice(forecast.forecast[forecastNum][key].bt, forecast.forecast[forecastNum][key].at, forecast.forecast[forecastNum][key].tl)
            }
        }    

        paper.clear();
        $('svg').css('-webkit-transform', 'rotate(' + mainHeading + 'deg)');

        paper.text(sWidth/2 - 15, 50, 'N').attr({
            'font-size': 30
        });

        var ind = 0;
        for(var ang = Math.PI / 8; ang < ((Math.PI / 8) + Math.PI * 2) - subAng; ang += subAng){
            for(var i = radius.length - 1; i >= 0; i--){
                var cpt = getPt(ang, radius[i]);
                var lpt = getPt(ang - subAng, radius[i]);
                var pth = paper.path(
                    'M' + offset + ' ' + (offset + yOffset) +
                    'L' + cpt.x + ' ' + cpt.y +
                    'L' + lpt.x + ' ' + lpt.y +
                    'Z'
                ).attr({
                    fill: (avyRose[ind][vals[i]]) ? lvlColor[i] : '#fff',
                    stroke: '#000'//'#bdc3c7'
                });
            }
            ind++;
        }
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    jQueryInit: function(forecast) {

        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        
        var getTitle = function (str) {
            str = str.toLowerCase();
            if(str.indexOf('deep') === 0){
                return 'Deep Slab';
            }else if(str.indexOf('wind') === 0){
                return 'Wind Slab';
            }else if(str.indexOf('wet') === 0){
                return 'Wet Slab';
            }
        }

        /* prevents elastic scrolling */
        $(document).on('touchmove', function(e) {
            e.preventDefault();
        });

        /* setup descrip window */
        $('.descrip-display').css('height', windowHeight);
        $('.descrip-display').css('margin-left', windowWidth);

        $('.descrip-zone').text('Discussion: ' + forecast.zone);
        $('.descrip-text').html(forecast.description);
        /*********************/


        /* setup info window */
        $('.info-heading.at').html('Above Treeline: ' + forecast.atRating);
        $('.info-descrip.at').html(dangerDescrip[forecast.atRating]);
        $('.info-img.at').attr('src', './img/' + dIndex[forecast.atRating] + '.png')

        $('.info-heading.tl').html('Near Treeline: ' + forecast.tlRating);
        $('.info-descrip.tl').html(dangerDescrip[forecast.tlRating]);
        $('.info-img.tl').attr('src', './img/' + dIndex[forecast.tlRating] + '.png')

        $('.info-heading.bt').html('Below Treeline: ' + forecast.btRating);
        $('.info-descrip.bt').html(dangerDescrip[forecast.btRating]);
        $('.info-img.bt').attr('src', './img/' + dIndex[forecast.btRating] + '.png')
        /*********************/


        $('.forecast-date').text('forecasted: ' + forecast.forecastDate);

        $('.zone').html(forecast.zone);
        
        $('.bt-1').html(getTitle(forecast.forecast[0].title));
        $('.bt-2').html(getTitle(forecast.forecast[1].title));

        /* handlers */
        $(document).on('tap', '.zone', function () {
            var el = $('.descrip-display');
            el.animate({'margin-left': 0}, 800, function () {
                $('.descrip-display .content').fadeIn(400);
            }); 
        });

        $(document).on('tap', '.descrip-display', function () {
            var el = $('.descrip-display');
            el.animate({'margin-left': windowWidth}, 800, function () {
                $('.descrip-display .content').fadeOut(400);
            }); 
        });

        $(document).on('tap', '.bt-1', function () {
            var el = $('svg');
            $('.bt-1').addClass('bt-actv');
            $('.bt-2').removeClass('bt-actv');
            el.fadeOut(500, function () {
                el.remove();
                app.drawCompass(forecast, 0);
            });
        });

        $(document).on('tap', '.bt-2', function () {
            var el = $('svg');
            $('.bt-2').addClass('bt-actv');
            $('.bt-1').removeClass('bt-actv');
            el.fadeOut(500, function () {
                el.remove();
                app.drawCompass(forecast, 1);
            });
        });

        $(document).on('tap', 'svg', function () {
            target = $('.info-display');
            target.animate({height: (windowHeight*0.89)}, 800, function(){
                $('.info-display .content').fadeIn(400);
            });    
        });

        $(document).on('tap', '.info-display', function () {
            target = $('.info-display');
            $('.info-display .content').fadeOut(500);
            target.animate({height: 0}, 1000);
        });
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    loadForecast: function (callback) {
        if(app.checkConnection()){
            $.get('http://avy-rose-server.herokuapp.com/', {}, function (forecast) {
                forecast = forecast[0];
                app.saveForecast(forecast);
                callback(forecast);
            });
        }else{
            var forecast = JSON.parse(window.localStorage.getItem('forecast'));
            callback(forecast);                
        }
    },
    saveForecast: function (forecast) {
        window.localStorage.setItem('forecast', JSON.stringify(forecast));
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if(id === 'deviceready'){
            console.log('Received Event: ' + id);
            app.loadForecast(function (forecast) {
                app.drawCompass(forecast, 0);
                app.jQueryInit(forecast);   
            });
            app.compassInit();
        }else{
            console.log('device not loaded');
        }

    }

};
