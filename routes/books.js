var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET route for root (show all books) */
router.get("/", function(req, res, next) {
  Book.findAll({}).then((books) => {
    res.render("books/index", { title: "Books", books:books });
  });
});

router.post("/", function(req,res,next){
  Book.create(req.body).then(function(book){
    res.redirect("/books/" + book.id);
  });
});

// holder for pagination
router.get("/page/:id", function(req,res,next){
  console.log(`page ${req.params.id} of 10`);
});

/* GET router for new book */
router.get("/new", function(req, res, next) {
  res.render("books/new", {book:Book.build(), title: "New Book"});
});

/* GET route for edit book */
router.get("/:id/edit", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/edit", {book: book, title: "Edit Book"});
  });
});


router.get("/:id/delete", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/delete", {book: book, title: "Delete Book"});
  });
});

/* Show a  book form. */
router.get("/:id", function(req,res,next) {
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/show",{book: book, title: book.title});
  });
});

/* Update a  book using put. */
router.put("/:id", function(req,res,next){
  console.log("\n\n\nhere");
  Book.findByPk(req.params.id).then(function(book){
    return book.update(req.body);
  }).then((book) => {
    res.redirect("/books/" + book.id);
  });
});

router.delete("/:id", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      return book.destroy();
    } else {
      res.send(404);
    }
  }).then(function(){
    res.redirect("/books"); 
  });
});


module.exports = router;
