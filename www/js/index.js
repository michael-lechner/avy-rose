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

// var currForecast = [];
/*************/
var app = {
    compassInit: function () {
        var pollFreq = { frequency: 100 };
        
        function onError() {
            $('#heading').html('no compass');
        };

        function onSuccess(heading) {
            var headingDisplay = $('#heading');
            var el = $('svg');

            headingDisplay.html('Heading: ' + heading);
            el.css('-webkit-transform', 'rotate(' + heading + 'deg)');
        };

        var watchID = navigator.compass.watchHeading(onSuccess, onError, pollFreq);        
    },
    drawCompass: function (forecast) {
        forecast = forecast[0];

        var sWidth = $(window).width();
        var sHeight = $(window).height();
        var containerDim = sWidth*0.9
        var paper = Raphael(sWidth*0.05, sHeight*0.3, containerDim, containerDim + 100);
        var offset = containerDim/2;
        var yOffset = sHeight*0.1
        var subAng = Math.PI / 4;
        var radius = [70, 110, 140];
        var vals = ['at', 'tl', 'bt'];
        var pollFreq = { frequency: 100 };
        var avyRose = [];

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

        // var a = []
        for(var key in forecast.forecast[0]){
            if(key !== 'title'){
                avyRose[dir[key]] = new Slice(forecast.forecast[0][key].bt, forecast.forecast[0][key].at, forecast.forecast[0][key].tl)
            }
        }    

        console.log(forecast)

        paper.clear();

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
                    fill: (avyRose[ind][vals[i]]) ? dColor.moderate : '#fff',
                    stroke: '#bdc3c7'
                });
            }
            ind++;
        }
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    loadForecast: function (callback) {
        $.get('http://avy-rose-server.herokuapp.com/', {}, function (forecast) {
            callback(forecast);
        });
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
            app.loadForecast(app.drawCompass);
            app.compassInit();
        }else{
            console.log('device not loaded');
        }

    }

};
