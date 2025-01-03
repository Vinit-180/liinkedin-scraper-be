import { NextFunction, Request, Response } from "express";
import { AuthorModel } from "./db";

export const checkExistURN = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileURN = req.body.profileURN;
        const isExist = await AuthorModel.find({ profileURN: profileURN });
        console.log(isExist)

        
        if (isExist.length === 0) {
            const newUser = await AuthorModel.create({ profileURN: profileURN});
            if (newUser) {
                next();
            }
        }
        req.body.isExist=true;
        req.body.existedUser=isExist;
        console.log("is already Exist");
        next();
    }
    catch (err) {
        res.status(500).send({ message: "Internal Server Error", error: err });
    }
}