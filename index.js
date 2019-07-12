const CONTAINER = $(".container");

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
  add zero in front of numbers < 10
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
  console.log("[display]");
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
Add x option elements to given select
**/
function addOption(element, x) {
  for (var i = 1; i <= x; i++) {
    element.append(`<option value='${i}'> ${i} </option>`);
  }
}

$(document).ready(() => {
  //start the clock
  setInterval(display, 1000);

  /**
    SWITCH BETWEEN ANALOG AND DIGITAL CLOCK
  **/
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

  /**
      CHANGE DIGITAL CLOCK FORMAT
  **/
    $('#format').on('click',evt=>{
      isampm = isampm? false:true;
      console.log('change format',isampm);
      $('.modal #ampm').toggle();
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
  //add options in alarm
  addOption($("#hpick"), isampm ? 12 : 23);
  addOption($("#mpick"), 60);
  addOption($("#spick"), 60);


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

    console.log(isampm, ampm);
    console.log("SET ALARM FOR ", alarmTime, typeof alarmTime);


    // remove the dialog box from screen
    $(".modal").css("display", "none");

    // check if we have reached the alarm time
    setInterval(handle => {
      let { hours, mins, secs } = getTime();
      var session = "";
      if(isampm) {
        session = hours < 12 ? "AM" : "PM";
        hours = hours % 12 || 12;
       }
      console.log("[comparing]", hours, mins, secs, session);
      console.log(h, m, s, ampm);
      if (hours == h && mins == m && secs == s) {
        clearInterval(handle);
        $("audio")[0].play();
      }
    }, 1000);

    console.log("audio element", $("audio"));
  });
});

/**
ANALOG CLOCK
**/

function drawClock(hours, mins, secs) {
  //ctx.clearRect(0,0,canvas.width,canvas.height);
  var canvas = document.createElement("canvas");

  // add style to canvas elements
  $(canvas).css({
    'margin-left': 'auto',
    'margin-right': 'auto',
    'width': '50%',
    'height': '80%'
  })

  var ctx = canvas.getContext("2d");
  var radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.9;

  // draw the CIRCLE
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.stroke();

  // draw two circle at center
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.12, 0, 2 * Math.PI);
  ctx.fillStyle = '#ccc';
  ctx.fill()

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill()

  // draw numbers of the clock
  drawNumbers(ctx,radius);

  // draw hands of the clock
  hours = hours % 12;
  hours =
    (hours * Math.PI) / 6 +
    (mins * Math.PI) / (6 * 60) +
    (secs * Math.PI) / (360 * 60);


  ctx.strokeStyle = '#ccf';
  drawHand(ctx, hours, radius * 0.5, radius * 0.07);
  //minute
  mins = (mins * Math.PI) / 30 + (secs * Math.PI) / (30 * 60);
  drawHand(ctx, mins, radius * 0.8, radius * 0.07);
  // second
  secs = (secs * Math.PI) / 30;
  drawHand(ctx, secs, radius * 0.9, radius * 0.02);

  //mount the canvas on DOM
  CONTAINER.html(canvas);
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
