const User =require('../model/userModel')
const Address=require('../model/addressModel')
const Order= require('../model/orderModel')

//profile
exports.showProfile=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        res.render('user/account/profile',{user,success:req.flash('success')})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.showEditProfile=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        res.render('user/account/editProfile',{user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.updateProfile=async (req,res)=>{
    try {
        const data = {
            name: req.body.name,
            mobile:req.body.phone,
            profile:req.body.image
        }
        await User.findByIdAndUpdate({_id:req.session.user},data);
        res.redirect('/profile');
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}



exports.showAddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        const addresses=await Address.find({userId:req.session.user})
        res.render('user/account/address',{addresses,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showAddaddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user) 
        res.render('user/account/addAddress',{user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.addAddress=async (req,res)=>{
    try {
        const address =await Address.create({
            userId:req.session.user,
            name:req.body.name,
            pincode: req.body.pincode,
            district:req.body.district,
            locality:req.body.locality,
            address:req.body.address,
            phone:req.body.phone,
            alternativePhoneNumber:req.body.altNo,
            landMark:req.body.landMark,
            state:req.body.state
    })
    const user = await User.findById({_id:address.userId})
    user.address.push(address._id);
    user.save();
    res.redirect("/profile/address")
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.showEditaddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        const address=await Address.findById(req.params.id)
        res.render('user/account/editAddress',{address,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.editAddress=async (req,res)=>{
    try {
        const updatedAddress = {
            name:req.body.name,
            pincode: req.body.pincode,
            district:req.body.district,
            locality:req.body.locality,
            address:req.body.address,
            phone:req.body.phone,
            alternativePhoneNumber:req.body.altNo,
            landMark:req.body.landMark,
            state:req.body.state
        }
        await Address.updateOne({_id:req.params.id},updatedAddress);
        res.redirect('/profile/address');
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.setDefaultAddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        const userAddresses=await Address.find({userId:user._id})
        let newDefault
        const oldDefault=await Address.findOne({defaultAddress:true})
        if(!oldDefault){
            newDefault=await Address.findByIdAndUpdate({_id:req.body.id},{defaultAddress:true},{new:true})
        }else{
            await Address.updateOne({defaultAddress:true},{defaultAddress:false})
            newDefault=await Address.findByIdAndUpdate({_id:req.body.id},{defaultAddress:true},{new:true})
        }
        user.defaultAddress=newDefault._id
        await user.save()
        res.redirect('/profile/address')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.deleteAddress=async (req,res)=>{
    try {
        await Address.deleteOne({_id:req.params.id});
        const samedDeliveryAddress=await Order.find({deliveryAddress:req.params.id})
        res.redirect('/profile/address')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}



