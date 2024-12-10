import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path:'./env'
});



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server running on port http://localhost:${process.env.PORT}`);
        app.on('Error', (error) => {
            console.error("Error: ",error);
            throw error;
        })
        
    })
})
.catch((error)=>{
    console.log("MongoDb connection Failed: ",error);
    
});











/*
import express from "express";
const app = express();



;( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on('Error', (error) => {
            console.error("Error: ",error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Listening on port http://localhost:${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error: ",error);
        throw error;
        
    }
})()
*/
