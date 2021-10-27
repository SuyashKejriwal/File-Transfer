const express=require('express');
const app=express();
const path=require('path');
const ejs=require('ejs');
const connectDB=require('./config/db');
const port=process.env.PORT||3000;
const fileRoutes=require('./routes/fileRoutes');
const downloadFileRoutes=require('./routes/DownloadFileRoutes')
const homeRoutes=require('./routes/homeRoutes');
connectDB();

//Template engine
app.use(express.static('public'));
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');

//Routes
app.use('/api/files',fileRoutes);
app.use('/files',downloadFileRoutes);
app.use('/',homeRoutes);

app.listen(port,()=>{console.log(`Listening on port ${port}`);})