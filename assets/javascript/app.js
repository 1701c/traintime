var config = {
  apiKey: "AIzaSyA5a7sDtMO87f8QC22xOJ8qWAdGPLQpo2s",
  authDomain: "test-82bf9.firebaseapp.com",
  databaseURL: "https://test-82bf9.firebaseio.com",
  projectId: "test-82bf9",
  storageBucket: "test-82bf9.appspot.com",
  messagingSenderId: "683048751515"
};
firebase.initializeApp(config);

var database = firebase.database();

var app = {
  resetTrains: function () {
    var trains = [
      { name: 'Trenton Express', destination: 'Trenton', frequency: '25', startTime: '20:30' },
      { name: 'Oregon Trail', destination: 'Salem, Oregon', frequency: '43', startTime: '05:30' },
      { name: 'Midnight Carriage', destination: 'Philadelphia', frequency: '16', startTime: '04:30' },
      { name: 'Sing Sing Caravan', destination: 'Atlanta', frequency: '41', startTime: '12:30' },
      { name: 'Boston Bus', destination: 'Boston', frequency: '6500', startTime: '01:30' },
      { name: 'California Caravan', destination: 'San Francisco', frequency: '62', startTime: '03:30' },
      { name: "Analben's Train", destination: 'Florida', frequency: '5', startTime: '05:00' }
    ];
    $('#trainsTable').empty();
    database.ref().set('');
    for (i=0; i<trains.length; i++) {
      database.ref().push({
        name: trains[i].name,
        destination: trains[i].destination,
        startTime: trains[i].startTime,
        frequency: trains[i].frequency,
      })
    }
  },

  refreshTrains: function (timed) {
    if (timed === true) var timer = setInterval(ticker, 30000);
    function ticker() {
      $('#trainsTable').empty();
      database.ref().orderByChild("name").on("child_added", function (snapshot) {
        app.appendTable(snapshot);
      }, function (errorObject) {  
        console.log('errors: ' + errorObject);
      })
      $('#updateTime').html(' (Updated :' + moment().format("HH:mm") + ')');
      console.log('trains refreshed ' + moment().format("HH:mm:ss"));
    }
    ticker();
  },

  storeTrain: function () {
    database.ref().push({
      name: $('#nameInput').val().trim(),
      destination: $('#destinationInput').val().trim(),
      startTime: $('#startTimeInput').val().trim(),
      frequency: $('#frequencyInput').val().trim(),
    })
   },
  
  appendTable: function (snapshot) {
    var nextArrival = moment(snapshot.val().startTime, 'HH:mm A');
    var employeeRow = $('<tr id="row' + snapshot.key + '" dataID="' + snapshot.val().startTime + '">');
    var nextArrivalTD = $('<td>')
        
    if (parseInt(moment().unix()) > parseInt(moment(nextArrival).unix())) {
      while (parseInt(moment().unix()) > parseInt(moment(nextArrival, 'HH:mm A').unix())) {
        nextArrival = moment(nextArrival).add(snapshot.val().frequency, 'm');
      }
      nextArrivalTD.append(moment(nextArrival, 'HH:mm A').format("HH:mm"))
      if (nextArrival.diff(moment(), 'd') > 0) {
        nextArrivalTD.append(' + ' + (nextArrival.diff(moment(), 'd') + ' days'));
      }
    } else {
      nextArrivalTD.append(moment(nextArrival, 'HH:mm A').format("HH:mm"))
      .append(' (first train)')
      }
    if (parseInt(nextArrival.diff(moment(), 'm')) < 5) {
      employeeRow.addClass('blinking');
    }    
    employeeRow.append('<button class="button removeBtn" id="start' + snapshot.key + '" dataId="' + snapshot.key + '">Remove</button>')
      .append('<button class="button updateBtn" dataId=' + snapshot.key + '>Update</button>')
      .append('<td id="name' + snapshot.key + '">' + snapshot.val().name + '</td>')
      .append('<td id="destination' + snapshot.key + '">' + snapshot.val().destination + '</td>')
      .append('<td id="frequency' + snapshot.key + '">' + snapshot.val().frequency + '</td>')
      .append(nextArrivalTD)
      .append('<td>' + nextArrival.diff(moment(), 'm') + '</td>')
    $('#trainsTable').append(employeeRow)
  }
}

$(document).on('click', '.removeBtn', function () {
  $("#row" + $(this).attr('dataID')).remove();
  database.ref().child($(this).attr('dataID')).remove();
});

$(document).on('click', '.updateBtn', function () {
  $('#nameInput').val($('#name' + $(this).attr('dataID')).text())
  $('#destinationInput').val($('#destination' + $(this).attr('dataID')).text())
  $('#startTimeInput').val($('#row' + $(this).attr('dataID')).attr('dataID'))
  $('#frequencyInput').val($('#frequency' + $(this).attr('dataID')).text())
  $("#row" + $(this).attr('dataID')).remove();
  database.ref().child($(this).attr('dataID')).remove();
});

$(document).ready(function () {
  $('#submitButton').on("click", function () {
    app.storeTrain();
    app.refreshTrains();
    $('#nameInput').val('')
    $('#destinationInput').val('')
    $('#startTimeInput').val('')
    $('#frequencyInput').val('')
  });
  $('#resetButton').on("click", function () {
    app.resetTrains();
    app.refreshTrains();
    });
  app.refreshTrains(true);
});

