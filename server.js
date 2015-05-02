var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    connection,
    r = require('rethinkdb');

r.connect({ host: 'localhost', port: 28015}, function(err, conn) {
  // Can't connect to Server
  if (err) throw err;

  connection = conn;

  // Create Datebase for first init
  r.dbCreate('tictactoe').run(connection, function(err) {});

  // Map db to connection
  connection.use('tictactoe');

  r.tableList().run(connection, function (err, list) {
      if (err) throw err;
      checkTable(list, "user");
      checkTable(list, "rooms");
  });

  // Check if table exists
  function checkTable(list, tablename){
      if (list.indexOf(tablename) == -1) {
          r.tableCreate(tablename).run(conn, function(err, result) {
              if (err) throw err;
              console.log('created table ', tablename);
          });
      } else {
          // For testing:
          // Delete all Entries on startup
          r.table(tablename).delete().run(conn, function(){
              console.log('deleted all entries in ', tablename);
          });
      }
  }
});

server.listen(3000);

app.use(express.static(__dirname + '/app'));

// Send the client html.
app.get('/', function(req, res) {
     res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    // If User is Host
    socket.on('new_host', function(data) {
        // Generate RandomChannelNr
      var room = Math.floor(Math.random()*10000);

        r.table('rooms').insert({
          'number': String(room),
          'host': String(data.user_id),
          'player2': String('')
        }).run(connection, function(err, result) {
          if (err) throw err;

          for(var i in result.generated_keys) {
            // put socket in a channel
            socket.join(result.generated_keys[i]);
            console.log("user connected to room: " + result.generated_keys[i]);
            break;
          }
        });

      socket.emit('channel_nr', {room : room});
    });

    // If User wants to enter a Room
    socket.on('submit_connection_nr', function(data) {
        // Get all rooms with posted room_id
        r.table('rooms').filter({"number": data.room}).run(connection, function(err, cursor) {
          if (err) throw err;

          cursor.next(function (err, row) {
            if (err) {
              socket.emit('no_connection');
              throw err
            }

            console.log("user connected to room: " + row.id);
            // If exactly 1 room found --> perfect
            socket.join(row.id); // put user in a channel

            r.table("rooms").filter({number: data.room}).update({player2: data.player2}).run(connection, function(err, cursor){
                if (err) throw err;
                console.log('Room geupdated');
            });


            io.sockets.in(row.id).emit('connected', {
              room : row.id
            });
          });
        });
    });

    socket.on('set_input', function (data) {
        socket.broadcast.to(data.room).emit('drawOpponent', data);
    });
});
