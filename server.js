if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index') //import exported var from index.js

app.set('view engine', 'ejs') //set view engines to ejs
app.set('views', __dirname + '/views') //all views in here
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error) )
db.once('open', () => console.log('Connected to Mongoose') )

app.use('/index', indexRouter)

app.listen(process.env.PORT || 3000)
