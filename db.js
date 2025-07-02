const mongoose = require('mongoose')
const connectToMongo = async () => {
    try{
        await mongoose.connect("mongodb://localhost:27017/");
        console.log("Connected successfully to database")
    } catch (error) {
        console.log(error)
    }
};
connectToMongo()