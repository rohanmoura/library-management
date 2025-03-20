const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Book = require("../models/Book");
const User = require("../models/User");
const auth = require("../middleware/auth");

// @route   POST /api/books
// @desc    Add a new book
// @access  Private (Librarian only)
router.post("/books", async (req, res) => {
  try {
    // TODO: Add middleware to check if user is a librarian

    const { title, author, ISBN, quantity } = req.body;

    // Validate input
    if (!title || !author || !ISBN || !quantity) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if book with ISBN already exists
    const existingBook = await Book.findOne({ ISBN });
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    // Create new book
    const book = new Book({
      title,
      author,
      ISBN,
      quantity,
    });

    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/borrow/:bookId
// @desc    Borrow a book
// @access  Private
router.post("/borrow/:bookId", auth, async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get user ID from token instead of URL
    const userId = req.user.id;

    const book = await Book.findById(req.params.bookId).session(session);

    // Check if book exists
    if (!book) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if book is available - improved error message
    if (book.quantity <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "This book is currently out of stock" });
    }

    // Get user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has already borrowed this book - more specific check
    if (user.borrowedBooks.some((id) => id.toString() === req.params.bookId)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "You have already borrowed this book" });
    }

    // Update book quantity safely
    book.quantity -= 1;
    await book.save({ session });

    // Add book to user's borrowed books
    user.borrowedBooks.push(req.params.bookId);
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Book borrowed successfully", book, user });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/return/:bookId
// @desc    Return a book
// @access  Private
router.post("/return/:bookId", auth, async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get user ID from token instead of URL
    const userId = req.user.id;

    const book = await Book.findById(req.params.bookId).session(session);

    // Check if book exists
    if (!book) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Book not found" });
    }

    // Get user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has borrowed this book - more specific check
    if (!user.borrowedBooks.some((id) => id.toString() === req.params.bookId)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "You have not borrowed this book" });
    }

    // Update book quantity safely
    book.quantity += 1;
    await book.save({ session });

    // Remove book from user's borrowed books
    user.borrowedBooks = user.borrowedBooks.filter(
      (bookId) => bookId.toString() !== req.params.bookId,
    );
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Book returned successfully", book, user });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/:userId/books
// @desc    Get all books borrowed by a user
// @access  Private
router.get("/users/:userId/books", auth, async (req, res) => {
  try {
    // Only allow users to see their own borrowed books
    // or implement admin check here
    if (req.params.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view other users' books" });
    }

    const user = await User.findById(req.params.userId).populate(
      "borrowedBooks",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.borrowedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
