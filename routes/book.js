const router = require('express').Router()
const Book = require("../models/book")
const User = require("../models/user")
const Author = require("../models/author")
const { authenticateToken } = require("./userAuth")
const Fuse = require('fuse.js');
const natural = require("natural");
const cosineSimilarity = require("compute-cosine-similarity");


router.post("/add-book", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const user = await User.findById(id);
        // Check if the user is an admin
        if (user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Access Denied" });
        }
        // Create a new book instance
        const book = new Book({
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            isbn: req.body.isbn,
            publication: req.body.publication,
            price: req.body.price,
            pages: req.body.pages,
            desc: req.body.desc,
            lang: req.body.lang,
            genre: req.body.genre,
            rating: req.body.rating
        });
        // Save the book to get its ID
        // Find the author by name and push the book's ObjectId to their list of books
        const author = await Author.findOneAndUpdate(
            { name: req.body.author }, // Look up the author by name
            { $push: { books: book._id } }, // Add the book's ObjectId to their list
            { new: true }
        );
        // Check if the author was found
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        else{
          await book.save();
        res.status(200).json({ message: "Book added successfully" });
      }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.log(error);
    }
});

router.put("/update-book", authenticateToken, async (req,res) => {
    try{
        const { bookid } =  req.headers;
        await Book.findByIdAndUpdate(bookid, { 
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            isbn: req.body.isbn,
            publication: req.body.publication,
            price: req.body.price,
            pages: req.body.pages,
            desc: req.body.desc,
            lang: req.body.lang,
            genre: req.body.genre,
            rating: req.body.rating
        })
        
        return res.status(200).json({ message: "Book Updated successfully" })
    } catch{
        res.status(500).json({ message: "Internal server error" })
    }
});

router.delete("/delete-book", authenticateToken, async (req,res) => {
    try{
        const { bookid } =  req.headers
        await Book.findByIdAndDelete(bookid)
        return res.status(200).json({ message: "Book Deleted successfully" })
    } catch(error){
        res.status(500).json({ message: "Internal server error" })
    }
});

router.post('/book-click', authenticateToken, async (req, res) => {
  const { bookid } = req.headers;
  //console.log({bookid})
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      bookid,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    console.log('Click tracked');
    res.status(200).json({ message: 'Click tracked successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/recommend-content", authenticateToken, async (req, res) => {
  try {
    const {id} = req.headers
    const user = await User.findById(id).populate("favourites");
    if (!user || user.favourites.length === 0) return res.json([]);
    const allBooks = await Book.find();
    const referenceBook = user.favourites[user.favourites.length - 1];
    const corpus = allBooks.map(book => book.desc);
    const tfidf = new natural.TfIdf();
    corpus.forEach(doc => tfidf.addDocument(doc));
    const referenceText = referenceBook.desc;
    // Build a common vocabulary across the corpus
    const vocabulary = new Set();
    for (let i = 0; i < allBooks.length; i++) {
      tfidf.listTerms(i).forEach(term => vocabulary.add(term.term));
    }
    const vocabArray = Array.from(vocabulary);
    // Helper: get vector from a document index
    const getVector = (docIndex) => {
      const termWeights = tfidf.listTerms(docIndex).reduce((acc, cur) => {
        acc[cur.term] = cur.tfidf;
        return acc;
      }, {});
      return vocabArray.map(term => termWeights[term] || 0);
    };
    // Add reference doc at the end for consistent indexing
    tfidf.addDocument(referenceText);
    const refVector = getVector(tfidf.documents.length - 1);
    const recommendations = allBooks
      .filter(book => !user.favourites.some(liked => liked._id.equals(book._id)))
      .map((book, index) => {
        const vec = getVector(index);
        const sim = cosineSimilarity(refVector, vec);
        return { book, score: sim };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    res.status(200).json(recommendations.map(r => r.book));
  } catch (err) {
    console.error("TF-IDF recommend error:", err);
    res.status(500).json({ message: "Recommendation failed", error: err });
  }
});

router.get("/get-allbooks", async (req, res) => {
  const { search } = req.query;
  try {
    const books = await Book.find();

    if (!search) return res.json(books);

    const options = {
      keys: ['title', 'author'],
      threshold: 0.4, // lower = stricter match, higher = fuzzier
    };

    const fuse = new Fuse(books, options);
    const results = fuse.search(search);
    const matchedBooks = results.map(result => result.item);

    res.json(matchedBooks);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-recentbooks", async (req,res) => {
    try{
        const books = await Book.find().sort({ createdAt: -1 }).limit(5)
        return res.json({
            status: "Success",
            data: books
        });
    } catch{
        res.status(500).json({ message: "Internal error occured" })
    }
});

router.get("/get-bookbyid/:id", async (req,res) => {
    try{
        const { id } = req.params
        const book = await Book.findById(id)
        return res.json({
            status: "Success",
            data: book
        });
    } catch{
        res.status(500).json({ message: "Internal error occured" })
    }
});

router.get('/get-trending-books', async (req, res) => {
  try {
    const trendingBooks = await Book.find()
      .sort({ clickCount: -1 })     // Sort by clickCount descending
      .limit(5);                    // Top 5 only

    res.json(trendingBooks);
  } catch (err) {
    res.status(500).json({ message: 'Error getting books', error: err });
  }
});

router.get('/get-top-rated-books', async (req, res) => {
  try {
    const topRated = await Book.find().sort({ rating: -1 }).limit(5);
    res.json(topRated);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/advanced-search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Query string is empty" });
    }

    const books = await Book.find();
    const corpus = books.map(book => book.desc);
    const tfidf = new natural.TfIdf();
    corpus.forEach(doc => tfidf.addDocument(doc));

    // Build vocabulary from all books
    const vocabulary = new Set();
    for (let i = 0; i < books.length; i++) {
      tfidf.listTerms(i).forEach(term => vocabulary.add(term.term));
    }
    const vocabArray = Array.from(vocabulary);

    // Helper function to get vector from tfidf listTerms
    const getVector = (docIndex) => {
      const termWeights = tfidf.listTerms(docIndex).reduce((acc, cur) => {
        acc[cur.term] = cur.tfidf;
        return acc;
      }, {});
      return vocabArray.map(term => termWeights[term] || 0);
    };

    // Add the search query as a document to the TF-IDF
    tfidf.addDocument(q);
    const queryVector = getVector(tfidf.documents.length - 1);

    // Calculate cosine similarity between query and all books
    const results = books.map((book, index) => {
      const bookVector = getVector(index);
      const sim = cosineSimilarity(queryVector, bookVector);
      return { book, score: sim };
    });

    const sortedResults = results
  .filter(r => r.score > 0.1)  // filter out unrelated results
  .sort((a, b) => b.score - a.score)
  .slice(0, 10)
  .map(r => r.book);


    res.json(sortedResults);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed", error: err });
  }
});

module.exports = router