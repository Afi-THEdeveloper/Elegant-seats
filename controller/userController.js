const User=require('../model/userModel')
const Products=require('../model/productModel')
const Category=require('../model/categoryModel')
const bcrypt=require('bcrypt')
require('dotenv').config()
const email=require('../util/email')
const randomString=require('randomstring')
const cookie=require('cookie')

const mongoose = require('mongoose')




//hashing  password 
const securePassword=async (password)=>{
    try {
        const passwordHash=await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}

exports.showLogin= (req,res)=>{
    res.render('user/login')
}
exports.showRegister= (req,res)=>{
    res.render('user/register')
}

exports.showHome=async(req,res)=>{
    try {
        const products=await Products.find({})
        const categories=await Category.find({})
        res.render('user/index',{ products,categories})
    } catch (error) {
        console.log(error.message)
    }
}
        



// insert form data into database as an user
exports.insertUser=async (req,res)=>{
    try {
        const {password,Cpassword}=req.body
        if(password !== Cpassword){
            return res.render('user/register',{error:'confirm password must be same as password'})
        }
        const userExists=await User.findOne({email:req.body.email}) 
        if(userExists){
          return res.render('user/register',{error:'user already exists'})
        }
        const secpassword=await securePassword(req.body.password)
        const otp =randomString.generate({
            length:4,
            charset:'numeric'
        })
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:secpassword,
            mobile:req.body.mobile,
            otp:otp
        })
        const userData=await user.save()
       

        //otp
        if(userData){
            const options={
                from:process.env.EMAIL,
                to:req.body.email,
                subject:'elegant seats verification otp',
                html:`<center> <h2>Verify Your Email </h2> <br> <h5>OTP :${otp} </h5><br><p>This otp is only valid for 1 minutes only</p></center>`
            }
            //set cookie to get userid where no session available
            res.cookie('userId',String(user._id),{
                maxAge: 60000 * 60 * 24 * 7,
                httpOnly:true
            })
            
            req.session.user=user._id
            await email.sendMail(options)
            res.redirect('/verifyOtp')
        }else{
            res.render('user/register',{error:'your registration has been failed'})
        }
    } catch (error) {
        console.log(error.message)
    }
}


exports.validlogin = async (req, res)=>{
    const {Email,password}=req.body
    try {
        const user = await User.findOne({email:Email}) //validate email
        
        if(!user){
            return res.render('user/login',{ error:'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)  //validate password
        if (!isMatch){ 
            return res.render('user/login',{ error:'password is invalid' })
        }
        
        if(user){
            
            if(user.blocked){
                res.render('user/login',{error:'Sorry,you are blocked by the admin'})
            }else{
                //set cookie to get userid where no session available
                res.cookie('userId',String(user._id),{
                    maxAge: 60000 * 60 * 24 * 7,
                    httpOnly:true
                })

                req.session.user=user._id
                res.redirect('/')
            }
        }
    }catch (error) {
        console.log(error.message);
    }
}

exports.showVerify= (req,res)=>{
    try {
        res.render('user/emailVerify',{error:req.flash('error')})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.verifyEmail=async (req,res)=>{
    try {
        const user=await User.findOne({email:req.body.email})
        if(!user){
            return res.render('user/login',{error:'email not found'})
        }

        //otp
        const newOtp =randomString.generate({
            length:4,
            charset:'numeric'
        })
        const options={
            from:process.env.EMAIL,
            to:req.body.email,
            subject:'elegant seats verification otp',
            html:`<center> <h2>Verify Your Email </h2> <br> <h5>OTP :${newOtp} </h5><br><p>This otp is only valid for 1 minutes only</p></center>`
        }
        res.cookie('userId',String(user._id),{
            maxAge: 60000 * 60 * 24 * 7,
            httpOnly:true
        })
        user.otp=newOtp
        await user.save()
        await email.sendMail(options)

        let userId=user._id
        res.redirect(`/verifyOtp/${userId}`);

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}




exports.updatePassword=async (req,res)=>{
    try {
        const {password,Cpassword}=req.body
        if(password !== Cpassword){
           req.flash('error','password and confirm password must be same')
           return res.redirect('/editPassword')
        }
        const user=await User.findById(req.cookies.userId)
        const secpassword=await securePassword(password)
        user.password=secpassword
        await user.save()
        //reset password
        if(req.session.user){
            req.flash('success','password updated successfully')
            res.redirect('/profile')
        }
        //forgot password
        else{
            res.redirect('/login')
        } 
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}
        
        

exports.resendOtp=async (req,res)=>{
    try {
        const userId=req.session.user  || req.cookies.userId
        const newOtp =randomString.generate({
            length:4,
            charset:'numeric'
        })
        await User.findByIdAndUpdate(userId,{otp:newOtp})
        const user=await User.findById(userId)
        const options = {
            from: process.env.EMAIL,
            to: user.email, // Use the user's email stored in the database
            subject: 'elegant seats verification otp',
            html: `<center> <h2>Verify Your Email</h2> <br> <h5>OTP :${newOtp} </h5><br><p>This OTP is only valid for 1 minute</p></center>`
        }
        await email.sendMail(options)
        res.redirect('/verifyOtp')
    } catch (error) {
        console.log(error.message)
    }
}
        

        
exports.showVerifyOtp= (req,res)=>{
    if(req.params.id){
        return res.render('user/validOtp',{ userId:req.params.id,error:req.flash('error') })
    }
    else{
        return res.render('user/validOtp',{userId:null,error:req.flash('error')})
    }

}

exports.verifyOtp=async (req,res)=>{
    const otp =req.body.otp
    try {
        const user = await User.findOne({otp})
        if(!user){
            req.flash('error', 'invalid Otp');
            res.redirect('/verifyOtp')
        }
        else{
            const isVerified=await User.findOneAndUpdate({_id:user._id},{$set:{verified:true}},{new:true})
            if(isVerified.verified){
                res.redirect('/')
            }
            else{
                res.redirect('/verifyOtp')
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

exports.showEditPassword=async (req,res)=>{
    try {
        res.render('user/editPassword', {error:req.flash('error')} )
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}
        
exports.forgetVerifyOtp=async (req,res)=>{
    const otp =req.body.otp
    try {
        const user = await User.findOne({otp})
        
        if(!user){
            const userId=req.cookies.userId
            req.flash('error','invalid Otp');
            res.redirect(`/verifyOtp/${userId}`)
        }
        else{
            const isVerified=await User.findOneAndUpdate({_id:user._id},{$set:{verified:true}},{new:true})
            if(isVerified.verified){
                res.redirect('/editPassword')
            }
            else{
                const userId=user._id
                req.flash('error', 'not verified');
                res.redirect(`/verifyOtp/${userId}`)
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}
        





//products 

exports.showShop=async (req,res)=>{
    try {
        
        const categories= await Category.find({isDestroyed:false})
        const pageNumber = req.body.pageNumber || 0;
        const productsPerPage = 6;
        let neededFilter;

        if(req.query.category){  
          console.log(req.query.category)
          neededFilter={ 'category.isDestroyed':false, 'category.name':req.query.category}
        }else if(req.query.min && req.query.max){
            let min=parseInt(req.query.min) || 0
            let max=parseInt(req.query.max) || Number.MAX_SAFE_INTEGER
            neededFilter={ 'category.isDestroyed':false, price:{ $gte:min,$lte:max } }
        }else if(req.body.searchItem){
            const searched=req.body.searchItem
            neededFilter={'category.isDestroyed':false, name:{ $regex: ".*" +searched+ ".*", $options:'i'}  }  
        }
        else{
            neededFilter={'category.isDestroyed':false}
        }

      
        const aggragationPipeline =[
            {
                $lookup:{
                    from:'categories',
                    localField:'category',
                    foreignField:'_id',
                    as:'category'
                }
            },
            {
                $unwind:'$category'
            },
            {
                $match:neededFilter
            },
            {
                $facet:{
                  products:[
                    {
                        $skip:pageNumber * productsPerPage
                    },
                    {
                        $limit:productsPerPage
                    }
                  ],
                  totalPages:[
                    {
                        $count:'total'
                    }
                  ]
                }
            }
        ]

        const prdt = await Products.aggregate(aggragationPipeline);
        let totalPages = prdt[0].totalPages[0].total;
        totalPages = Math.ceil(totalPages/6)
        const products = prdt[0].products;
        res.render('user/shop', { products, totalPages, categories});
                
        
    } catch (error) {
        console.log(error.message)
    }
}


        
//search 
// exports.searchProduct= async (req,res)=>{
//     try {
//         const searched=req.body.searchItem
//         const searchedProduct = await Products.find({ name:{ $regex:".*"+searched+".*", $options:'i' }  }) 
//         console.log(searchedProduct)
//         if(searchedProduct.length > 0){

//         }else{
//             res.redirect('/')
//         }
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).send('Internal Server Error');
//     }
// }
                    
                
            
           




        
      



exports.showSingle=async (req,res)=>{
   
    try {
        const product=await Products.findOne({_id:req.params.id})
        const category=await Category.findOne({_id:product.category})
        res.render('user/singleView',{product,category})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}
        




//cart
exports.showCart=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user).populate('cart.product')  
        const cart=user.cart
        const totalCartAmount=user.totalCartAmount   
        res.render('user/cart',{success:req.flash('success'), error:req.flash('error'), cart,totalCartAmount,user})       
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.addTocart=async (req,res)=>{
    
    try {
        const quantity=parseInt(req.body.quantity) || 1
        let productid;
        if(req.body.productId){
            productid=req.body.productId
        }else{
            productid=req.params.id
        }
        const product=await Products.findById(productid)
        const user=await User.findById(req.session.user)
        const total=quantity*product.price

        let totalCartAmount = 0;
        user.cart.forEach(item => {
           totalCartAmount +=  item.total;
        })
        const existingCartItemIndex=await user.cart.find(item=> item.product.equals(product._id))
        if(existingCartItemIndex){
            existingCartItemIndex.quantity+=quantity
            existingCartItemIndex.total+=total
            user.totalCartAmount= (totalCartAmount + total)
        }
        else{
            user.cart.push({product:product._id,quantity,total})
            user.totalCartAmount = (totalCartAmount + total);
        }
       await user.save()

       //to redirect to origin page
       const referer = req.headers.referer;
       const originalPage = referer || '/';
       res.redirect(originalPage)
    }catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}
       
exports.destroyCartItem =async (req,res) => {
    try {
        const userId = req.session.user; 
        const user = await User.findById(userId)
        const cartItemId = req.params.id
       
        const cartIndex = user.cart.findIndex((item) => item._id.equals(cartItemId) )
        if(cartIndex !== -1){
           user.totalCartAmount = user.totalCartAmount - user.cart[cartIndex].total
           user.cart.splice(cartIndex,1);
           await user.save();
        }
        req.flash('error','item removed')
        res.redirect('/cart')
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.updateCartQauntity = async  (req,res) => {
    
    try {
        const user = await User.findById(req.session.user);
        const cartItemId = req.body.cartItemId;
        const newQuantity = req.body.quantity; 
        
        // Find the cart item by its ID
        const cartItem = user.cart.find(item => item._id.equals(cartItemId));
        
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Calculate the new total based on the product's price and new quantity
        const product = await Products.findById(cartItem.product);

        if(newQuantity > product.stock){
            return res.json({stock:product.stock});
        }
            
        const newTotal = newQuantity * product.price;
        
        // Update cart item properties
        cartItem.quantity = newQuantity;
        cartItem.total = newTotal;
        
        let totalCartAmount = 0;
        user.cart.forEach(item => {
            totalCartAmount += item.total;
        });
        user.totalCartAmount = totalCartAmount;
        await user.save();
        res.json({ message: 'Cart item quantity updated successfully',totalCartAmount, total: newTotal });
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');

    }
}
        
        
       
        
        
        




//logout

exports.logout= (req,res)=>{
    req.session.user=null
    res.redirect('/')
}
  



    








