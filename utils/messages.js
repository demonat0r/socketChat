const moment = require('moment');
const mongoose = require('mongoose');


const Messages = mongoose.model('Messages', {
    username: String,
    text: String,
    time: String,
    time_id: Date
})


function formatMessage(username, text) {
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\//g, 'ForwardSlash');;

    let message = new Messages({
        username,
        text,
        time: moment().format('h:mm a'),
        time_id: Date.now()
    })
    
    message.save( (err, msg) => {
        if (err) return console.error(err); //log
    })


    return message;
}

async function getMessageHistory(term) {
    let elapsedTime = Date.now() - term
    let concreteMessages = []

    await Messages.find({ 
        username: { $ne: 'ChatCord Bot' },
        time_id: { $gt: elapsedTime }
    }, (err, msg) => {
        if (err) return console.error(err);
        msg.map( model => {
            concreteMessages.push(model.toObject())
        })
    })  

    return concreteMessages
}

module.exports = {
    formatMessage, 
    getMessageHistory
};