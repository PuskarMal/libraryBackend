const router = require('express').Router()
const User = require("../models/user")
const Book = require("../models/book")
const { authenticateToken } = require("./userAuth")
const Request = require("../models/request");
router.put("/delete-the-request/:bookid", authenticateToken, async (req, res) => {
    try{
        const {bookid} = req.params;
        const { id } = req.headers
        await Request.findByIdAndUpdate(id, {
            $pull: { borrowedBooks: bookid },
        });
        await User.findByIdAndUpdate(id, {
            $pull: { book: bookid },
        });
        return res.json({
            status: "Success",
            message: "A book is removed"
        });
    } catch(error){
        return res.status(500).json({ message: "Internal error occurred" })
    }
});
router.put("/book-return", authenticateToken, async (req, res) => {
    try{
        const { bookid, id} = req.headers
        await User.findByIdAndUpdate(id, {
            $pull: { request: bookid }
        });
        await Request.findByIdAndDelete(bookid);
        return res.json({
            status: "Success",
            message: "Book is returned"
        });
    } catch(error){
        return res.status(500).json({ message: "Internal error occurred" })
    }
});
router.get("/get-borrowed-books", authenticateToken, async (req, res) => {
    try{
        const { id } = req.headers
        const user = await Request.find({user: id})
        .populate({
            path: "book"
        })
        .sort({createdAt: -1})
        return res.json({
            status: "Success",
            data: user
        });
    } catch(error){
        res.status(500).json({ message: "Internal error occurred" })
        console.log(error)
    }
})
router.get("/get-history", authenticateToken, async (req, res) => {
    try{
        
        const { id } = req.headers
        const user = await Request.find({user: id})
        .populate({
            path: "book"
        })
        .sort({ createdAt: -1})
        return res.json({
            status: "Success",
            data: user
        })
        
        
    } catch(error){
        res.status(500).json({ message: "Internal error occurred" })
        console.log(error)
    }
})
router.post("/request-a-book", authenticateToken, async (req, res) => {
    try{
        const { bookid, id} = req.headers;
        const user = await User.findById(id)
        const isRequested = user.request.includes(bookid)
        if(isRequested){
            return res.json({
                status: "Success",
                message: "Waiting for admin's approval"
            });
        }
        else{
            
            await User.findByIdAndUpdate(id, {
            $push: {request: bookid}
            });
            await User.findByIdAndUpdate(id, {
            $push: {history: bookid}
            });
            const newRequest = new Request ({
                user: id,
                book: bookid,
                status: "Request Sent"
             });
             await newRequest.save(); 
        }
        return res.json({
            status: "Success",
            message: "Request is successfully sent. Will be soon updated."
        });
    } catch(error){
        console.log(error);
    }
});

module.exports = router