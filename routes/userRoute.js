const {Router}=require('express')
const userController=require('../controller/userController')
const imageCrop=require('../middlewares/imageUpload')
const router =require('express').Router()
const {islogout,islogged}=require('../middlewares/auth')


router.get('/',userController.showHome)
router.get('/login',islogout,userController.showLogin)
router.post('/login',islogout,userController.validlogin)

router.get('/register',islogout,userController.showRegister)
router.post('/register',islogout,userController.insertUser)

router.get('/verifyOtp',userController.showVerifyOtp)
router.post('/verifyOtp',userController.verifyOtp)

router.get('/product/:id',userController.showSingle)

router.get('/logout',islogged,userController.logout)

module.exports= router


