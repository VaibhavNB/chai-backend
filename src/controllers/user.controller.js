import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser  = asyncHandler(async (req, res) => {
    // code to register user
    res.status(200).json({
         message: "User registered successfully" 
    });

});

export { registerUser };
