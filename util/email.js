const nodeMailer=require('nodemailer')


exports.sendMail=async (options)=>{
    const transporter=nodeMailer.createTransport({
        service:'Gmail',
        auth:{
            pass:process.env.PASSWORD,
            user:process.env.EMAIL
        }
    })
    transporter.sendMail(options, (error,info)=>{
        if(error){
            console.log(error)
        }
        else{
            console.log(info.response)
        }
    })
}



