const router = require("express").Router()
const { authenticateToken } = require("./userAuth")
const Request = require("../models/request")
const User = require("../models/user");
router.get("/get-all-requested-books", authenticateToken, async (req,res) =>{
    try{
        const user= await Request.find()
        .populate({
            path: "book"
        })
        .populate({
            path: "user"
        })
        .sort({
            createdAt: -1
        })
        return res.json({
            status: "Success",
            data: user
        })
    } catch(error){
        console.log(error)
        res.status(500).json({ message: "Internal error occurred" })
    }
})
router.put("/update-status/:id", authenticateToken, async (req,res) =>{
    try{
        const { id } = req.params;
        await Request.findByIdAndUpdate(id, {status: req.body.status })
        return res.json({
            status: "Success",
            message: "Status updated successfully"
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({ message: "Internal error occurred" })
    }
})
module.exports = router