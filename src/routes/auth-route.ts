import express, { Router } from "express"
import asyncErrorHandler from "../services/async-error-handler"
import AuthController from "../controllers/auth-controller"
import Middleware, { Role } from "../middleware/middleware"

const router:Router=express.Router()

//user register
router.route("/register").post(
    asyncErrorHandler(AuthController.userRegister)
)

//user login
router.route("/login").post(
    asyncErrorHandler(AuthController.userLogin)
)

//forgot password
router.route("/forgot-password").post(
    asyncErrorHandler(AuthController.forgotPassword)
)

// //reset password
router.route("/reset-password").post(
    asyncErrorHandler(AuthController.resetPassword)
)

// //fetch all users
// router.route("/users").get(
//     Middleware.isLoggedIn,
//     Middleware.accessTo(Role.Admin),
//     asyncErrorHandler(AuthController.fetchAllUsers)
// )

// //count total users
// router.route("/users/total-users").get(
//     Middleware.isLoggedIn,
//     Middleware.accessTo(Role.Admin),
//     asyncErrorHandler(AuthController.getTotalUsers)
// )

// //recently joint users
// router.route("/users/recent-users").get(
//     Middleware.isLoggedIn,
//     Middleware.accessTo(Role.Admin),
//     asyncErrorHandler(AuthController.getRecentClients)
// )

// //get users by id
router.route("/user/:id").get(
    Middleware.isLoggedIn,
    Middleware.accessTo(Role.Admin,Role.Customer),
    asyncErrorHandler(AuthController.getUserById)
)

// //update user/admin profile
// router.route("/update-profile/:id").patch(
//     Middleware.isLoggedIn,
//     Middleware.accessTo(Role.Admin,Role.Student),
//     upload.single("profileImage"),
//     asyncErrorHandler(AuthController.updateProfile)
// )

export default router