require('dotenv').config()
const express =require('express')
const session=require('express-session')
const nocache=require('nocache')
const config=require('./config.js/db')
const path = require('path')
const cookieParser=require('cookie-parser')
const mongoose=require('mongoose')
const morgan = require('morgan');
const flash=require('express-flash')
const methodOverride=require('method-override')
config.dbConnect()

const app=express()


app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine','ejs')
// app.use(morgan('dev')) 
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(session({
    secret: 'fhdsjfhdgbvmn',
    resave: false,
    saveUninitialized: true,
}))
    

app.use(flash())
app.use(nocache());

app.use('/', require('./routes/userRoute'))
app.use('/admin',require('./routes/adminRoute'))

app.use((req,res)=>{res.send('<h1> <center>404-page not found</center> </h1>')})




const port = process.env.PORT || 5000
app.listen(port,()=>{console.log('server started')})
  


