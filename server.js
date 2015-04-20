var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


server.listen(3000);

app.use(express.static(__dirname + '/app'));


// Send the client html.
app.get('/', function(req, res) {
     res.sendFile(__dirname + '/index.html')
});


io.on('connection', function (socket) {

  /*socket.on('start', function(){
    io.emit('start_game');
  });
  */

});