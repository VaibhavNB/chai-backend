import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("email: ",email);

    // validate the user data
    if ([fullName, email, username, password].some((field)=>{field?.trim() === ""})) {
        throw new ApiError(400,"Please fill all the fields");
    }
    
    // check if the user already exists
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    // throw error if user exists
    if (existedUser) {
        throw new ApiError(409,"User already exists");
    }

    // check for images
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    // check for avatar
    if (!avatarLocalPath) {
        throw new ApiError(400,"Please upload an avatar image");
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary.uploader.upload(avatarLocalPath);
    const coverImage = await uploadOnCloudinary.uploader.upload(coverImageLocalPath);

    if (!avatar || !coverImage) {
        throw new ApiError(500,"Failed to upload images");
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
        new ApiResponse(201,createdUser,"User registered successfully")
    );

});

export { registerUser };
