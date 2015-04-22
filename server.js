var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


r = require('rethinkdb')
r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {


    // Reset DB on every restart of Node (only for testing)
    r.db('tictactoesocket').tableDrop('user').run(conn, function(err) {
        //console.log(err);
    });

    // Create DB
    r.dbCreate('tictactoesocket').run(conn, function(){

    });

    // Can't connect to Server
    if(err) throw err;

    // Create new table
    r.db('tictactoesocket').tableCreate('user').run(conn, function(err, res) {

        //Can't connect to DB
        if(err) throw err;
        console.log(res);
    });

});



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