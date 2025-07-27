const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
 return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
 return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if both fields are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // Create JWT
  const accessToken = jwt.sign(
    { username: username },
    "access", // Secret
    { expiresIn: '1h' }
  );

  // Store token in session
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "Login successful!", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
   const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  // Validate inputs
  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required." });
  }

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Initialize reviews object if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review by the user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully.",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = String(Number(req.params.isbn));
  const username = req.session.authorization.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user." });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully." });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
