const fs = require('fs')
const path = require('path')
const Banner = require('../model/bannerModel');



exports.showBannerIndex = async  (req,res) => {
    const banners = await Banner.find({})
    res.render('Admin/Banner/index', { banners })
};

exports.showCreatebanner = (req,res)=>{ res.render('Admin/Banner/Add') }


exports.createBanner  = async (req,res) => {
    const { heading ,images} = req.body
    console.log(images);
    const imagesWithPath = images.map(img => '/banners/' + img)
    try{
        await Banner.create({
            heading,
            images:imagesWithPath
        })
    
        res.redirect('/admin/Banners')
    }catch(error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showBannerEdit = async (req,res)=>{
    try {
        const banners = await Banner.findById(req.params.id)
        res.render('Admin/Banner/edit', {banners})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.updateBanner = async (req,res) => {
    try {
        const { id } = req.params;
        const { heading } =req.body;
        await Banner.findByIdAndUpdate(id,{$set:{
            heading
        }},{new:true})
    
        res.redirect('/admin/Banners')
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.updateBannerImages =  async (req,res) => {
    try {
        const { id } = req.params;
        const { images } = req.body;
        let imagesWithPath
        if(images.length){
            imagesWithPath = images.map(image => '/banners/' + image)
        }
        await Banner.findByIdAndUpdate(id, {$push: { images: imagesWithPath }}, { new: true })
        res.redirect(`/admin/Banners/${id}/edit`)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.destroyBannerImage =  async (req,res) => {
    try {
        const { id } = req.params
        const { image } = req.body
        await Banner.findByIdAndUpdate(id,{$pull: { images: image}}, {new: true})
        fs.unlink(path.join(__dirname,'../public', image), (err)=>{
            if(err)console.log(err);
        })
        res.redirect(`/admin/banners/${id}/edit`)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}



exports.deleteBanner = async (req,res) => {
    try {
        const id  = req.body.id;
        const state = Boolean(req.body.state)
        await Banner.findByIdAndUpdate(id, {$set:{ is_deleted: state} }, { new: true });
        res.redirect('/admin/Banners')
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}