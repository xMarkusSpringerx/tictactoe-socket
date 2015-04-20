$(function() {
  var chosenElement;


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

      if (! chosenElement) {
        $('[data-chosen-element]').each(function () {
            chosenElement = $(this).data('chosen-element');
        });
      }

      canvasElements.each(function () {
        if (chosenElement == 'x') {
          drawX(this);
        } else if (chosenElement == 'circle') {
          drawCircle(this);
        }
      });
    })
  });

});
