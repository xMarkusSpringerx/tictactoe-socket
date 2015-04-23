var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


r = require('rethinkdb');
var connection = null;

r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {


    // Can't connect to Server
    if (err) throw err;
    connection = conn;


    r.db('tictactoesocket').tableDrop('rooms').run(connection, function(){

    });

    // Create new table
    r.db('tictactoesocket').tableCreate('rooms').run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });

    r.table("rooms").delete().run(connection);



});

server.listen(3000);

app.use(express.static(__dirname + '/app'));


// Send the client html.
app.get('/', function(req, res) {
     res.sendFile(__dirname + '/index.html')
});


io.on('connection', function (socket) {

  // If User is Host
  socket.on('new_host', function(){

    // Generate RandomChannelNr
    var room_nr = Math.floor(Math.random()*10000000);


    socket.join(room_nr); // put socket in a channel


    r.table("rooms").insert({
        "room_id": String(room_nr)
    }).run(connection, function(err, result) {
        if (err) throw err;
    });

    socket.emit('channel_nr', {nr : room_nr});
  });



    // If User wants to enter a Room
    socket.on('submit_connection_nr', function(data){
        // Get all rooms with posted room_id
        r.table('rooms').filter({"room_id": data.nr}).run(connection, function(err, cursor) {
            if (err) throw err;

            cursor.toArray(function(err, result) {
                if (err) throw err;

                console.log('Anzahl der Räume', result.length);

                // If exactly 1 room found --> perfect
                if (result.length == 1) {
                    socket.join(data.nr); // put user in a channel
                    io.sockets.in(data.nr).emit('connected', {nr : data.nr});
                } else {
                    // No room was found
                    socket.emit('no_connection');
                }
            });
        });
    });

   socket.on('set_input', function(data){
    socket.broadcast.to(data.nr).emit('drawOpponent', {x: data.x, y:data.y});
   });


});