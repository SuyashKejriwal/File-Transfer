const mongoose=require('mongoose');
require('dotenv').config();
const mongo_uri=process.env.MONGO_CONNECTION_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongo_uri, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        
        console.log(`Mongo DB Connect : ${conn.connection.host}`);
    } catch (err) {
        console.log(`Error : ${err.message}`);
        process.exit(1);
    }

}

module.exports = connectDB;