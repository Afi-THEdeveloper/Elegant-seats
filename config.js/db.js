const mongoose=require('mongoose')

const dbConnect=()=> mongoose.set('strictQuery',true).connect(process.env.MONGO_URI)
.then(()=>console.log('db connected'))
.catch((error)=>console.log(error))


module.exports={
    dbConnect
}

