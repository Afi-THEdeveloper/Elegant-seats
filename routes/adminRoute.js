const router =require('express').Router()
const adminController=require('../controller/adminController')
const Imagemiddleware=require('../middlewares/imageUpload')
const {isAdminLogout,isAdminlogged}=require('../middlewares/auth')

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
router.get('/products',isAdminlogged,adminController.showProducts)
router.get('/products/create',isAdminlogged,adminController.showAddProduct)
router.post('/products',isAdminlogged,Imagemiddleware.uploadProductImages, Imagemiddleware.resizeProductImages, adminController.createProduct)
router.get('/products/:id/edit',isAdminlogged,adminController.showEditProduct)
// router.patch('/categories/:id',adminController.editProduct)
router.post('/products/destroy',isAdminlogged,adminController.destroyProduct)


//users
router.get('/users',isAdminlogged,adminController.showUsers)
router.post('/users/block',isAdminlogged,adminController.blockUser)



//logout
router.get('/logout',adminController.logout)


module.exports=router


