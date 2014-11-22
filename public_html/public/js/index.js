$(function() {
    var socket = io.connect('http://localhost:3000');

    var pseudo = prompt('Quel est votre pseudo ?') || 'Anonyme';

    socket.emit('newUser', pseudo);

    socket.emit('usersConnected');

    document.title = pseudo + ' - ' + document.title;

    // display message from server
    socket.on('message', function(data) {
        insertMessage(data.pseudo, data.message);
        scrollToLastMessage ();
    });

    // display all messages from server
    socket.on('messages', function(data) {
        $('#zone_chat').empty();
        for (var i = 0; i < data.length; i++) {
            insertMessage(data[i].pseudo, data[i].message);
        };
        scrollToLastMessage ();
    });

    // informs that someone is typing something
    socket.on('typing', function(data) {
        userIsTyping(data.pseudo);
    });

    // clear zoneTyping when nobody is writing
    socket.on('stoptyping', function(data) {
        clearZoneTyping();
    });

    // display new user
    socket.on('newUser', function(pseudo) {
        $('#zone_chat').append('<div><p><small><i>' + pseudo + ' a rejoint la conversation</i></small></p></div>');
        socket.emit('usersConnected');
    });

    // display all users connected
    socket.on('usersConnected', function(usersConnected) {
        displayAllUsersConnected(usersConnected);
    });

    // send message to the server
    $('#send_message').click(function() {
        sendMessage();
    });

    // send message to the server when user press ENTER
    $( "#message" ).keypress(function( event ) {
      if ( event.which == 13 ) {
        sendMessage();
      }
    });

    // send socket to server to tell we are typing or not
    $( "#message" ).keyup(function() {
        var message = $(this).val();
        if (message.length > 0) {
            socket.emit('typing');
        } else {
            socket.emit('stoptyping');
        }
    });

    // send socket to server to tell we stop typing
    $( "#message" ).focusout(function() {
        socket.emit('stoptyping');
    });

    function displayAllUsersConnected(usersConnected) {
        $('#usersConnected').empty();
        for (var i = 0; i < usersConnected.length; i++) {
            if(usersConnected[i].pseudo == pseudo) {
                $('#usersConnected').append('<li>' + usersConnected[i].pseudo + '(moi)</li>');
            } else {
                $('#usersConnected').append('<li>' + usersConnected[i].pseudo + '</li>');
            }
            
        };
        $('.nbUsers span').html(usersConnected.length);
    }

    // send message
    function sendMessage() {
        var message = $('#message').val();

        socket.emit('message', message);
        insertMessage(pseudo, message);
        scrollToLastMessage ();
        $('#message').val('').focus();
    }

    // display message
    function insertMessage(pseudo, message) {
        $('#zone_chat').append('<div><p><strong>' + pseudo + '</strong></p><p>' + message + '</p></div>');
    };

    // scroll to last message
    function scrollToLastMessage () {
        $("#zone_chat").animate({
            scrollTop: $('#zone_chat')[0].scrollHeight - $('#zone_chat')[0].clientHeight
        }, 500);
    }

    // display message that someone is typing
    function userIsTyping (pseudo) {
        $('#zoneTyping').html('<i>' + pseudo + ' est en train d\'écrire...');
    }

    // clear zoneTyping
    function clearZoneTyping () {
        $('#zoneTyping').empty();
    }
});