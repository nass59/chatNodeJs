var express = require('express'),
        app = express(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server);

var chat = require('./chat');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', chat.onConnection);

server.listen(3000);
console.log('App started at port 3000');