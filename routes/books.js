var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({}).then((books) => {
    res.render("books/index", { title: 'Books', books:books });
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book:Book.build(), title: "New Book"});
});

router.get("/:id/edit", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/edit", {book: book, title: "Edit Book"});
  });
});

router.get('/:id', function(req,res,next) {
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/show",{book: book, title: book.title});
  });
});



module.exports = router;
