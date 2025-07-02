const router = require('express').Router()
const User = require("../models/user")
const { authenticateToken } = require("./userAuth")
router.put("/add-favourites", authenticateToken, async (req, res) => {
    try{
        const { bookid, id } = req.headers
        const user = await User.findById(id)
        const isFavourites = user.favourites.includes(bookid)
        if (isFavourites)
            return res.status(200).json({ message: "The book is already in Favourites" })
        await User.findByIdAndUpdate(id, { $push: { favourites: bookid } })
        return res.status(200).json({ message: "The book is added to Favourites" })
    }
    catch(error){
        res.status(500).json({ message: "Internal error occurred" })
        console.log(error)
    }
});
router.put("/remove-favourites", authenticateToken, async (req, res) => {
    try{
        const { bookid, id } = req.headers
        const user = await User.findById(id)
        const isFavourites = user.favourites.includes(bookid)
        if (isFavourites){
            await User.findByIdAndUpdate(id,{ $pull: { favourites: bookid} })
            return res.status(200).json({ message: "The book is removed from Favourites" })
        }
    }
    catch(error){
        res.status(500).json({ message: "Internal error occurred" })
        console.log(error)
    }
});
router.get("/get-favourites", authenticateToken, async (req, res) => {
    try{
        const { id } = req.headers
        const user = await User.findById(id).populate("favourites")
        const favouriteBooks = user.favourites
        return res.json({
            status: "Success",
            data: favouriteBooks
        });
    } catch(error){
        res.status(500).json({ message: "Internal error occurred" })
        console.log(error)
    }
})
module.exports = router
