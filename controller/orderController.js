const order=require ('../model/orderModel')
const Address=require('../model/addressModel')
const User=require('../model/userModel')
const Product= require('../model/productModel')
const Coupon = require('../model/couponModel')
const crypto=require('crypto')
const Order = require('../model/orderModel')
const Razorpay = require('razorpay')

//checkout
exports.showCheckout=async (req,res)=>{
    try {
      const user=await User.findById(req.session.user).populate('cart.product')
      const coupons= await Coupon.find({})
      //buy single
       if(req.params.id){
         var singleproduct = await Product.findById(req.params.id)
         const defAddress=await Address.findById(user.defaultAddress)
         return res.render('user/checkout',{singleproduct,user,defAddress,coupons, error:req.flash('error')})
       }

        //cart checkout
        if(user.cart.length){
            const defAddress=await Address.findById(user.defaultAddress)
            res.render('user/checkout',{user,defAddress,coupons, error:req.flash('error'), singleproduct})
        }else{
            req.flash('error','cart is empty')
            res.redirect('/cart')
        }
      } catch (error) {
          console.log(error.message)
          res.status(500).send('Internal Server Error');
      }
  }

    
  
 var razorpay = new Razorpay({
   key_id: process.env.KEY_ID,
   key_secret:process.env.KEY_SECRET
 }) 

exports.placeOrder=async (req,res)=>{
    
        if(!req.body.paymentOptions){
            req.flash('error','please select a payment Method')
            return res.redirect('/cart/checkout')
        }

      const paymentMethod = req.body.paymentOptions
      if(paymentMethod === 'cod'){
        try{
          const user=await User.findById(req.session.user)
          if(!user.defaultAddress){
            req.flash('error','please add an Address')
            return res.redirect('/cart/checkout')
          }
          const orderId = crypto.randomUUID();
          const order=await Order.create({
              orderId,
              customer:user._id,
              products:user.cart,
              totalPrice:user.totalCartAmount,
              deliveryAddress:user.defaultAddress,
              paymentMethod:'cod'
          })
          
          const orderDetails = await Order.aggregate([
            {
                $match:{
                  orderId:orderId
                }
            },
            {
                $unwind:'$products'
            },
            {
              $lookup: {
                from: "products", 
                localField: "products.product", 
                foreignField: "_id", 
                as: "products.product" 
              }
            },
            
          ]);
          
          
         console.log(orderDetails)
         for(let i=0;i<orderDetails.length;i++){
           let productId=orderDetails[i].products.product[0]._id
           let orderQuantity = orderDetails[i].products.quantity
           console.log(productId)
           console.log(orderQuantity)
           let product = await Product.findById(productId)
           let stock=product.stock
           let newStock = stock - orderQuantity
           console.log('stock',stock)
           console.log('newStock',newStock)
           await Product.updateOne({_id:productId}, {$set:{stock:newStock}})
          }


          await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0}})
          req.flash('success','Order placed successfully')
          res.redirect('/myOrders')
        } catch(error) {
          console.log(error.message)
          res.status(500).send('Internal Server Error');
        } 

      }



      if(paymentMethod === 'razorpay'){
        try {
             
             const user = await User.findById(req.session.user)
             const totalCartAmount = user.totalCartAmount * 100

             const options = {
               amount: totalCartAmount, // Amount in paise
               currency: 'INR',
               receipt: crypto.randomBytes(4).toString('hex'),
             }
       
             const order = await razorpay.orders.create(options);
            //  const newOrder = new Order({
            //    customer:user._id,
            //    orderId:order.id,
            //    paymentMethod: 'Razorpay',
            //    totalPrice:totalCartAmount/100,
            //    deliveryAddress:user.defaultAddress,
            //    products:user.cart
            //  });
            //  await newOrder.save()

        //      const orderDetails = await Order.aggregate([
        //       {
        //           $match:{
        //             orderId:order.id
        //           }
        //       },
        //       {
        //           $unwind:'$products'
        //       },
        //       {
        //         $lookup: {
        //           from: "products", 
        //           localField: "products.product", 
        //           foreignField: "_id", 
        //           as: "products.product" 
        //         }
        //       },
              
        //     ]);
              
              

            
        //  console.log(orderDetails)
        //  for(let i=0;i<orderDetails.length;i++){
        //    let productId=orderDetails[i].products.product[0]._id
        //    let orderQuantity = orderDetails[i].products.quantity
        //    console.log(productId)
        //    console.log(orderQuantity)
        //    let product = await Product.findById(productId)
        //    let stock=product.stock
        //    let newStock = stock - orderQuantity
        //    console.log('stock',stock)
        //    console.log('newStock',newStock)
        //    await Product.updateOne({_id:productId}, {$set:{stock:newStock}})
        // }
        
        // await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0}})
        return res.render('user/razorpay-checkout', { order, key_id: process.env.KEY_ID, user });
        
      } catch (error) {
            console.error('Razorpay error:', err)
            req.flash('error', 'Razorpay payment failed. please try again.')
            return res.redirect('/cart/checkout')
      }
    }
}


  
exports.createOrder = async (req,res)=>{
  try {
    const user=await User.findById(req.session.user)
    const totalCartAmount = user.totalCartAmount * 100
    const newOrder = new Order({
      customer:user._id,
      orderId:req.query.orderId,
      transactionId:req.query.transactionId,
      paymentMethod: 'Razorpay',
      totalPrice:totalCartAmount/100,
      deliveryAddress:user.defaultAddress,
      products:user.cart
    });
    await newOrder.save()

    const orderDetails = await Order.aggregate([
              {
                  $match:{
                    orderId:req.params.id
                  }
              },
              {
                  $unwind:'$products'
              },
              {
                $lookup: {
                  from: "products", 
                  localField: "products.product", 
                  foreignField: "_id", 
                  as: "products.product" 
                }
              },
              
            ]);
              
              
            console.log(orderDetails)
            for(let i=0;i<orderDetails.length;i++){
              let productId=orderDetails[i].products.product[0]._id
              let orderQuantity = orderDetails[i].products.quantity
              console.log(productId)
              console.log(orderQuantity)
              let product = await Product.findById(productId)
              let stock=product.stock
              let newStock = stock - orderQuantity
              console.log('stock',stock)
              console.log('newStock',newStock)
              await Product.updateOne({_id:productId}, {$set:{stock:newStock}})
           }

           await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0}})
           res.redirect('/myOrders')
            
        
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}





exports.showOrders=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        const myOrders = await Order.aggregate([
            {
                $match:{
                  customer: user._id
                }
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
          ]);
        // console.log(myOrders)
        res.render('user/account/myOrders',{user,orders:myOrders})

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.orderDetails=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        let orderid;
        if(req.body.orderId){
          orderid=req.body.orderId
        }else if(req.params.id){
          orderid=req.params.id
        }
        
        const orderDetails = await Order.aggregate([
            {
                $match:{
                  orderId:orderid
                }
            },
            {
              $sort: { orderDate: -1 }
            },
            {
                $unwind:'$products'
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
          ]);
          
          
        if(req.body.orderId){
          res.render('user/account/orderDetails',{user,details:orderDetails})
        }
        else if(req.params.id){
          res.render('Admin/orders/AorderDetails',{details:orderDetails})
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


//admin orders table

exports.showOrdersTable=async (req,res)=>{
  try {
    const allOrders=await Order.aggregate([
        
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
    res.render('admin/orders/Aorders',{orders:allOrders})
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}


exports.updateStatus=async (req,res)=>{
  try {
     await Order.findOneAndUpdate({_id:req.body.orderId},{$set:{status:req.body.status}})
     res.redirect('/admin/ordersTable')
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}


exports.cancelOrder=async (req,res)=>{
  try {
    await Order.findOneAndUpdate({orderId:req.body.orderId}, {$set:{status:'Cancelled'}} )
    const orderDetails = await Order.aggregate([
      {
          $match:{
            orderId:req.body.orderId
          }
      },
      {
          $unwind:'$products'
      },
      {
        $lookup: {
          from: "products", 
          localField: "products.product", 
          foreignField: "_id", 
          as: "products.product" 
        }
      },
      
    ]);
      
      

    
 console.log(orderDetails)
 for(let i=0;i<orderDetails.length;i++){
   let productId=orderDetails[i].products.product[0]._id
   let orderQuantity = orderDetails[i].products.quantity
   console.log(productId)
   console.log(orderQuantity)
   let product = await Product.findById(productId)
   let stock=product.stock
   let newStock = stock + orderQuantity
   console.log('stock',stock)
   console.log('newStock',newStock)
   await Product.updateOne({_id:productId}, {$set:{stock:newStock}})
 }

    res.redirect('/myOrders')
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}







       
        
