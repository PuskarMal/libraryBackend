const mongoose = require('mongoose')
const request = new  mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref:"User"
    },
    book: {
        type: mongoose.Types.ObjectId,
        ref: "books"
    },
    status: {
        type: String,
        default: "Request Sent",
        enum: ["Request Sent", "Cancelled", "Book is borrowed", "Access Denied"]
    },
},
{ timestamps: true }
);
module.exports = mongoose.model("request", request)