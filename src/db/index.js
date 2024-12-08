import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDb connected... DB Host: ${connectionInstance.connection.host} \n`);
        
    } catch(error){
        console.log("MongoDb connection Failed: ",error);
        process.exit(1); //know about this more in future
        
    }

}

export default connectDB;