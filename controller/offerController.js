const Offers = require('../model/offerModel')
const Products = require('../model/productModel')

exports.showOffers = async (req,res)=>{
    try {
        const offers = await Offers.find({})
        res.render('Admin/offers/index',{offers, success:req.flash('success')})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showAddOffer = async (req,res)=>{ res.render('Admin/offers/addOffer',{error:req.flash('error') }) }

exports.createOffer = async (req,res)=>{
    try {
        console.log(req.body)
        const {name,Discount,startDate,Expiry } = req.body
        const offerName = name.toUpperCase()
        const isOfferExists = await Offers.findOne({ name: { $regex: new RegExp('^' + offerName + '$', 'i') } });

        if(isOfferExists){
            req.flash('error','offer already exists')
            return res.redirect('/admin/offers/create')
        }

        if(new Date(startDate) >= new Date(Expiry) || new Date(Expiry) < new Date() ){
            req.flash('error', 'date must be today or after')
            return res.redirect('/admin/offers/create')
        }

        let status;
        if(new Date(startDate) <= new Date()){
            status = 'Available'
        }else if(new Date(startDate) > new Date()){
            status = 'Starting Soon'
        }

        await Offers.create({
            name,
            discount:Discount,
            startingDate:startDate,
            expiryDate:Expiry,
            status 
        })
        res.redirect('/admin/offers')


    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.showEditOffer = async (req,res)=>{
    try {
        const offer = await Offers.findById(req.params.id)
        res.render('Admin/offers/edit', {offer, error:req.flash('error') })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.updateOffer  = async (req,res)=>{
    try {
        console.log(req.body)
        const id = req.body.offerId
        const {name,Discount,startDate,Expiry } = req.body
        const offer = await Offers.findById(id)
        const isOfferExists = await Offers.findOne({ name:{$ne:offer.name, $regex: new RegExp('^' + name + '$', 'i') } });

        if(isOfferExists){
            req.flash('error','offer already exists')
            return res.redirect(`/admin/offers/${id}/edit`)
        }

        if(new Date(startDate) >= new Date(Expiry) || new Date(Expiry) < new Date() ){
            req.flash('error', 'date must be today or after')
            return res.redirect(`/admin/offers/${id}/edit`)
        }

        let status;
        if(new Date(startDate) <= new Date()){
            status = 'Available'
        }else if(new Date(startDate) > new Date()){
            status = 'Starting Soon'
        }

        const offerExistingProducts = await Products.find({offer:id})
        if(offerExistingProducts){
            for(let i=0;i<offerExistingProducts.length;i++){
                let price =offerExistingProducts[i].price
                let offerPrice = offerExistingProducts[i].offerPrice

                offerPrice = (Discount/100) * price
                offerPrice = Math.ceil(price-offerPrice)
                offerExistingProducts[i].offerPrice = offerPrice
                await offerExistingProducts[i].save()
            }
            
        }
        
        await Offers.findByIdAndUpdate(id,{$set:{
            name,
            discount:Discount,
            startingDate:startDate,
            expiryDate:Expiry,
            status 
        }},{new:true})

        req.flash('success','offer updated successfully')
        res.redirect('/admin/offers')
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.destroyOffer = async (req, res) => {
    const id = req.body.id;
    const state = Boolean(req.body.state);
    try {

    if(state === true){
        const offerExistingProducts = await Products.find({offer:id})
        if(offerExistingProducts){
           for(let i=0;i<offerExistingProducts.length;i++){
              offerExistingProducts[i].offerPrice = 0
              offerExistingProducts[i].offer = null
              await offerExistingProducts[i].save()
           }
        }
    }


      await Offers.findByIdAndUpdate(
        id,
        { $set: { deleted: state } },
        { new: true }
      );
      return res.redirect("/admin/offers");
    } catch (error) {
      console.log(error.message);
    }
}
 
