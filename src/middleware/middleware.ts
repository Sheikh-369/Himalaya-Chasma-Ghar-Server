import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import User from "../database/model/user-model";

interface IExtendedRequest extends Request{
    user?:{
        id:string,
        userName:string,
        userEmail:string,
        role:string,
        userPassword:string
    }
}

export enum Role{
    Admin = 'admin', 
    Customer = "customer"
}

class Middleware{

    static async isLoggedIn(
        req: IExtendedRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(400).json({
            message: "Please Provide Token!"
            });
        }

        // Accept both "Bearer token" and "token"
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const userData = await User.findByPk(decoded.id);

        if (!userData) {
            return res.status(400).json({
            message: "The user does not exist!"
            });
        }

        req.user = userData;

        next();

        } catch (error) {
        return res.status(400).json({
            message: "Invalid Token!"
        });
        }
    }

    static accessTo(...roles:Role[]){ 
        return (req:IExtendedRequest,res:Response,next:NextFunction)=>{
            const userRole = req.user?.role as Role
           if(!roles.includes(userRole)){
                res.status(403).json({
                    message : "Unauthorized Access!"
                })
                return
            }
            next()
        }
    }


}

export default Middleware