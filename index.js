const CONTAINER = $(".container");
const LIGHT_GREY = "#D7DBDC";
const DARK_GREY = "#A3A6A7";
const AUDIO = $('audio')[0];

// Keep track whether it is 12/24 hour clock
var isampm = true;

/**
  return true if the current clock is analog
**/
function isAnalog() {
  //console.log(CONTAINER);
  return CONTAINER[0].classList.contains("analog");
}

/**
  return digital time
**/
function getTime() {
  var today = new Date();
  return {
    hours: today.getHours(),
    mins: today.getMinutes(),
    secs: today.getSeconds()
  };
}

/**
  prepend 0 to numbers < 10
**/
function appendZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}
/**
the display the time
**/
function display() {
  //console.log("[display]");
  var { hours, mins, secs } = getTime();
  if (isAnalog()) {
    // do not show format button for analog clock
    $('#format').css('display','none')
    drawClock(hours, mins, secs);
  } else {
    // display format button for digital clock
    $('#format').css('display','block')
    if (isampm) {
      $('#format').text('24 hour');
      var session = hours < 12 ? "AM" : "PM";
      hours = hours % 12 || 12;
      //console.log(hours,x);
    }else{
      $('#format').text('12 hour');
    }
    hours = appendZero(hours);
    mins = appendZero(mins);
    secs = appendZero(secs);
    var currentTime = `${hours}:${mins}:${secs} ${isampm ? session : ""}`;
    CONTAINER.text(currentTime);
  }
}

/**
      Modal dialog box
      populate options with values as per format
**/
function populateModal(){
  //add options in alarm
  addOption($("#hpick").empty(), isampm ? 12 : 23);
  addOption($("#mpick").empty(), 60);
  addOption($("#spick").empty(), 60);
}


/**
Add x option elements to given select
**/
function addOption(element, x) {
  for (var i = 0; i <= x; i++) {
    element.append(`<option value='${i}'> ${i} </option>`);
  }
}


var handle;

$(document).ready(() => {
  //start the clock
  setInterval(display, 1000);

  //populate the alarm dialog box
  populateModal();

  //switch between analog and digital clock
  $("#switch").on("click", evt => {
    //check if it is analog or digital
    if (isAnalog()) {
      // display digital Clock
      CONTAINER.removeClass("analog").addClass("digital");
      console.log("display digital clock");
    } else {
      //display analog clock
      console.log("display analog clock");
      CONTAINER.removeClass("digital").addClass("analog");
    }
  });

    // change the time format in digital clock
    $('#format').on('click',evt=>{
      isampm = isampm? false:true;
      console.log('change format',isampm);
      // toggle the AM/PM field as per format
      $('.modal #ampm').toggle();

      //populate the select fields when time format changes
      populateModal();
    })


  /**
    ALARM
  **/

  // add AM/PM option
  if (isampm) {
    $("#set_alarm").before(`<select name="ampm" id="ampm">
    <option value="AM">AM</option>
    <option value="PM">PM</option>
    </select>`);
  }

  $("#alarm").on("click", evt => {
    // display the dialog box
    $(".modal").css("display", "block");
  });

  $(".close").on("click", evt => {
    $(".modal").css("display", "none");
  });

  $("#set_alarm").on("click", evt => {
    let h = $("#hpick")
      .find(":selected")
      .text();
    let m = $("#mpick")
      .find(":selected")
      .text();
    let s = $("#spick")
      .find(":selected")
      .text();
    let ampm = $("#ampm")
      .find(":selected")
      .text();
    var alarmTime = `${h}:${m}:${s} ${ampm}`;

    //console.log(isampm, ampm);
    //console.log("SET ALARM FOR ", alarmTime, typeof alarmTime);


    // remove the dialog box from screen
    $(".modal").css("display", "none");

    AUDIO.loop = true;
    // check if we have reached the alarm time
    handle = setInterval(playAlarm, 1000,h,m,s,ampm);

  });

});


$(document).on("click", "#dismiss_alarm", function() {
    console.log('Dismiss alarm');
    clearInterval(handle);
    AUDIO.pause();
    $(this).remove();
});



function playAlarm(h,m,s,ampm){
    let { hours, mins, secs } = getTime();
    var session = "";
    if(isampm) {
      session = hours < 12 ? "AM" : "PM";
      hours = hours % 12 || 12;
     }
    //console.log("[comparing]", hours, mins, secs, session);
    //console.log(h, m, s, ampm);
    if (hours == h && mins == m && secs == s && (isampm? (session == ampm): true) ) {
      AUDIO.play();
      $('.button-container').append(`<button type="button" id="dismiss_alarm">Dismiss</button>`);
    }
}
/**
ANALOG CLOCK
**/

function drawClock(hours, mins, secs) {
  //ctx.clearRect(0,0,canvas.width,canvas.height);
  var canvas = document.createElement("canvas");

  // add style to canvas elements
  $(canvas).css({
    'margin-left': '38%',
    'margin-right': 'auto',
    'width': '50%',
    'height': '80%'
  })

  var ctx =canvas.getContext("2d");
  var radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.9;

  drawCircle(ctx,radius);

  // draw numbers of the clock
  drawNumbers(ctx,radius);

  // draw hands of the clock
  hours = hours % 12;
  hours =
    (hours * Math.PI) / 6 +
    (mins * Math.PI) / (6 * 60) +
    (secs * Math.PI) / (360 * 60);


  ctx.strokeStyle = DARK_GREY;
  drawHand(ctx, hours, radius * 0.5, radius * 0.03);
  //minute
  mins = (mins * Math.PI) / 30 + (secs * Math.PI) / (30 * 60);
  drawHand(ctx, mins, radius * 0.7, radius * 0.03);
  // second
  secs = (secs * Math.PI) / 30;
  drawHand(ctx, secs, radius * 0.9, radius * 0.01);

  //mount the canvas on DOM
  CONTAINER.html(canvas);
}


/**
    draw circle
**/
function drawCircle(ctx,radius){

  ctx.save();

  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = DARK_GREY;

  // draw main circle of light grey color with dark grey shadow
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = LIGHT_GREY;
  ctx.fill();

  // to remove the shadow
  ctx.restore();
}

function drawNumbers(ctx, radius) {
  var ang;
  var num;
  ctx.font = radius * 0.15 + "px arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000";
  for(num = 1; num < 13; num++){
    ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}
