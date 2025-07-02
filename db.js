
const mongoURI = "mongodb+srv://puskarmal07:Invrajah1@cluster0.mgwqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const mongoose = require('mongoose')
const connectToMongo = async () => {
    try{
        await mongoose.connect(mongoURI);
        console.log("Connected successfully to database")
    } catch (error) {
        console.log(error)
    }
};
connectToMongo()