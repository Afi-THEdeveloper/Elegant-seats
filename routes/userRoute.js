const userController=require('../controller/userController')
const router =require('express').Router()
const {islogout,islogged}=require('../middlewares/auth')


router.get('/',userController.showHome)
router.get('/login',islogout,userController.showLogin)
router.post('/login',islogout,userController.validlogin)

router.get('/register',islogout,userController.showRegister)
router.post('/register',islogout,userController.insertUser)

router.get('/verifyOtp',userController.showVerifyOtp)
router.post('/verifyOtp',userController.verifyOtp)

// router.patch('/resendOtp',userController.resendOtp);
router.patch('/resendOtp',userController.resendOtp)

router.get('/product/:id',userController.showSingle)
router.get('/shop',userController.showShop)
router.post('/shop',userController.showShop)

router.get('/products/search',userController.searchProduct)

router.get('/logout',islogged,userController.logout)



module.exports= router



