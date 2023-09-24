const mongoose=require('mongoose')
const order=require ('../model/orderModel')
const Address=require('../model/addressModel')
const User=require('../model/userModel')
const Order = require('../model/orderModel')
const Coupon = require('../model/couponModel')
const crypto=require('crypto')
const { Cookie } = require('express-session')


exports.showCoupons=async (req,res)=>{
    try {
        const coupons=await Coupon.find({})
        res.render('Admin/coupons/index',{coupons})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.showAddcoupon=async (req,res)=>{
    try {
        res.render('Admin/coupons/addCoupon',{ error:req.flash('error')})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


//coupon code generator
function generateCouponCode() {
    
  const codeRegex = /^[A-Z0-9]{5,15}$/;
  let code = '';
  while (!codeRegex.test(code)) {
    code = Math.random().toString(36).substring(7);
  }
  return Coupon.findOne({ code })
    .then(existingCoupon => {
      if (existingCoupon) {
          return generateCouponCode();// If the code is not unique, generate a new one recursively
        }
        return code; // Return the unique code
      });
}

exports.addCoupon=async (req,res)=>{
    try {
        const {codePrefix,description,discountType,discountAmount,minPurchase,usageLimit,expiryDate} =req.body
        let couponCode =await generateCouponCode()
        couponCode=codePrefix + couponCode
        
        await Coupon.create({
            code:couponCode,
            codePrefix,
            description,
            discountType,
            discountAmount,
            minPurchase,
            usageLimit,
            expiryDate
        })

        res.redirect('/admin/coupons')

        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showEditCoupon=async (req,res)=>{
    try {
        const coupon= await Coupon.findById(req.params.id)
        res.render('Admin/coupons/editCoupon',{coupon})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.updateCoupon=async (req,res)=>{
    try {
        const {codePrefix,description,discountType,discountAmount,minPurchase,usageLimit,expiryDate} =req.body
        let couponCode =await generateCouponCode()
        couponCode=codePrefix + couponCode

        await Coupon.findByIdAndUpdate(req.params.id,{$set: {
            code:couponCode,
            codePrefix,
            description,
            discountType,
            discountAmount,
            minPurchase,
            usageLimit,
            expiryDate
        }},{ new: true })
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.validateCoupon = async (req, res) => {
    try {
      const userId = req.session.user;
      const couponCode = req.body.couponCode;
      let orderTotal = req.body.orderTotal;
  
      // Find the user
      const user = await User.findById(userId);
      
  
      const coupon = await Coupon.findOne({ code: couponCode });
      console.log(coupon.discountAmount)
      if (!coupon) {
        req.flash('error','Invalid coupon')
        return res.json({ invalidCoupon: true, error:req.flash('error') });
      }

      

      if ( orderTotal < coupon.minPurchase || user.cart.length < 3) {
        req.flash('error','You do not meet the coupon criteria')
        return res.json({ criteriaFailure: true, error:req.flash('error') });
      }
  
      const usedUser = coupon.usedUsers.find((item) => item.usedUser.toString() === userId);
      if (usedUser) {
        if (usedUser.usedCount >= coupon.usageLimit) {
          req.flash('error','Usage limit exceeded')
          return res.json({ usageLimit: true, error:req.flash('error') });
        }
      } 
       
      
      req.session.couponCode=couponCode
      const discount = coupon.discountAmount
      orderTotal= orderTotal - discount
      return res.json({ validCoupon: true , discount, orderTotal});
      
     
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }


  exports.destroyCoupon = async (req,res)=>{
    const id = req.body.id;
    const state = Boolean(req.body.state);
    try {
      await Coupon.findByIdAndUpdate(
        id,
        {$set: { isCancelled: state }},
        { new: true }
      );
      return res.redirect('/admin/coupons')
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }

  
  
  
      
  
            
        

        

        
        



