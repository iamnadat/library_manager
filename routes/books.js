var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({}).then((books) => {
    res.render("books/index", { title: 'Books', books:books });
  });
});

/* Create a new book form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book:Book.build(), title: "New Book"});
});

/* Edit a  book form. */
router.get('/:id/edit', function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/edit", {book: book, title: "Edit Book"});
  });
});

/* Show a  book form. */
router.get('/:id', function(req,res,next) {
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/show",{book: book, title: book.title});
  });
});

/* Update a  book using put. */
router.put('/:id', function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    return book.update(req.body);
  }).then((book) => {
    res.redirect("/books/" + book.id);
  });
});


module.exports = router;
