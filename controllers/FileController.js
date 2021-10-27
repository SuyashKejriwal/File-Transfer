const multer=require('multer');
const path=require('path');
const {v4: uuidv4 }=require('uuid');
const File=require('../models/fileModel');
const sendEmail=require('../services/emailService');

let storage=multer.diskStorage({
    destination:(req,file,cb) => cb(null,'uploads/'),
    filename:(req,file,cb)=>{
         const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName);
    }
})

let upload=multer({
    storage:storage,
    limit:{ fileSize: 100000*100}, //100 Mb
}).single('myfile');


const storeFileinDB=(req,res)=>{
    
        //Store file 
        upload(req,res,async(err)=>{

            //validate request 
            if(!req.file){
            return res.json({error: 'All fields are required.'});
            }

            if(err){
                return res.status(500).send({error: err.message});
            }

            //Store into database
            const file=new File({
                filename:req.file.filename,
                uuid: uuidv4(),
                path: req.file.path,
                size:req.file.size
            });

            const response=await file.save();
            console.log(response);
            return res.json({file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});
            //http://localhost:3000/files/uuid
        });
    
        
    //Response -> Link 

}

const renderDownloadPage= async (req,res)=>{
    try{
        console.log("Inside the function");
        const file=await File.findOne({uuid:req.params.uuid })
        console.log(file);
        if(!file){
            return res.render('download',{error:'Link has been expired. '})
        }

        return res.render('download',{
            uuid:file.uuid,
            fileName:file.filename,
            fileSize:file.size,
            downloadLink:`${process.env.APP_BASE_URL}/files/download/${file.uuid}`
            //http://localhost:3000/files/download/dkffk
        })
    }catch(err){
        return res.render('download',{error:'Something went wrong.'});
    }
    
}

const DownloadFile=async (req,res)=>{
    const file=await File.findOne({uuid:req.params.uuid})

    if(!file){
        res.render('download',{ error:'Link has been expired. '});
    }

    const filePath=`${__dirname}/../${file.path}`;
    res.download(filePath);
}

//api/files/send
const SendEmail=async (req,res)=>{
    
    const { uuid,emailTo,emailFrom }=req.body;

    //validate request
    if(!uuid||!emailTo||!emailFrom){
        return res.status(422).send({error: 'All fields are required.'});
    }

    //get data from database
    const file=await File.finOne({uuid:uuid});

    if(file.senderEmail){
        return res.status(422).send({error:'Email already sent. '})
    }

    file.senderEmail=emailFrom;
    file.recieverEmail=emailTo;
    const response=await file.save();

    //Send Email
    sendEmail({
        from:emailFrom,
        to:emailTo,
        subject:'inShare file Sharing',
        text:`${emailFrom} shared a file with you.`,
        html:require('../services/emailTemplate')(
            {
                emailFrom:emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                size: parseInt(file.size/1000)+'KB',
                expires:'24 hours'
            }
        )
    });
}
module.exports = {
    storeFileinDB,
    renderDownloadPage,
    DownloadFile,
    SendEmail
};