const mongoose = require('mongoose')
const books = new mongoose.Schema(
    {
        url:{
            type: String,
            required: true
        },
        title:{
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        isbn: {
            type: Number,
            required: true,
            unique: true
        },
        publication:{
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        pages: {
            type: Number,
            required: true
        },
        desc: {
            type: String,
            required: true
        },
        lang: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
         clickCount: { type: Number, default: 0 }
},
{ timestamps: true}
);
module.exports = mongoose.model("books",books)