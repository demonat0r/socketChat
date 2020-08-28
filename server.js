const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const { formatMessage, getMessageHistory } = require('./utils/messages');
const { 
    userJoin, 
    getCurrentUser, 
    userLeave, 
    getRoomUsers 
} = require('./utils/users');
//oo
const options = {stream: fs.createWriteStream('./log/events.log',{flags:'w'}) };
const logger = require('socket.io-logger')(options);

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server);




// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';
let connectionsAvailable = 500; // ВСЕ ТАКОЕ В CONFIG

//Run when client connects 
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        if (connectionsAvailable === 0) {
            socket.emit('message', formatMessage(botName, 'Sorry, maximum number of connections exceeded'))
            return socket.disconnect();
        }

        const user = userJoin(socket.id, username, room);


        socket.join(user.room)
        connectionsAvailable--

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to the ChatCord!'));

        try {
            //Broadcast when a user connects
            socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `A ${user.username} has joined the chat`));

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        } catch (err) {
            console.error('Server error: ' + err)
            throw err
        }
        
    });


    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username, msg));
    });

    //Listen for privateMessage
    socket.on('privateMessage', msg => {
        const user = getCurrentUser(socket.id);
 
        io.to(msg.id).emit('message',formatMessage(user.username, msg.message));
    });

    //Listen for history query
    socket.on('historyQuery', historyTime => {
        // const user = getCurrentUser(socket.id);
        getMessageHistory(historyTime).then( (res) => {
            socket.emit('messageHistory', res);
        })
    });

    //Runs when clients disconnect
    socket.on('disconnect', () => {    
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit(
                'message', 
                formatMessage(botName, `A ${user.username} has left the chat`)
            );
            connectionsAvailable++

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

// io.use(logger);
                                                
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
