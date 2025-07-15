const express = require('express');
const cors = require('cors');
const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://rainbow-maamoul-1ebe75.netlify.app',
  'https://spiffy-profiterole-8b6800.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(express.urlencoded({extended:false}))
app.use(cors(corsOptions));
require("dotenv").config();
require("./db")

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
  console.log(`Example app listening at https://localhost:${process.env.port}`)
})
