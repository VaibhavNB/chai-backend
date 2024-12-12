import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {

    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token");
    }
}

// register controller
const registerUser  = asyncHandler(async (req, res) => {
    // code to register user

    // steps
    // 1. get the user data from from frontend
    // 2. validate the user data
    // 3. check if the user already exists: username or email
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, check for avatar(multer did its work or not)
    // 6. create user object - create entry in the database
    // 7. remove password and refreshToken field from the user object or response
    // 8. check for user creation
    // 9. return the response


    // 10. hash the password
    // 11. save the user data to the database
 
    // get the user data from from frontend
    const {fullName,email,username,password} = req.body
    

    // validate the user data
    if ([fullName, email, username, password].some((field)=>{field?.trim() === ""})) {
        throw new ApiError(400,"Please fill all the fields");
    }
    
    // check if the user already exists
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    


    // throw error if user exists
    if (existedUser) {
        throw new ApiError(409,"User already exists");
    }

    // check for images
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // check for avatar
    if (!avatarLocalPath) {
        throw new ApiError(400,"Please upload an avatar image");
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    
    

    if (!avatar) {
        throw new ApiError(400,"Failed to upload images");
    }

    // create user object
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser =  await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500,"Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    );

});

//login controller
const loginUser = asyncHandler(async(req,res)=>{
    // code to login user
    // steps 
    // req body->data
    // username or email
    // find the user 
    // check for password
    // access and refreshtoke generate
    // send cookies

    const {username,email,password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Please provide username or email");
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    });

    if(!user){
        throw new ApiError(404,"User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect");
    }

    const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if(!loggedInUser){
        throw new ApiError(500,"Failed to login user");
    }

    const cookieOptions = {
        
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200).cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(200,{
            user: loggedInUser, accessToken, refreshToken
        },"User logged in successfully")
    )
})



// Logout controller 
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,

            }
        },
        {
            new:true
        }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(
        new ApiResponse(200,null,"User logged out successfully")
    )
})



// refresh access token controller
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(400,"Please provide refresh token");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token");
        }
    
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401,"Refreshs token is expired or used");
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res.status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",newRefreshToken,cookieOptions)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken: newRefreshToken}
                ,"Access token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401,error?.message ||"Invalid refresh token");
    }



})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(400,"Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200,null,"Password changed successfully")
    )
});
    

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,req.user,"User fetched successfully")
    )
})


const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400,"Please provide full name and email");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200,user,"Account details updated successfully")
    )
})


const updateUserAvatar = asyncHandler(async(req,res)=>{
    // code to update user avatar
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"Please upload an avatar image");
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400,"Error while uploading avatar image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    // code to update user avatar
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400,"Please upload an cover image");
    }

    // upload them to cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        throw new ApiError(400,"Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200,user,"CoverImage updated successfully")
    )

})





export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage 
};
