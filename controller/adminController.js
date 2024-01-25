const Admin = require("../model/adminModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const User=require('../model/userModel')
const Order = require('../model/orderModel')
const Offer = require('../model/offerModel')
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const json2csv = require('json2csv');
const { Console, error } = require("console");

//login 
exports.showLogin = (req, res) => {
  res.render("Admin/login");
}

exports.verifyAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    console.log(admin)
    console.log(email,password)

    if (admin) {
      // req.session.admin = admin._id;
      // res.redirect("/admin/dashboard");
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

// exports.showDashboard =async (req, res) => {
//   try {
//      const orders = await Order.find().populate('products')
//      const totalUsers = await User.find().countDocuments();
//      const monthSales = await Order.aggregate([
//       {
//           $match:{
//               status:{$ne:'Cancelled'}
//           }
//       },
//       {

//           $group: {
//               _id: {
//                 year: { $year: '$orderDate' },
//                 month: { $month: '$orderDate' }
//               },
//               totalSales: { $sum: '$totalPrice' }
//           }
//       },
//       {
//           $sort: {
//             '_id.year': 1,
//             '_id.month': 1
//           }
//       }
//   ])

//   const totalRevenue = await Order.aggregate([
//     {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: '$totalPrice' }
//         }
//       }
//   ])

// const today = new Date().toISOString().split('T')[0];
// const todaysRevenue = await Order.aggregate([
//   {
//       $match: {
//           orderDate: {
//               $gte: new Date(today), 
//               $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)) 
//           }
//       }
//   },
//   {
//       $group: {
//           _id: null,
//           todaysSales: { $sum: '$totalPrice' }
//       }
//   }
// ])



// const topSellingCategory = await Order.aggregate([
//     {
//       $unwind: '$products'
//     },
//     {
//       $lookup: {
//         from: 'products', 
//         localField: 'products.product',
//         foreignField: '_id',
//         as: 'productInfo'
//       }
//     },
//     {
//       $unwind: '$productInfo'
//     },
//     {
//       $group: {
//         _id: '$productInfo.category',
//         totalQuantitySold: { $sum: '$products.quantity' }
//       }
//     },
//     {
//       $lookup: {
//         from: 'categories', 
//         localField: '_id',
//         foreignField: '_id',
//         as: 'category'
//       }
//     },
//     {
//       $sort: {
//         totalQuantitySold: -1 
//       }
//     },
// ])


// const topSellingProducts = await Order.aggregate([
//   {
//       $unwind: '$products'
//   },
//   {
//       $group: {
//         _id: '$products.product',
//         totalQuantitySold: { $sum: '$products.quantity' }
//       }
//   },
//   {
//       $lookup: {
//         from: 'products', 
//         localField: '_id',
//         foreignField: '_id',
//         as: 'productInfo'
//       }
//   },
//   {
//       $unwind: '$productInfo'
//   },
//   {
//       $sort: {
//         totalQuantitySold: -1 
//       }
//   },
//   {
//       $limit: 5 
//   }
// ])



// const pendingOrders = await Order.aggregate([
//   {
//       $match: {
//         status: 'Pending'
//       }
//   },
//   {
//       $lookup: {
//         from: 'products', 
//         localField: 'products.product',
//         foreignField: '_id',
//         as: 'productsInfo'
//       }
//   }
// ])

// console.log(pendingOrders)

// const cancelOrders = await Order.aggregate([
//     {
//       $match: {
//         status: 'Cancelled' 
//       }
//     },
//     {
      
//       $lookup: {
//         from: 'products', 
//         localField: 'products.product',
//         foreignField: '_id',
//         as: 'productsInfo'
//       }
//     },
    
  
// ])



// const paymentStatics = await Order.aggregate([
//   {
//       $group: {
//         _id: '$paymentMethod',
//         totalAmount: { $sum: '$totalPrice' }
//       }
//   }
// ])

// const blockedUser = await User.find({blocked:true}).countDocuments();



// const totalOrders = await Order.aggregate([
//   {
//       $match: {
//           status: { $ne: 'Cancel' }
//       }
//   },
//   {
//       $group: {
//           _id: null,
//           totalOrders: { $sum: 1 }
//       }
//   }
// ])




// const yearlyChart = await Order.aggregate([
//   {
//       $match: {
//         status: 'Delivered', 
//       }
//     },
//     {
//       $group: {
//         _id: {
//           year: { $year: '$orderDate' },
//           month: { $month: '$orderDate' }
//         },
//         totalSales: { $sum: '$totalPrice' }
//       }
//     },
//     {
//       $sort: {
//         '_id.year': 1,
//         '_id.month': 1
//       }
//     },
//     {

//       $project:{
//           _id:0
//       }
//     }
// ])
// const yearlyData =yearlyChart.map((item)=>{ return item.totalSales});
// // console.log(yearlyChart)
// // console.log(yearlyData)

//    return res.render("Admin/dashboard",{
//      monthSales,
//      totalRevenue,
//      todaysRevenue,
//      totalUsers,
//      topSellingCategory,
//      topSellingProducts,
//      pendingOrders,
//      cancelOrders,
//      paymentStatics,
//      blockedUser,
//      totalOrders,
//      yearlyData
//     });
    
    
//    } catch (error) {
     
//      console.log(error.message)
//      res.status(500).send('Internal Server Error');
//    }
//  }

exports.showDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [orders, totalUsers, monthSales, totalRevenue, todaysRevenue, topSellingCategory, topSellingProducts, pendingOrders, cancelOrders, paymentStatics, blockedUser, totalOrders, yearlyChart] 
    = await Promise.all([
      Order.find().populate('products'),
      User.find().countDocuments(),
      Order.aggregate([
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
        // ... your aggregation pipeline for monthSales
      ]),
      Order.aggregate([
          {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' }
              }
            }
        // ... your aggregation pipeline for totalRevenue
      ]),
      Order.aggregate([
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
        
      ]),
      Order.aggregate([
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
        // ... your aggregation pipeline for topSellingCategory
      ]),
      Order.aggregate([
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
        // ... your aggregation pipeline for topSellingProducts
      ]),
      Order.aggregate([
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
        // ... your aggregation pipeline for pendingOrders
      ]),
      Order.aggregate([
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
        // ... your aggregation pipeline for cancelOrders
      ]),
      Order.aggregate([
          {
              $group: {
                _id: '$paymentMethod',
                totalAmount: { $sum: '$totalPrice' }
              }
          }
        // ... your aggregation pipeline for paymentStatics
      ]),
      User.find({ blocked: true }).countDocuments(),
      Order.aggregate([
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
        // ... your aggregation pipeline for totalOrders
      ]),
      Order.aggregate([
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
        // ... your aggregation pipeline for yearlyChart
      ])
    ]);

    const yearlyData = yearlyChart.map((item) => item.totalSales);

    return res.render("Admin/dashboard", {
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
      yearlyData,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


  





 


















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

    console.log(allOrders[0].products.product)  
    res.render('Admin/orders/salesReport',{orders:allOrders, error:req.flash('error')})
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}


exports.downloadSalesReport = async (req,res)=>{
  try {
    const data = req.body
    console.log(data)
    let dataLength;
    let transformedData=[]
    if( Array.isArray(data.orderId) ){
      dataLength = data.orderId.length
      for(let i=0; i<dataLength; i++){
        transformedData.push({
            orderDate: data.orderDate[i],
            deliveredOn: data.deliveredOn[i],
            orderId: data.orderId[i],
            products:data.ProductsName[i],
            paymentMethod:data.paymentMethod[i],
        })
      }
    }else{
       dataLength = 1
       transformedData = [];
      transformedData.push({
        orderDate: data.orderDate,
        deliveredOn: data.deliveredOn,
        orderId: data.orderId,
        products:data.ProductsName,
        paymentMethod:data.paymentMethod,
      })

    }
    // const transformedData = [];
    // for(let i=0; i<dataLength; i++){
    //     transformedData.push({
    //         orderDate: data.orderDate[i],
    //         deliveredOn: data.deliveredOn[i],
    //         orderId: data.orderId[i],
    //         products:data.ProductsName[i],
    //         paymentMethod:data.paymentMethod[i],
    //     })
    // }
    console.log(transformedData)
    const fields = ['orderDate',"orderId","deliveredOn","products","paymentMethod"]
    const csv = json2csv.parse(transformedData, { fields });
    res.attachment('salesReport.csv');
    res.status(200).send(csv);

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
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
};


exports.showAdd =async (req, res) => {
  try {
    const offers = await Offer.find({deleted:false})
    res.render("Admin/categories/new",{offers, error:req.flash('error')});
    
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
};

exports.CreateCategory = async (req, res) => {
  try {
    const { name, photo } = req.body;
    if (name.length === 0 || photo.length === 0){
      req.flash('error','All fields are required')
      res.redirect('/admin/category/create')
    }
    const duplicateCategory =await Category.find({name:{ $regex: new RegExp('^' + req.body.name + '$', 'i') } } )
    if(duplicateCategory.length){
      req.flash('error','category already exists')
      res.redirect('/admin/category/create')
    }
    else{
      let offer;
      if(req.body.offerId !== '-1'){
        offer = req.body.offerId
      }else{
        offer=null
      }  
      await Category.create({
        name,
        offer,
        image: "/category/" + photo,
      });
      req.flash('success','category added successfully')
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}


exports.showEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    const offers = await Offer.find({deleted:false})
    res.render("Admin/categories/edit", { category, offers, error:req.flash('error') })   
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
};


exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, photo } = req.body;
  try {
    const category = await Category.findById(id);
    const duplicateCategory =await Category.find({name:{$ne: category.name, $regex: new RegExp('^' + req.body.name + '$', 'i') } } )
    if(duplicateCategory.length){
      req.flash('error','category already exists')
      return  res.redirect(`/admin/categories/${id}/edit`)
    }

    let offer;
    if(req.body.offerId !== '-1'){
      offer = req.body.offerId
      const choosedoffer = await Offer.findById(offer)
      let categoryProducts = await Product.find({category:id})
      console.log(categoryProducts)

      if(categoryProducts){  
         for(let i=0;i<categoryProducts.length;i++){
           let price =categoryProducts[i].price
           let categoryOfferPrice = categoryProducts[i].categoryOfferPrice

           categoryOfferPrice = (choosedoffer.discount/100) * price
           categoryOfferPrice = Math.ceil(price-categoryOfferPrice)
           categoryProducts[i].categoryOfferPrice = categoryOfferPrice
           await categoryProducts[i].save()

        }
      }
      console.log(categoryProducts)
    }else{
      offer=null
      let categoryProducts = await Product.find({category:id})
      if(categoryProducts){
        for(let i=0;i<categoryProducts.length;i++){
          categoryProducts[i].categoryOfferPrice = 0
          categoryProducts[i].save()
        }
      }
    }  

    
      let updatedObj = {
        name,
        offer,
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
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
};
      

exports.destroyCategory = async (req, res) => {
  const id = req.body.id;
  const state = Boolean(req.body.state);
  try {
     await Category.findByIdAndUpdate(
      id,
      { $set: { isDestroyed: state } },
      { new: true }
    );
    return res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}
  


//products managment
exports.showProducts= async (req,res)=>{
    const products = await Product.find({}).populate('category')
    res.render('Admin/products/products',{products, success:req.flash('success')})
}

exports.showAddProduct= async (req,res) => {
    const categories = await Category.find({})
    const offers = await Offer.find({deleted:false})
    res.render('Admin/products/new', { categories,offers })
}

exports.createProduct = async (req, res) => {
    const { name, description, price, images, stock, category } = req.body
    const imagesWithPath = images.map(img => '/products/' + img)
    try {
        const choosedCategory  = await Category.findById(category).populate('offer')
        if(choosedCategory.offer && choosedCategory.offer.status === 'Available'){
            const cOffer = choosedCategory.offer
            console.log(cOffer);
            var categoryOfferPrice = (cOffer.discount/100) * price
            categoryOfferPrice = Math.ceil(price-categoryOfferPrice)
        }

 
 
          

        let offerPrice
        let offerId
        if(req.body.offerId !== '-1'){
          const offer = await Offer.findById(req.body.offerId)
          offerPrice = (offer.discount/100) * price
          offerPrice =Math.ceil(price - offerPrice)
          offerId = req.body.offerId
        }else{
          offerPrice = 0
          offerId=null
        }     
        await Product.create({
            name,
            description,
            stock,
            price,
            offer:offerId,
            offerPrice,
            categoryOfferPrice,
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
      const offers = await Offer.find({deleted:false })
      res.render('Admin/products/edit',{ product, category, offers, success:req.flash('success') })
  } catch (error) {
      console.log(error.message)
  }
}

exports.updateProduct = async (req, res) => {
  const { id } = req.params
  const { name, description, price, stock, category} = req.body
  try {
        let offerPrice
        let offerId
    
        if(req.body.offerId !== '-1'){
          const offer = await Offer.findById(req.body.offerId)
          offerPrice = (offer.discount/100) * price
          offerPrice =Math.ceil( price - offerPrice )
          offerId = req.body.offerId
        }else{
          offerPrice = 0
          offerId=null
        }     
    await Product.findByIdAndUpdate(id, {$set: {
      name,
      description,
      price,
      stock,
      category,
      offer:offerId,
      offerPrice
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
      res.render('Admin/products/products',{products})
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
      console.log(error.message)
        res.status(500).send('Internal Server Error');
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


