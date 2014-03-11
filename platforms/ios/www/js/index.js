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
var app = {
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
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        function onSuccess(heading) {
            var headingDisplay = $('#heading');
            var el = $('svg');

            headingDisplay.html('Heading: ' + heading);
            el.css('-webkit-transform', 'rotate(' + heading + 'deg)');
        };

        function onError() {
            $('#heading').html('no compass');
        };

        var options = { frequency: 100 };

        /* if enabled rose won't load in xcode */
        var watchID = navigator.compass.watchHeading(onSuccess, onError, options);

        var avyRose = [
            {
                bt: true,
                at: true,
                tl: true
            },
            {
                bt: true,
                at: false,
                tl: false
            },
            {
                bt: false,
                at: true,
                tl: false
            },
            {
                bt: false,
                at: false,
                tl: true
            },
            {
                bt: false,
                at: false,
                tl: false
            },
            {
                bt: false,
                at: false,
                tl: false
            },
            {
                bt: true,
                at: false,
                tl: false
            },
            {
                bt: false,
                at: false,
                tl: false
            }
        ];

        var sWidth = $(window).width();
        var sHeight = $(window).height();
        var canvas = $('#compassCanvas');
        var containerDim = sWidth*0.9

        var paper = Raphael(sWidth*0.05, sHeight*0.3, containerDim, containerDim + 100);

        var offset = containerDim/2;
        var yOffset = sHeight*0.1
        var subAng = Math.PI / 4;
        var radius = [70, 110, 140];
        var vals = ['at', 'tl', 'bt'];

        renderCircle();

        function renderCircle(){
            paper.clear();

            paper.text(sWidth/2 - 15, 50, 'N').attr({
                'font-size': 30
            });


            var ind = 0;
            for(var ang = Math.PI / 8; ang < (Math.PI / 8) + Math.PI * 2; ang += subAng){
                for(var i = radius.length - 1; i >= 0; i--){
                    var cpt = getPt(ang, radius[i]);
                    var lpt = getPt(ang - subAng, radius[i]);
                    var pth = paper.path(
                        'M' + offset + ' ' + (offset + yOffset) +
                        'L' + cpt.x + ' ' + cpt.y +
                        'L' + lpt.x + ' ' + lpt.y +
                        'Z'
                    ).attr({
                        fill: (avyRose[ind][vals[i]]) ? 'red' : '#fff'
                    });
                    console.log(avyRose[ind][vals[i]])
                }
                ind++;
            }
        }

        function getPt(ang, val){
            var x = Math.cos(ang) * val + offset;
            var y = Math.sin(ang) * val + offset + yOffset;
            return {x:x, y:y};
        }
    }
};
