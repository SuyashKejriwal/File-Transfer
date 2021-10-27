const router=require('express').Router();
const {storeFileinDB}=require('../controllers/FileController')

//Base route- api/files
router.post('/',storeFileinDB);

module.exports=router;