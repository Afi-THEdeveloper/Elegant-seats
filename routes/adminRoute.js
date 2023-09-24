const router = require('express').Router()
const adminController = require('../controller/adminController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
const Imagemiddleware = require('../middlewares/imageUpload')
const { isAdminLogout, isAdminlogged } = require('../middlewares/auth')

router.get('/',isAdminLogout,adminController.showLogin)
router.post('/',isAdminLogout,adminController.verifyAdminLogin)

router.get('/dashboard',isAdminlogged,adminController.showDashboard)

//categories
router.get('/category',isAdminlogged,adminController.ShowCategory)
router.post('/category',isAdminlogged, adminController.destroyCategory)
router.get('/category/create',isAdminlogged,adminController.showAdd)
router.post('/categories',isAdminlogged, Imagemiddleware.uploadCategoryImage, Imagemiddleware.resizeCategoryImage, adminController.CreateCategory)
router.get('/categories/:id/edit',isAdminlogged,adminController.showEdit)
router.patch('/categories/:id',isAdminlogged, Imagemiddleware.uploadCategoryImage, Imagemiddleware.resizeCategoryImage, adminController.updateCategory)

//products
router.get('/products', isAdminlogged, adminController.showProducts)
router.get('/products/create', isAdminlogged, adminController.showAddProduct)
router.post('/products', isAdminlogged, Imagemiddleware.uploadProductImages, Imagemiddleware.resizeProductImages, adminController.createProduct)
router.post('/products/destroy', isAdminlogged, adminController.destroyProduct)
router.get('/products/:id/edit', isAdminlogged, adminController.showEditProduct)
router.patch('/products/:id', isAdminlogged, adminController.updateProduct)
router.delete('/products/:id/img/delete', isAdminlogged, adminController.destroyProductImage)
router.patch('/products/:id/img/add', isAdminlogged, Imagemiddleware.uploadProductImages, Imagemiddleware.resizeProductImages, adminController.updateProductImages)
router.get('/products/search',isAdminlogged,adminController.searchProduct)


//orders
router.route('/ordersTable')
    .get( isAdminlogged, orderController.showOrdersTable)
    .patch( isAdminlogged, orderController.updateStatus)
router.get('/orders/details/:id', isAdminlogged, orderController.orderDetails)
router.route('/salesReport')
      .get(isAdminlogged, adminController.salesReport)
      .post(isAdminlogged, adminController.salesReport)



//users
router.get('/users',isAdminlogged,adminController.showUsers)
router.post('/users/block',isAdminlogged,adminController.blockUser)

//coupons
router.route('/coupons')
    .get(couponController.showCoupons)

router.route('/coupon/addCoupon')
    .get(couponController.showAddcoupon) 
    .post(couponController.addCoupon) 
    
router.route('/coupons/edit/:id')
    .get(couponController.showEditCoupon) 
    .post(couponController.updateCoupon)  
router.route('/coupon/destroy')
    .post(isAdminlogged, couponController.destroyCoupon)     

//logout
router.get('/logout', isAdminlogged, adminController.logout)


module.exports=router




