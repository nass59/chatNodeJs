var ent = require('ent');

var Users = {
    usersConnected: [],
    push: function (newUser) {
        if (typeof newUser === 'object' && newUser.pseudo && newUser.id) {
            this.usersConnected.push(newUser);
        }
    },
    getPseudo: function (id) {
        var user = null;
        this.usersConnected.forEach(function (userConnected) {
            if (userConnected.id === id) {
                user = userConnected.pseudo;
            }
        });
        return user;
    },
    getUsersConnected: function () {
        return this.usersConnected;
    },
    remove: function (socketId) {
        var index = 0;
        for (var i = 0; i < this.usersConnected.length; i++) {
            if (this.usersConnected[i].id === socketId) {
                index = i;
            } else {
                index++;
            }
        }
        this.usersConnected.splice(index, 1);
    }
};

var Messages = {
    messages: [],
    push: function (message) {
        if (message !== "") {
            this.messages.push(message);
        }
    },
    getMessages: function () {
        return this.messages;
    }
};

exports.onConnection = function (socket) {
    socket.on('newUser', function (pseudo) {
        pseudo = ent.encode(pseudo);
        Users.push({pseudo: pseudo, id: socket.id});
        socket.emit('messages', Messages.getMessages());
        socket.emit('usersConnected', Users.getUsersConnected());
        socket.broadcast.emit('newUser', pseudo);
        console.log("new user connected");
    });

    socket.on('message', function (message) {
        var pseudo = Users.getPseudo(socket.id);
        message = ent.encode(message);
        Messages.push({pseudo: pseudo, message: message});
        socket.broadcast.emit('message', {pseudo: pseudo, message: message});
    });

    socket.on('typing', function () {
        var pseudo = Users.getPseudo(socket.id);
        socket.broadcast.emit('typing', {pseudo: pseudo});
    });

    socket.on('stoptyping', function () {
        socket.broadcast.emit('stoptyping');
    });

    socket.on('usersConnected', function () {
        socket.emit('usersConnected', Users.getUsersConnected());
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        Users.remove(socket.id);
        socket.broadcast.emit('usersConnected', Users.getUsersConnected());
    });
};