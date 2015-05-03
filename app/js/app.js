$(function() {

  // localStorage.getItem('processing_room')
  // localStorage.getItem('user_id')
  var host = window.location.hostname,
    socket = io('http://' + host + ':3000'),
    chosenElement,
    act_click_obj,

    // Actual Draw Position
    draw_x,
    draw_y,

    // Circle or X
    opponentElement;

  // Set UserId to Local Storage
  generateUserId = function(){
    user_id = Math.floor(Math.random()*10000);
    localStorage.setItem('user_id', user_id);
  };
    
  generateUserId();

  //Hide it first
  // TODO: Hide Default in CSS
  $('.tic-tac-toe').hide();
  $('#enter-connection-code').hide();

  socket.on('channel_nr', function(data){
    $('#connection-code').text(data.room);
  });

  socket.on('connected', function(data){
    console.log('erfolgreich connected');
    // Set Actual Connection ID to session
    localStorage.setItem("processing_room", data.room);
    localStorage.setItem("processing_room_number", data.room_number);

    $('.tic-tac-toe').fadeIn();
    $('#start-display').fadeOut();
  });

  socket.on('no_connection', function(){
    alert('keine Verbindung aufgebaut');
  });

  $('#host').on('click', function(){
    // You are the Host of the Game
    $('#enter').hide();

    chosenElement = "circle";
    opponentElement = "x";
    socket.emit('new_host', {user_id : localStorage.getItem('user_id')});

  });

  socket.on('drawOpponent', function(data){
    drawOpponent(data.x, data.y, data.element);
  });

  $('#enter').on('click', function(){
    $(this).hide();
    $('#host').hide();
    $('#enter-connection-code').fadeIn();
  });

  $('.btn-host-code').on('click', function(){
    var connection_nr = $('#connection-host-code').val();
    console.log('w', connection_nr, 'w');
    socket.emit('submit_connection_nr', {room : connection_nr, player2 : localStorage.getItem('user_id')});

    chosenElement = "x";
    opponentElement = "circle";
  });

  drawOpponent = function (x, y, element) {
    var draw_item = $('.single-item[data-x="'+x+'"][data-y="'+y+'"]'),
        canvasElements = $(draw_item).find('canvas');

    // Draw
    canvasElements.each(function () {
        drawElement(this, element);
    });
  };

  drawElement = function (canvasElement, elementName, options) {
    if (elementName == 'x') {
      drawX(canvasElement, options);
    } else if (elementName == 'circle') {
      drawCircle(canvasElement, options);
    }
  };

  drawCircle = function (canvasElement, options) {
    // TODO: Add defaults for data attribs
    var context     = canvasElement.getContext('2d'),
        centerX     = canvasElement.width / 2,
        centerY     = canvasElement.height / 2,
        color       = $(canvasElement).data('color'),
        borderColor = $(canvasElement).data('border-color'),
        lineWidth   = 2,
        radius      = centerY / 1.5;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = lineWidth;
    context.strokeStyle = borderColor;
    context.stroke();
  };

  drawX = function (canvasElement, options) {
      var context = canvasElement.getContext('2d'),
          width   = canvasElement.width,
          height  = canvasElement.height,
          padding = height / 7;

      // first stroke
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(width - padding, height - padding);
      context.lineTo(padding, padding);
      context.stroke();

      // second stroke
      context.beginPath();
      context.moveTo(width - padding, padding);
      context.lineTo(padding, height - padding);
      context.stroke();
  };

  $(document).ready(function () {
    $('.single-item').on('click', function () {
      act_click_obj = $(this);

      draw_x = act_click_obj.attr('data-x');
      draw_y = act_click_obj.attr('data-y');

      socket.emit('ask_for_drawing', {
          room_number: localStorage.getItem('processing_room_number'),
          user_id:localStorage.getItem('user_id'),
          x : act_click_obj.attr('data-x'),
          y : act_click_obj.attr('data-y')
      });

    });

    socket.on('allow_drawing', function(data){

      if (data.permission == true) {

          var canvasElements = act_click_obj.find('canvas');


          // Draw
          canvasElements.each(function () {
              drawElement(this, chosenElement);

              socket.emit('set_input', {
                  room : localStorage.getItem('processing_room'),
                  room_number : localStorage.getItem('processing_room_number'),
                  x : draw_x,
                  y : draw_y,
                  element: chosenElement
              });
          });
      } else {
          console.log('Der Gegner ist erst an der Reihe');
      }
    });
  });

  check_storage_supp = function () {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      alert('Bitte verwenden Sie einen neueren Browser');
      return false;
    }
  };

  check_storage_supp();
});
