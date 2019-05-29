var socket = io();

var chatArea = document.querySelector('.chatArea')
var noFormText = document.querySelector('.noFormText')
var LOGIN;

var x = document.getElementById("yy").innerText;
var userName = document.getElementById("yy1").innerText;
var messField = document.querySelector(".noFormText")


socket.emit('create', x);

socket.on('testing', (data) => {
    console.log(data)
})

noFormText.addEventListener('keypress', (e) => {
    var key = e.which || e.keyCode;
    var msgField = document.querySelector(".noFormText")
    if (e.keyCode == 13 && messField.value.trim() != '') {
        var msg = msgField.value
        msgField.value = ''

        socket.emit('message', msg, userName)
    }


})



socket.on('msg_to_chat', (msg, userNameFromServer) => {
    var card = document.createElement('div');
    var cardHeader = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardMess = document.createElement('p');
    var ascPre = document.createElement('pre');

    var chatArea = document.querySelector('.chatArea')

    var login = document.createElement('div');
    var mess = document.createElement('div');
    var br = document.createElement('br')
    
    if (userName == userNameFromServer) {
        card.style = 'margin-left:15rem;';
    } else {
        card.style = 'margin-right:15rem;';
    }

    cardHeader.textContent = userNameFromServer;
    ascPre.textContent = msg;
    cardMess.textContent = msg;

    card.className = "card bg-light"
    cardHeader.className = "card-header"
    cardHeader.style = 'height:auto;font-size:15px;'
    cardBody.className = "card-body"
    cardMess.className = "card-text"

    cardBody.appendChild(cardMess)
    card.appendChild(cardHeader)
    card.appendChild(cardBody)


    chatArea.appendChild(card)
    chatArea.appendChild(br);

    card.scrollIntoView(false)
})