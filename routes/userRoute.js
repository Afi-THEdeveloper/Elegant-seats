const userController= require('../controller/userController')
const accountController= require('../controller/accountController')
const orderController= require('../controller/orderController')
const couponController= require('../controller/couponController')
const middlewares= require('../middlewares/imageUpload')
const router = require('express').Router()
const { islogout, islogged }= require('../middlewares/auth')

//home and login
router.get('/',userController.showHome)
router.get('/login', islogout, userController.showLogin)
router.post('/login', islogout, userController.validlogin)

//forgot and reset password
router.get('/forgotPassword',userController.showVerify)
router.post('/verifyEmail', userController.verifyEmail)
router.get('/editPassword', userController.showEditPassword)
router.post('/reset-password',userController.updatePassword)

//register
router.get('/register', islogout, userController.showRegister)
router.post('/register', islogout, userController.insertUser)

//otp verification
router.get('/verifyOtp',userController.showVerifyOtp)
router.get('/verifyOtp/:id',userController.showVerifyOtp)
router.post('/verifyOtp',userController.verifyOtp)
router.post('/forgetVerifyOtp',userController.forgetVerifyOtp)
router.patch('/resendOtp',userController.resendOtp)

//shop
router.get('/product/:id', userController.showSingle)
router.get('/shop', userController.showShop)
router.post('/shop', userController.showShop)
router.get('/wishlist', islogged, userController.shoWishlist)
router.get('/addTowishlist/:id', islogged,  userController.addToWishlist)
router.get('/wishlist/remove/:id', islogged, userController.destroyWishitem)
//search
router.post('/searchProduct', userController.showShop)



//cart
router.get('/cart', islogged, userController.showCart)
router.post('/addToCart', islogged, userController.addTocart)
router.post('/update-cart-item-quantity', islogged, userController.updateCartQauntity)
router.get('/destroyCartItem/:id', islogged, userController.destroyCartItem)

//checkout and order
router.get('/cart/checkout', islogged, orderController.showCheckout)
// router.get('/buyNow/:id', orderController.showCheckout)
router.post('/checkout', islogged, orderController.placeOrder)
router.get('/myOrders', islogged, orderController.showOrders)
router.post('/myOrders/orderDetails', islogged, orderController.orderDetails)
router.post('/myOrders/cancel', islogged, orderController.cancelOrder)
router.get('/refund/:id', islogged, orderController.refundOrder)

router.get('/razorpay/CreateOrder', islogged, orderController.createOrder)
router.post('/myOrders/invoice', islogged, orderController.loadInvoice)

//profile
router.get('/profile', islogged, accountController.showProfile)
router.get('/profile/edit', islogged,  accountController.showEditProfile)
router.patch('/profile/edit', islogged, middlewares.uploadProfileImage, middlewares.resizeProfileImage, accountController.updateProfile )

//address
router.get('/profile/address', islogged, accountController.showAddress)
router.get('/profile/addAddress', islogged, accountController.showAddaddress)
router.post('/profile/addAddress', islogged, accountController.addAddress)
router.get('/profile/editAddress/:id', islogged, accountController.showEditaddress)
router.put('/profile/editAddress/:id', islogged, accountController.editAddress)
router.get('/profile/deleteAddress/:id', islogged, accountController.deleteAddress)
router.post('/profile/setDefaultAddress', islogged, accountController.setDefaultAddress)


//wallet
router.get('/profile/wallet', islogged, accountController.showWallet)


//coupon
router.post('/validate-coupon', couponController.validateCoupon)


//logout
router.get('/logout',islogged,userController.logout)



module.exports= router



