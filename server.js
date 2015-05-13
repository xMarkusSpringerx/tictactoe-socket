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
      checkTable(list, "turns");
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

    function getScore(x, y){
        x = parseInt(x);
        y = parseInt(y);
        return Math.pow(2, ((x-1)*3 + (y-1)));
    }

    function checkForWin(score){
        wins = [7, 56, 448, 73, 146, 292, 273, 84];

        for (var i = 0; i < wins.length; i += 1) {
            if ((wins[i] & score) === wins[i]) {
                return true;
            }
        }
        return false;

    }

    // If User is Host
    socket.on('new_host', function(data) {
        // Generate RandomChannelNr
      var room = Math.floor(Math.random()*10000);

        r.table('rooms').insert({
          'number': String(room),
          'host': String(data.user_id),
          'player2': String(''),
          'turn_user_id': String('')

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

            // Set Player2 to actual Room
            r.table("rooms").filter({number: data.room}).update({player2: data.player2, turn_user_id : data.player2}).run(connection, function(err, cursor){
                if (err) throw err;
                console.log('Room geupdated');
            });

            io.sockets.in(row.id).emit('connected', {
              room : row.id,
              room_number : row.number
            });
          });
        });
    });

    socket.on('set_input', function (data) {

        // data (room_number, x, y, element)

        r.table('turns').filter({"room_number": data.room_number, "x" : data.x, "y" : data.y}).count().run(connection, function(err, cursor) {
            // If entry not exists.
            if(cursor == 0){
                // If valid input
                r.table('turns').insert({
                    'room_number': String(data.room_number),
                    'x': String(data.x),
                    'y': String(data.y),
                    'element': String(data.element),
                    'user_id': String(data.user_id)
                }).run(connection, function(err, result) {
                    if (err) throw err;
                });

                socket.broadcast.to(data.room_id).emit('drawOpponent', data);



                r.table('turns').filter({"room_number": room_number, "user_id" : user_id}).run(connection, function(err, cursor) {

                    score = 0;

                    if (err) throw err;
                    cursor.each(function(err, row) {
                        if (err) throw err;

                        /*
                        1 | 2 | 4
                        ---------
                        8 |16 |32
                        ---------
                        64|128|256
                        ---------
                        */
                        score = score + getScore(row.x, row.y);
                    });

                    if (checkForWin(score) == true) {
                        io.sockets.in(data.room_id).emit('wins', {player: user_id});
                    }

                });




            } else {
                console.log('Input schon vorhanden');
            }
        });
    });

    socket.on('ask_for_drawing', function(data){
        user_id = data.user_id;
        room_number = data.room_number;

        r.table('turns').filter({"room_number": room_number, "x" : data.x, "y" : data.y}).count().run(connection, function(err, cursor) {
            // If entry not exists.
            if(cursor == 0){
                r.table('rooms').filter({"number": room_number}).run(connection, function(err, cursor) {
                    cursor.next(function (err, row) {

                        if(row.turn_user_id == user_id){
                            // Aktueller User möchte erneut einen Eintrag machen -> darf nicht sein
                            socket.emit('allow_drawing',{permission:false});
                        } else {
                            // Opponent is drawing
                            r.table("rooms").filter({number: room_number}).update({turn_user_id: user_id}).run(connection, function(err, cursor){
                                if (err) throw err;
                                console.log('Room geupdated');
                            });

                            socket.emit('allow_drawing',{permission:true});

                        }
                    });
                });
            } else {
                console.log('Input schon vorhanden');
            }
        });

    });

});
