import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath){
            return null
        }
        // upload the file on cloudinary
        const response = await cloudinary.v2.uploader.upload(localFilePath,{
            resource_type: 'auto',
        })

        // file has been uploaded on cloudinary
        console.log(response.url,"response from cloudinary");
        return response
        
        
    } catch (error) {
        fs.unlinkSync(localFilePath);//remove the locally saved temporary file as the upload operation got failed
        return null
    }
}


export {uploadOnCloudinary};