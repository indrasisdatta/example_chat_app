/* On page load, prompt user to enter their username. Don't show chat box unless username is entered */

$(".chat-body").hide();

var username = null;
var socket_id = null;

swal({
  title: "Enter your username",
  type: "input",
  showCancelButton: true,
  closeOnConfirm: true,
  inputPlaceholder: "Enter your username"
}, function (inputValue) {
    if (inputValue === false) {
        return false;
    }
    if (inputValue === "") {
        swal.showInputError("Please enter your username");
        return false;
    }
    $(".chat-body").show();
    $('#username').html(inputValue);
    username = inputValue;

    /* Once username is entered, connect user to socket */

    var socket = io();
    socket.on('connect', () => {
        socket_id = socket.id;
        socket.emit('init', {username: username, socket_id: socket_id});
    });

    /* New user joined */

    socket.on('new_user_joined', function(data) {
        console.log(data);
        $('.chat-messages').append('<li class="text-success">New user <strong>' + data.newUser.username +  '</strong> has joined.</li>');
    });

    /* Socker user disconnect */

    socket.on('user_disconnected', function(data) {
       $('.chat-messages').append('<li class="text-danger"><strong>' + data.msg +  '</li>')
    });

    /* User enters chat and emits chat message event */

    $(".mytext").on("keydown", function(e) {

        var text = $(this).val();

        if (e.which == 13) {
            if (text !== "") {
                var chatMessage = {
                    name: username,
                    chat: text,
                    time: new Date()
                };
                socket.emit('chat_message', chatMessage);
                $(this).val('');
            }
        }
    });

    /* Socket chat message event triggered */

    socket.on('chat_message', function(chatObj) {
        var who = '';
        if (username == chatObj.name) {
            who = 'me';
        } 
        insertChat(who, chatObj);
    });
});

var colors = ["#6e7786", "#9b3b3b", "#733171", "#a26300", "#c53799"];

var me = {};
me.avatar = "img/user-female.jpg";

var you = {};
you.avatar = "img/user-male.png";

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+ minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}            


function insertChat(who, chatObj) {

    var control = "";
    var date = formatAMPM(new Date());

    var rand = Math.floor(Math.random() * colors.length);

    if (who == "me") {
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p><strong>'+chatObj.name+'</strong></p>' +
                                '<p>'+chatObj.chat+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><span class="chat-circle-me">'+ chatObj.name.charAt(0) +'</span></div>' +                                
                  '</li>';                          
    } else {
        control = '<li style="width:100%">' +
                        '<div class="msj macro">' +
                        '<div class="avatar"><span class="chat-circle-other">'+ chatObj.name.charAt(0) +'</span></div>' +
                            '<div class="text text-l">' +
                                '<p><strong>'+chatObj.name+'</strong></p>' +
                                '<p>'+ chatObj.chat +'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';  
    }

    $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));

    // setTimeout(
    //     function(){                        
    //         $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));
    //     }, time);
    
}

function resetChat() {
    $("ul").empty();
}

$('#send-btn').click(function(){
    $(".mytext").trigger({type: 'keydown', which: 13, keyCode: 13});
})

//-- Clear Chat
resetChat();

//-- Print Messages
//insertChat("me", "Hello Tom...", 0);  
//insertChat("you", "Hi, Pablo", 1500);
// insertChat("me", "What would you like to talk about today?", 3500);
// insertChat("you", "Tell me a joke",7000);
// insertChat("me", "Spaceman: Computer! Computer! Do we bring battery?!", 9500);
// insertChat("you", "LOL", 12000);


//-- NOTE: No use time on insertChat.



