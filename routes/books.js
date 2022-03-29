const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')

//upload
const path = require('path')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
const multer = require('multer')

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) =>{
        callback(null, imageMimeTypes.includes(file.mimetype) )
    }
})

//delete added book
const fs = require('fs')

//All Books route
router.get('/', async (req, res) => {
    let searchOptions = {}

    if (req.query.title != null && req.query.title !== '') {
        searchOptions.title = new RegExp(req.query.title, 'i')
    }

    try {
        const books = await Book.find(searchOptions)
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

//New Book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

//Create book route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try{
        const newBook = book.save()
        // res.redirect(`books/&{newBook.id}`)
        res.redirect('books')
    }
    catch{
        if (book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err=>{
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'Error creating book'
        res.render('books/new', params)
    }
    catch{
        res.redirect('/books')
    }
}

module.exports = router