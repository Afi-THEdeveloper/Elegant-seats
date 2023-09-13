const order=require ('../model/orderModel')
const Address=require('../model/addressModel')
const User=require('../model/userModel')
const crypto=require('crypto')
const Order = require('../model/orderModel')

//checkout
exports.showCheckout=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user).populate('cart.product')
        if(user.cart.length){
            const defAddress=await Address.findById(user.defaultAddress)
            res.render('user/checkout',{user,defAddress,error:req.flash('error')})
        }else{
            req.flash('error','cart is empty')
            res.redirect('/cart')
        }

        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.placeOrder=async (req,res)=>{
    try {
        if(!req.body.paymentMethod){
            req.flash('error','please select a payment Method')
            return res.redirect('/cart/checkout')
        }
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
            paymentMethod:req.body.paymentMethod
        })

        await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0}})
        req.flash('success','Order placed successfully')
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
        // console.log(orderDetails)
        
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
    await Order.findOneAndDelete({orderId:req.body.orderId})
    res.redirect('/myOrders')
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}







       
        
