var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

let currentPage;
let limit = 5;
let offset;

/* GET route to show all books */
router.get("/", function(req, res, next) {
  res.redirect("/books/page/1")
  // Book.findAll({offset: 30,limit: 2}).then((books) => {
  //   res.render("books/index", { title: "Books", books:books });
  // });
});

/* GET route to create a ne book */
router.post("/", function(req,res,next){
  Book.create(req.body).then(function(book){
    res.redirect("/books/" + book.id);
  }).catch(function(error){
    if(error.name === "SequelizeValidationError") {
      res.render("books/new",{book:Book.build(req.body),errors:error.errors, title:"New Book"});
    } else {
      throw error;
    }
  }).catch(function(error){
    res.send(500,error);
  });
});

/* holder for pagination*/
router.get("/page/:id", function(req,res,next){
  page =  parseInt(req.params.id);
  if(isNaN(page)){
    var error = createError(500, 'Page is not a number');
    next(error);
  } else{
    offset = (page * limit) - limit;
    currentPage = page;
    Book.findAndCountAll({
      offset: offset,
      limit: limit
    })
    .then(books => {
      if(books.rows.length > 0){
        var noOfPages = Math.ceil(books.count / limit);
        console.log(noOfPages);
        res.render("books/index", { title: "Books", books:books.rows, noOfPages:noOfPages });
      } else {
        var error = createError(500, 'No books found');
        next(error);
      }
    })
    .catch((error) =>{
      res.send(500,error);
      next(error);
    });
  }
});

/* GET router for new book */
router.get("/new", function(req, res, next) {
  res.render("books/new", {book:Book.build(), title: "New Book", currentPage:currentPage});
});

/* GET route for edit book */
router.get("/:id/edit", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      res.render("books/edit", {book: book, title: "Edit Book", currentPage:currentPage});
    } else {
      var error = createError(404, 'This book does not exist!');
      res.render("error",{message:"Ooooops !!",error:error});
    }
  }).catch((error) => {
    res.send(500,error);
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
    if(book) {
      res.render("books/show",{book: book, title: book.title, currentPage:currentPage});
    } else {
      var error = createError(404, 'This book does not exist!');
      // res.render("error",{message:"Ooooops !!",error:error});
      next(error);
    }    
  });
});

/* Update a  book using put. */
router.put("/:id", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      return book.update(req.body);
    } else {
      res.send(404);
    }
  }).then((book) => {
    res.redirect("/books/" + book.id);
  }).catch((error) => {
    if(error.name === 'SequelizeValidationError') {
      var book = Book.build(req.body);
      book.id = req.params.id;
      res.render("books/edit",{book:book,errors:error.errors,title:"Edit Book",currentPage:currentPage});
    } else {
      throw error;
    }
  }).catch((error) => {
    res.send(500, error);
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
