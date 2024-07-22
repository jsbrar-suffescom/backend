
import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { mongo } from "mongoose";




const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body


    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})



const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

// GET ALL THE USERS 

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } });
        return res.status(201).json(
            new ApiResponse(200, users, "All Users Fetched Successfully")
        )
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
};


// STORE SOCKET ID 



const setSocketId = async (req, res) => {

    
    try {
        const { userId, socketId } = req.body;

        const check = await User.findOne({_id : new mongoose.Types.ObjectId(userId)})


        if(check){
            const data = await User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(userId) }, { socketId: socketId })

            if (data) {
                new ApiResponse(200, "Socket Id updated successfully")
            }
            else {
                new ApiError(400, "Failed to update socket id")
            }
        }
        else{
            new ApiError(404, "User Not Found")
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "INTERNAL SERVER ERROR" })
    }
}














export { registerUser, loginUser, getAllUsers, setSocketId }