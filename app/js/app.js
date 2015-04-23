


$(function() {

  var socket = io('http://localhost:3000');
  var chosenElement;

  var actual_host_nr;

  //Hide it first
  $('.tic-tac-toe').hide();
  $('.game-mode').hide();
  $('#enter-connection-code').hide();


  socket.on('channel_nr', function(data){
    $('#connection-code').text(data.nr);
  });

  socket.on('connected', function(data){
    console.log('erfolgreich connected');

    actual_host_nr = data.nr;

    // Set Actual Connection ID to session
    localStorage.setItem("actual_host_nr", actual_host_nr);

    $('.tic-tac-toe').fadeIn();
    $('.game-mode').fadeOut();
  });




  socket.on('no_connection', function(){
    alert('keine Verbindung aufgebaut');
  });

  $('#start-game').on('click', function(){
    $(this).hide();
    $('.game-mode').fadeIn();
  });

  $('#host').on('click', function(){
    // You are the Host of the Game
    $('#enter').hide();
    // Now generate Code

    chosenElement = "circle";
      
    socket.emit('new_host');
  });

  $('#enter').on('click', function(){
    // You get the Code and enter the game
    $('#host').hide();
    $('#enter-connection-code').fadeIn();
  });

  $('#btn-host-code').on('click', function(){
    var connection_nr = $('#connection-host-code').val();
    console.log('w', connection_nr, 'w');
    socket.emit('submit_connection_nr', {nr : connection_nr});

    chosenElement = "x";
  });



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

    $('[data-spy="circle"]').each(function () {
      drawCircle(this);
    });

    $('[data-spy="x"]').each(function () {
      drawX(this);
    });

    $('.single-item').on('click', function () {
      var canvasElements = $(this).find('canvas');

      // Check if clicked Element is already chosen
      if (! chosenElement) {
        $('[data-chosen-element]').each(function () {
            chosenElement = $(this).data('chosen-element');
        });
      }

      // Draw
      canvasElements.each(function () {
        // Check if player draws with X or with an Circle
        if (chosenElement == 'x') {
          drawX(this);
          socket.emit('set_input');
        } else if (chosenElement == 'circle') {
          drawCircle(this);
        }
      });

    })
  });

  check_storage_supp();
  function check_storage_supp() {
      try {
          return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
          alert('Bitte verwenden Sie einen neueren Browser');
          return false;
      }
  }
});
