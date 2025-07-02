const mongoose = require('mongoose')
const user = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
    },
    avatar: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
    },
    role: {
        type: String, 
        default: "user",
        enum: ["user","admin"]
    },
    favourites: [{
        type: mongoose.Types.ObjectId,
        ref: "books"
    }],
    borrowedBooks: [{
        type: mongoose.Types.ObjectId,
        ref: "books"
    }],
    history: [{
        type: mongoose.Types.ObjectId,
        ref: "books"
    }],
    request: [{
        type: mongoose.Types.ObjectId,
        ref: "books"
    }]
},
{ timestamps: true}
);
module.exports = mongoose.model('User', user);
