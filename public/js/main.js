const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const historyQuery = document.getElementById('history_query');
const historyVariables = document.getElementsByClassName('forMessageHistory')
const messageInput = document.getElementById('msg')



//Get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();


let privateID = '';

//join chatroom 
socket.emit('joinRoom', { username, room }); 

//Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//Message fron server
socket.on('message', message => {
    console.log(message + 'needmsg');
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});

//сообщение о том, что чат упал, расклассифицировать ошибки
//отправка файлов и ссылок В СЛУЧАЕ ОШИБКИ ПИСЬМОН НА ПОЧТУ АДМИНУ ИЛИ ВРОДЕ ТОГО НАПРИМЕР КОННЕКТ К БАЗЕ
//Message history
socket.on('messageHistory', messages => {
    messages.forEach( m => {
        outputMessage(m)
    });
});

//Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;


    if (privateID !== '') {
        const privateMsg = {
            message: msg,
            id: privateID
        }
        socket.emit('privateMessage', privateMsg);
        privateID = '';
        messageInput.placeholder = 'Enter Message';
    }
    else
        socket.emit('chatMessage', msg);


    //Clear input
    e.target.elements.msg.value = '';  
    e.target.elements.msg.focus();
});

//Message history
historyQuery.addEventListener('click', () => {
    let hystoryTime = +document.getElementById('history_select').value


    timeOutForHistory();
    clearTimeout(history_timeout);

    
    socket.emit('historyQuery', hystoryTime);
});
//Hide history items
let history_timeout = setTimeout(timeOutForHistory, 60000);
function timeOutForHistory() {
    historyVariables[0].style.visibility = "hidden";
    historyVariables[1].style.visibility = "hidden";
}



// Log OUT TIMEOUT
// document.onkeypress = function() {
//     clearTimeout(socket.inactivityTimeout);
//     socket.inactivityTimeout = setTimeout(() => { 
//         socket.disconnect(); console.log('disconnect'); 
//     }, 1000 * 10); //IMPORTANT TASK
// }



//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <s pan>${message.time}</s></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//start private conversation
function startPrivate(id, name) {
    messageInput.placeholder = `Enter Message for ${name}`;
    privateID = id;
}

//Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
} 

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li id="${user.id}" onclick="startPrivate(this.id, this.innerHTML)">${user.username}</li>`).join('')}
    `;
}

