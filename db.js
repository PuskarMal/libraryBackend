const mongoose = require('mongoose')
const mongoURI = `mongodb+srv://puskarmal07:${process.env.MONGO_PASS}@cluster0.mgwqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const connectToMongo = async () => {
    try{

        await mongoose.connect(mongoURI);

        console.log("Connected successfully to database")
    } catch (error) {
        console.log(error)
    }
};
connectToMongo()
