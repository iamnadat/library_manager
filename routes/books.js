var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var Op = sequelize.Op;
var Book = require("../models").Book;

let currentPage;
let limit = 5;
let offset;

/* GET route to show all books */
router.get("/", function(req, res, next) {
  // redirect to show page one of books
  res.redirect("/books/page/1");
});

/* GET route to create a new book */
router.post("/", function(req,res,next){
  // try to create book
  Book.create(req.body).then(function(book){
    // if successfull redirect to show book
    res.redirect("/books/" + book.id);
  }).catch(function(error){
    // if there is a validation error render error, otherwise throw error
    if(error.name === "SequelizeValidationError") {
      res.render("books/new",{book:Book.build(req.body),errors:error.errors, title:"New Book"});
    } else {
      throw error;
    }
  }).catch(function(error){
    // catch other error 
    res.send(500,error);
  });
});

/* GET route for pagination */
router.get("/page/:id", function(req,res,next){
  page =  parseInt(req.params.id);
  // check to see if param is actualy a number
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

/* POST router for when a search happens */
router.post('/page/:id', function(req,res,next){
  page =  parseInt(req.params.id);
  var query = req.body.query;
  // if the query is empty redirect to show all books on page 1
  if(!query){
    res.redirect("/books/page/1");
  }
  // check if poge is number
  if(isNaN(page)){
    var error = createError(500, 'Page is not a number');
    next(error);
  } else{
    // build query
    Book.findAndCountAll({
      where: {
        [Op.or] : [
          {
            title: {
              [Op.like]: `%${query}%`
            }
          },
          {
            author: {
              [Op.like]: `%${query}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${query}%`
            }
          },
          {
            year: {
              [Op.like]: `%${query}%`
            }
          }
        ]
      }
    })
    .then(books => {
      if(books.rows.length > 0){
        res.render("books/index", { title: "Books", books:books.rows});
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

/*  GET route for delete book */
router.get("/:id/delete", function(req,res,next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/delete", {book: book, title: "Delete Book"});
  });
});

/* Get route to Show a book form. */
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

/* PUT route to Update a book. */
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

/* DELETE route to delet book */
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
