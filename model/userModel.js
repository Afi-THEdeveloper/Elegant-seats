const mongoose =require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String,
        default:'avatar.png'
    },
    cart:[
        {
           product:{
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Product',
           },
           quantity:{
               type : Number,
               default: 1
           },
           total:{
              type:Number,
              default:0
           }
        }
    ],
    totalCartAmount:{
        type:Number,
        default:0
    },
    wishlist:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    address:Array,
    defaultAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
    },
    blocked :{
        type:Boolean,
        default:false
    },
    otp:{
        type:Number,
        createdAt:{type:Date,expires:'1m',default: Date.now()}
    },
    verified: {
        type:Boolean,
        default:false
    },

})

module.exports=mongoose.model('User',userSchema)