const router = require('express').Router()
const Book = require("../models/book")
const Author = require("../models/author")
const User = require("../models/user")
const { authenticateToken } = require("./userAuth")
router.post("/add-author", authenticateToken, async (req, res) => {
    try{
        const { id } = req.headers
        const user = await User.findById(id)
        if( user.role !== "admin" ){
            return res
            .status(400)
            .json({ message: "Access Denied" })
          }  
          console.log(req.body.url)
          const author = new Author({
            name: req.body.name,
            desc: req.body.desc
        });
        if (req.body.url && req.body.url.trim() !== "") {
        author.url = req.body.url.trim();
    }
        
        await author.save()
        res.status(200).json({message: "Author added successfully"})
    }
    catch(error){
        res.status(500).json({ message: "Internal server error" })
        console.log(error)
    }
});
router.get("/get-author-information/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const author = await Author.findOne({name:id});
        if (!author) {
            return res.status(404).json({
                status: "Failure",
                message: "Author not found"
            });
        }
        return res.json({
            status: "Success",
            data: author
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(error);
    }
});
router.get("/get-authored-books/:id",async(req,res) => {
    const {id} = req.params;
    
    try {
        const author = await Author.findOne({name:id})
        .populate({
            path: "books"
        })
        .sort({createdAt: -1})
        if (!author) {
            return res.status(404).json({
                status: "Failure",
                message: "Author not found"
            });
        }
        
        return res.json({
            status: "Success",
            data: author.books
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(error);
    }
});
router.get("/get-books-of-same-genre/:id",async(req,res) => {
    const {id} = req.params;
    
    try {
        const genre = await Book.find({genre:id})
        
        .sort({rating:-1})
        if (!genre) {
            return res.status(404).json({
                status: "Failure",
                message: "Genre not found"
            });
        }
        
        return res.json({
            status: "Success",
            data: genre
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(error);
    }
});
router.get('/author-spotlight', async (req, res) => {
  try {
    const authors = await Author.find();
    const random = authors[Math.floor(Math.random() * authors.length)];
    res.json(random);
  } catch (err) {
    res.status(500).json({ error: "Error fetching author" });
  }
});

module.exports = router