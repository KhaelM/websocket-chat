var WebSocketServer = require('websocket').server;
var http = require('http');
var port = 1337;

var server = http.createServer(function (request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(port, function () {
    console.log(`listening on port ${port}`);
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var history = [];
var clients = [];

// On request is triggered each time a client tries to connect to the server
wsServer.on('request', function (request) {
    console.log(`Connection request from: ${request.origin}`);
    var connection = request.accept(null, request.origin);

    var index = clients.push(connection) - 1;
    var username = null;

    if (history.length > 0) {
        connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
    }

    connection.on('message', function (message) {
        if (username === null) {
            username = message.utf8Data;
            connection.send(JSON.stringify({ type: 'init-info', data: username }));
        } else {
            // Sending object can only be done via JSON.stringify
            var obj = {
                time: (new Date()).getTime(),
                author: username,
                message: message.utf8Data
            };
            history.push(obj);
            history = history.slice(-5);

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(JSON.stringify({ type: 'message', data: obj }));
            }
        }
    });

    connection.on('close', function (connection) {
        clients.splice(index, 1);
        if (username !== null) {
            console.log(`${username}(${connection.remoteAddress}) disconnected.`);
        }
    });
});