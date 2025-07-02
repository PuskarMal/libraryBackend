const mongoose = require('mongoose')
const connectToMongo = async () => {
    try{
        await mongoose.connect("mongodb+srv://puskar07:GOeXpgBp4Fi9p3bO@cluster0.mongodb.net/test",{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
        console.log("Connected successfully to database")
    } catch (error) {
        console.log(error)
    }
};
connectToMongo()
