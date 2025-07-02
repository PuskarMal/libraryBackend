const router = require('express').Router()
const User = require("../models/user")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
var nodemailer = require('nodemailer');
const JWT_SECRET = "3uews8ayfaq2ujags9fawor3kqakiHFWwofow3jrfhid9sei4oirpoplvnsbWeur3920mnsvjsdgviuaw3q";
router.post('/forgot-password', async (req,res) =>{
    const {email} = req.body;
    try{
      const oldUser = await User.findOne({email});
      if(!oldUser){
        return res.json({status: "User does not exist!!"});
      }
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign({email: oldUser.email, id: oldUser._id}, secret, {expiresIn: "20m"});
      const link = `http://localhost:1000/api/auth/reset-password/${oldUser._id}/${token}`;
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'puskarmal07@gmail.com',
          pass: 'mjyl vane vbep hmin'
        }
      });
      
      var mailOptions = {
        from: 'puskarmal07@gmail.com',
        to: email,
        subject: 'Password Reset Link',
        text: link
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      return res.json({ status: 'Password reset email sent successfully' });
    }
    catch(error){}
  })
  router.get("/reset-password/:id/:token", async(req, res) =>{
    const {id, token}=req.params;
    console.log(req.params);
    const oldUser = await User.findOne({_id: id});
    if(!oldUser){
      return res.send("User does not exist!!");
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
      const verify = jwt.verify(token, secret);
      res.render("index",{email:verify.email, status:"not verified"});
      }catch(error){
      console.log(error);

      res.send("Not verified");
    }
  })
  router.post("/reset-password/:id/:token", async(req, res) =>{
    const {id, token}=req.params;
    if(req.body.password === '' || req.body.confirmPassword === '0'){
      res.send("New password cannot be set");
    }
    else if(req.body.password === req.body.confirmPassword){
      const oldUser = await User.findOne({_id: id});
      if(!oldUser){
        return res.send("User does not exist!!");
      }
      const secret = JWT_SECRET + oldUser.password;
      try{
        const verify = jwt.verify(token, secret);
        const encryptedPass= await bcrypt.hash(req.body.password, 10);
        await User.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              password: encryptedPass,
            },
          }
        );
        res.send("Password is updated");
        res.render("index", {email:verify.email, status:"verified"})
      }
      catch(error){
        console.log(error);
        res.send("Something went wrong");
      }
  }
  else{
    res.send("The fields didn't match");
  }
  }
  )
  module.exports = router