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

    $('#user_id').text(user_id);
  };
    
  generateUserId();


  //Hide it first
  // TODO: Hide Default in CSS
  $('#restart').hide();
  $('.tic-tac-toe').hide();
  $('#enter-connection-code').hide();

  socket.on('channel_nr', function(data){
    $('#connection-code').text(data.room);
  });

  socket.on('setActualTurnUserId', function(data){

    if(data.user_id == localStorage.getItem('user_id')){
        $('#turn').text('Du bist dran');
    } else {
        $('#turn').text('Dein Gegner ist dran');
    }
  });

  socket.on('connected', function(data){

    console.log('erfolgreich connected');
    // Set Actual Connection ID to session
    localStorage.setItem("processing_room", data.room);
    localStorage.setItem("processing_room_number", data.room_number);

    console.log(localStorage.getItem("user_id"));

    if(localStorage.getItem("user_id") == data.player1) {
        opponent_id = data.player2;
    } else if(localStorage.getItem("user_id") == data.player2) {
        opponent_id = data.player1;
    }

    localStorage.setItem("opponent_id", opponent_id);

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

  socket.on('actual_win', function(data){
    if(localStorage.getItem("user_id") == data.player) {
        text = 'Du hast gewonnen!';
    } else {
        text = 'Dein Gegner hat gewonnen!';
    }

    $('#actual_win').text(text);

    $('#restart').fadeIn();

  });

  socket.on('wins', function(data){
    if(localStorage.getItem("user_id") == data.user_id) {
        $('#you').text(data.count_wins);
    } else {
        // Wie oft hat dein Gegner gewonnen?
        $('#opponent').text(data.count_wins);
    }
  });

  $('#restart').on('click', function(){
      socket.emit('reset_game',
          {
              room_nr : localStorage.getItem('processing_room_number'),
              room_id : localStorage.getItem('processing_room')
          });
 });

  // Deletes all canvas elements
  socket.on('make_reset', function(){
      var draw_items = $('.single-item');

      draw_items.each(function(index){
          var canvasElements = $(this).find('canvas');
          // Draw
          canvasElements.each(function () {
              var context     = this.getContext('2d');
              context.clearRect(0, 0, this.width, this.height);
          });
      });

      $('#restart').hide();
      $('#actual_win').text('');

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
          room_id: localStorage.getItem('processing_room'),
          user_id:localStorage.getItem('user_id'),
          opponent_id: localStorage.getItem('opponent_id'),
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
                  room_id : localStorage.getItem('processing_room'),
                  room_number : localStorage.getItem('processing_room_number'),
                  x : draw_x,
                  y : draw_y,
                  element: chosenElement,
                  user_id : localStorage.getItem('user_id'),
                  opponent_id : localStorage.getItem('opponent_id')
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
