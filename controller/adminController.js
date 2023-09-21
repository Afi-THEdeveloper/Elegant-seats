const Admin = require("../model/adminModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const User=require('../model/userModel')
const Order = require('../model/orderModel')
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Console, error } = require("console");

//login 
exports.showLogin = (req, res) => {
  res.render("Admin/login");
}

exports.verifyAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.admin = admin._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render("Admin/login", { error: "password is invalid" });
      }
    } else {
      res.render("Admin/login", { error: "email is invalid" });
    }
  } catch (error) {
    next(error);
  }
}

exports.showDashboard =async (req, res) => {
  try {
     const orders = await Order.find().populate('products')
     const totalUsers = await User.find().countDocuments();
     const monthSales = await Order.aggregate([
      {
          $match:{
              status:{$ne:'Cancelled'}
          }
      },
      {

          $group: {
              _id: {
                year: { $year: '$orderDate' },
                month: { $month: '$orderDate' }
              },
              totalSales: { $sum: '$totalPrice' }
          }
      },
      {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
      }
  ])

  const totalRevenue = await Order.aggregate([
    {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
  ])

const today = new Date().toISOString().split('T')[0];
const todaysRevenue = await Order.aggregate([
  {
      $match: {
          orderDate: {
              $gte: new Date(today), 
              $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)) 
          }
      }
  },
  {
      $group: {
          _id: null,
          todaysSales: { $sum: '$totalPrice' }
      }
  }
])



const topSellingCategory = await Order.aggregate([
  {
      $unwind: '$products'
    },
    {
      $lookup: {
        from: 'products', 
        localField: 'products.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $group: {
        _id: '$productInfo.category',
        totalQuantitySold: { $sum: '$products.quantity' }
      }
    },
    {
      $lookup: {
        from: 'categories', 
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $sort: {
        totalQuantitySold: -1 
      }
    },
])


const topSellingProducts = await Order.aggregate([
  {
      $unwind: '$products'
  },
  {
      $group: {
        _id: '$products.product',
        totalQuantitySold: { $sum: '$products.quantity' }
      }
  },
  {
      $lookup: {
        from: 'products', 
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
  },
  {
      $unwind: '$productInfo'
  },
  {
      $sort: {
        totalQuantitySold: -1 
      }
  },
  {
      $limit: 5 
  }
])



const pendingOrders = await Order.aggregate([
  {
      $match: {
        status: 'Pending'
      }
  },
  {
      $lookup: {
        from: 'products', 
        localField: 'products.product',
        foreignField: '_id',
        as: 'productsInfo'
      }
  }
])

console.log(pendingOrders)

const cancelOrders = await Order.aggregate([
    {
      $match: {
        status: 'Cancelled' 
      }
    },
    {
      
      $lookup: {
        from: 'products', 
        localField: 'products.product',
        foreignField: '_id',
        as: 'productsInfo'
      }
    },
    
  
])



const paymentStatics = await Order.aggregate([
  {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$totalPrice' }
      }
    }
])

const blockedUser = await User.find({blocked:true}).countDocuments();



const totalOrders = await Order.aggregate([
  {
      $match: {
          status: { $ne: 'Cancel' }
      }
  },
  {
      $group: {
          _id: null,
          totalOrders: { $sum: 1 }
      }
  }
])




const yearlyChart = await Order.aggregate([
  {
      $match: {
        status: 'Delivered', 
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        },
        totalSales: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    },
    {

      $project:{
          _id:0
      }
    }
])
const yearlyData =yearlyChart.map((item)=>{ return item.totalSales});
// console.log(yearlyChart)
// console.log(yearlyData)

   return res.render("Admin/dashboard",{
     monthSales,
     totalRevenue,
     todaysRevenue,
     totalUsers,
     topSellingCategory,
     topSellingProducts,
     pendingOrders,
     cancelOrders,
     paymentStatics,
     blockedUser,
     totalOrders,
     yearlyData
    });
    
    
   } catch (error) {
     
     console.log(error.message)
     res.status(500).send('Internal Server Error');
   }
 }

  





 


















exports.salesReport=async (req,res)=>{
  try {
    let neededFilter;
    if(req.body.startDate && req.body.endDate){
      let startDate =req.body.startDate
      let endDate= req.body.endDate
     
      const sales = await Order.find({
        status:'Delivered',
        orderDate:{ $gte:new Date(`${startDate}T00:00:00.000Z`), $lte:new Date(`${endDate}T23:59:59.999Z`) }
      })

       console.log(sales)
       console.log('start', startDate)
       console.log('end', endDate)
       if(sales.length ===0){
          req.flash('error','no reports found')
          return res.redirect('/admin/salesReport')
       }else{
         neededFilter = { status:'Delivered', orderDate:{ $gte:new Date(`${startDate}T00:00:00.000Z`), $lte:new Date(`${endDate}T23:59:59.999Z`) }  }
       }
    }else{
      neededFilter = { status:'Delivered' }
    }  
    
    const allOrders=await Order.aggregate([
          {
            $match:neededFilter
              
          },
        
          {
            $sort: { orderDate: -1 }
          },
          {
            $lookup: {
              from: "products", 
              localField: "products.product", 
              foreignField: "_id", 
              as: "products.product" 
            }
          },
          {
            $lookup: {
              from: "addresses", 
              localField: "deliveryAddress", 
              foreignField: "_id", 
              as: "deliveryAddress" 
            }
          }
        
      ])

    console.log(allOrders)  
    res.render('Admin/orders/salesReport',{orders:allOrders, error:req.flash('error')})
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}





  
//category managment
exports.ShowCategory = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("Admin/categories/index", { categories,success:req.flash('success') });
  } catch (error) {
    console.log(error.message);
  }
};


exports.showAdd = (req, res) => {
  res.render("Admin/categories/new",{error:req.flash('error')});
};

exports.CreateCategory = async (req, res) => {
  try {
    const { name, photo } = req.body;
    if (name.length === 0 || photo.length === 0){
      req.flash('error','All fields are required')
      res.redirect('/admin/category/create')
    }
    const duplicateCategory =await Category.find({name:req.body.name})
    if(duplicateCategory.length){
      req.flash('error','category already exists')
      res.redirect('/admin/category/create')
    }
    else{
      await Category.create({
        name,
        image: "/category/" + photo,
      });
      req.flash('success','category added successfully')
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
}


exports.showEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    res.render("Admin/categories/edit", { category })   
  } catch (error) {
    console.log(error.message);
  }
};


exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, photo } = req.body;
  try {
    const category = await Category.findById(id);
      let updatedObj = {
        name,
      };
      if (typeof photo !== "undefined") {
        fs.unlink(path.join(__dirname, "../public", category.image), (err) => {
          if (err) console.log(err);
        });
        updatedObj.image = "/category/" + photo;
      }
  
      await category.updateOne(updatedObj);
      req.flash('success','category updated successfully')
      res.redirect("/admin/category");
    
  } catch (error) {
    console.log(error.message);
  }
};
      

exports.destroyCategory = async (req, res) => {
  const id = req.body.id;
  const state = Boolean(req.body.state);
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: { isDestroyed: state } },
      { new: true }
    );
    return res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
}
  


//products managment
exports.showProducts= async (req,res)=>{
    const products = await Product.find({}).populate('category')
    res.render('Admin/products/products',{products,success:req.flash('success')})
}

exports.showAddProduct= async (req,res) => {
    const categories = await Category.find({})
    res.render('Admin/products/new', { categories })
}

exports.createProduct = async (req, res) => {
    const { name, description, price, images, stock, category } = req.body
    const imagesWithPath = images.map(img => '/products/' + img)
    try {
        const product = await Product.create({
            name,
            description,
            stock,
            price,
            category,
            images: imagesWithPath,
        })
        req.flash('success','product added successfully')
        res.redirect('/admin/products') 
    } catch (error) {
       console.log(error.message)
    }
}

exports.showEditProduct = async (req, res)=>{
  const { id }= req.params
  try {
      const product = await Product.findById(id)
      const category = await Category.find({})
      res.render('Admin/products/edit',{ product, category,success:req.flash('success') })
  } catch (error) {
      console.log(error.message)
  }
}

exports.updateProduct = async (req, res) => {
  const { id } = req.params
  const { name, description, price, stock, category } = req.body
  try {
    const product = await Product.findByIdAndUpdate(id, {$set: {
      name,
      description,
      price,
      stock,
      category,
    }}, { new: true })

    req.flash('success','product updated successfully')
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error);
  }
}

exports.destroyProductImage = async (req, res) => {
  const { id } = req.params
  const { image } = req.body
  try {
    const product = await Product.findByIdAndUpdate(id, {$pull: { images: image }}, { new: true })
    
    fs.unlink(path.join(__dirname, '../public', image), (err) => {
      if (err) console.log(err)
    })

    res.redirect(`/admin/products/${id}/edit`)
  } catch (error) {
    console.log(error);
  }
}

exports.updateProductImages = async (req, res) => {
  const { id } = req.params
  const { images } = req.body
  let imagesWithPath
  if (images.length) {
    imagesWithPath = images.map(image => '/products/' + image)
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, {$push: { images: imagesWithPath }}, { new: true })
    res.redirect(`/admin/products/${id}/edit`)
  } catch (error) {
    console.log(error.message)
  }
}

 //search products
 exports.searchProduct=async (req,res)=>{
  const { q } = req.query
  try {
      let products;
      if (q) {
          products = await Product.find({ name: { $regex: '.*' + q + '.*' }, softDeleted: 0 })
      } else {
          products=await Product.find({ softDeleted: 0 })   // Fetch all users from the database
      }
      res.render('admin/products/products',{products})
  } catch (error) {
      console.log(error.message)
  }
}

exports.destroyProduct = async (req, res) => {
    const id = req.body.id;
    const state = Boolean(req.body.state);
    try {
      const category = await Product.findByIdAndUpdate(
        id,
        { $set: { softDeleted: state } },
        { new: true }
      );
      return res.redirect("/admin/products");
    } catch (error) {
      console.log(error.message);
    }
}




//users managment
exports.showUsers=async (req,res)=>{
     
    try {
        const users=await User.find({})
        res.render('Admin/users/usersTable',{users}) 
    } catch (error) {
        console.log(error.message)
    }
}


exports.blockUser=async (req,res)=>{
  const id=req.body.id
  const state=Boolean(req.body.state)
  try {
    const users=await User.findByIdAndUpdate(id,{$set:{ blocked:state}},{new:true})
    req.session.user=null
    res.redirect('/admin/users')  
  } catch (error) {
    console.log(error.message)
  }
}




exports.logout= (req,res)=>{
  req.session.admin=null
  res.redirect('/admin')
}


