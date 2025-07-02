const express = require('express');
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: 'http://localhost:5173', // Allow this origin
  credentials: true,               // Allow credentials
};
app.use(express.urlencoded({extended:false}))
app.use(cors(corsOptions));
require("./db")
require("dotenv").config();
app.set("view engine","ejs");
const User = require("./routes/user")
const Books = require("./routes/book")
const Favourite = require("./routes/favourite")
const Borrowwed = require("./routes/borrow")
const Request = require("./routes/request")
const Forgot = require("./routes/forgot")
const Author = require("./routes/author")
app.use(express.json())
app.use("/api/auth", Request)
app.use("/api/auth", Favourite)
app.use("/api/auth", User)
app.use("/api/auth", Forgot)
app.use("/api/auth",Books)
app.use("/api/auth",Author)
app.use("/api/auth",Borrowwed)
app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})