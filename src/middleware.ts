import { NextFunction, Request, Response } from "express";
import { AuthorModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
export const checkExistURN = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileURN = req.body.profileURN;
        const isExist = await AuthorModel.find({ profileURN: profileURN });
        console.log(isExist)
        
        if (isExist.length === 0) {
            const newUser = await AuthorModel.create({ profileURN: profileURN });
            if (newUser) {
                next();
            }
        }
        req.body.isExist = true;
        req.body.existedUser = isExist;
        console.log("is already Exist");
        next();
    }
    catch (err) {
        console.log("ERROR",err);
        res.status(500).send({ message: "Internal Server Error", error: err });
        return ;
    }
}

export const isValidUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader;
            const JWT_SECRET_KEY = process.env.JWT_SECRET_ACCESS_KEY!;
            try {
                const decoded = jwt.verify(token, JWT_SECRET_KEY);
                console.log(decoded)
                const user = await UserModel.find({ email: (decoded as jwt.JwtPayload).email });
                if (user[0].isVerified === true) {
                    next();
                }
                else{

                    res.status(400).json({ message: "Sorry you're not verified user" });
                    return ;
                }
            } catch (err) {
                res.status(403).json({ message: "Forbidden" });
                return;
            }

        } else {
            res.status(401).json({ message: "Unauthorized" });
            return ;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error", error: err });
        return ;
    }
}

