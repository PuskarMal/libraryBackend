const mongoose = require('mongoose')
const author = new mongoose.Schema(
    {
        url:{
            type: String
        },
        name: {
            type: String,
            required: true
        },
        desc: {
            type: String,
            required: true
        },
        books:[{
            type: mongoose.Types.ObjectId,
            ref: "books"
        }]
        
},
{ timestamps: true}
);
module.exports = mongoose.model("author",author)