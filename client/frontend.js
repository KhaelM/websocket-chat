window.WebSocket = window.WebSocket || window.MozWebSocket;

var content = $('#content');
var chatStatus = $('#chatStatus');
var username = $('#username');
var sendButton = $('#sendButton');
var connectButton = $('#connectButton');
var message = $('#message');

message.attr('disabled', 'disabled');
sendButton.attr('disabled', 'disabled');

var connection = null;

connectButton.click(function () {
    connection = new WebSocket(`ws://192.168.88.15:1337`);
    
    connection.onopen = function () {
        message.removeAttr('disabled');
        sendButton.removeAttr('disabled');
        chatStatus.text('Choose a username');
        connectButton.hide();
    };
    
    connection.onerror = function () {
        console.log("onerror triggered");
    }
    
    // Triggered After receiving message from server
    connection.onmessage = function(messageEvent) {
        try {
            var json = JSON.parse(messageEvent.data);
            console.log(json);
        } catch (error) {
            console.log('This doesn\'t look like a valid JSON: ', messageEvent.data);
            return;
        }

        if(json.type === 'init-info') {
            chatStatus.text("Logged as ");
            username.text(json.data);
        } else if(json.type === 'history') {
            for(var i = 0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].message, new Date(json.data[i].time));
            }
        } else if(json.type === 'message') {
            addMessage(json.data.author, json.data.message, new Date(json.data.time));
        } else {
            console.log("WTF", json);
        }
    }
});

sendButton.click(function() {
    connection.send(message.val());
});

function addMessage(author, message, date) {
    content.prepend(`<p>${author}(${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}): ${message}</p>`);
}