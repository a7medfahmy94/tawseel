// Init firebase
var initFirebase = function() {
  var config = {
    apiKey: 'AIzaSyDn_NMUsa9sVsYm19ApwK2U8juSC1PYLfM',
    authDomain: "tawseel-37034.firebaseapp.com",
    databaseURL: "https://tawseel-37034.firebaseio.com",
    storageBucket: "tawseel-37034.appspot.com",
    messagingSenderId: "534910965048"
  };
  firebase.initializeApp(config);
}
initFirebase();
// End init firebase

var database = firebase.database();
var tripsRef = database.ref('/trips');

// called when user starts a new trip
// pushes a new trip and listens for updates
function newTrip() {
  var key = tripsRef.push().key;
  tripsRef.child(key).update({
    logs: [],
    startAt: new Date(),
    state: 'started'
  })
  window.onRoute = true;
  window.tripId = key;
}

function initMap() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
  }
  // this holds all the logs for the trip, including all points
  window.logs = [];
  navigator.geolocation.getCurrentPosition(function(position){
    var center = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    var map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      scrollwheel: false,
      zoom: 17
    });
    google.maps.event.addListener(map, 'click', function( event ){
      addPoint(event.latLng.lat(), event.latLng.lng(), map)
    });
  });
}

function addPoint(lat, lng, map) {
  if (!window.onRoute) {
    return;
  }
  $("#begin-trip").html('End');
  var log = {
    point: {
      lat: lat,
      lng: lng
    },
    time: (+new Date())
  }
  window.logs.push(log);
  var newLog = tripsRef.child(window.tripId+'/logs').push();
  newLog.set(log);

  window.marker = new google.maps.Marker({position: log.point,map: map,title: window.logs.length.toString()});
}


function end() {
  var tripRef = tripsRef.child(window.tripId);
  tripRef.update({state: 'ended'});
  database.ref('/queue/tasks').push({
    tripId: window.tripId
  })
}

$(function(){
  $("#begin-trip").on('click', function(){
    if ($(this).html() == 'End') {
      $(this).html('Trip ended, refresh for a new trip!');
      end();
    } else {
      $(this).html('Click on map for initial position');
      newTrip();
    }
  })
})
