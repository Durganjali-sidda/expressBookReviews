const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// User Registration
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// 🔹 Task 10: Get all books using async/await
public_users.get('/books-async', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// 🔹 Task 11: Get book details by ISBN using async/await
public_users.get('/isbn-async/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});

// 🔹 Task 12: Get book details by author using async/await
public_users.get('/author-async/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Author not found", error: error.message });
  }
});

// 🔹 Task 13: Get book details by title using async/await
public_users.get('/title-async/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Title not found", error: error.message });
  }
});

// Regular routes (still useful)
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).send("Book not found for the given ISBN.");
  }
});

public_users.get('/author/:author', (req, res) => {
  const authorParam = req.params.author.toLowerCase();
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].author.toLowerCase() === authorParam) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found for the given author." });
  }
});

public_users.get('/title/:title', (req, res) => {
  const titleParam = req.params.title.toLowerCase();
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === titleParam) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found with the given title." });
  }
});

public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.status(200).json(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found with the provided ISBN." });
  }
});

module.exports.general = public_users;
