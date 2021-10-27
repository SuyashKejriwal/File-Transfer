const router=require('express').Router();
const {renderDownloadPage,DownloadFile}=require('../controllers/FileController')

//base route-files
router.get('/:uuid',renderDownloadPage)
router.get('/download/:uuid',DownloadFile)
module.exports=router;