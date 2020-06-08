const mongoose = require('mongoose');
// const config = require('config');
// const dbURL = config.get('mongoURL');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://demonat0r:myFirstDB666@cluster0-jaiq5.mongodb.net/chat_history", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: true
        });
        console.log('Connected to Database')
    } catch(err) {
        console.error(err.message);
        process.exit(1)
    }
};

module.exports = connectDB;