import express, {Response, Request, NextFunction, Application } from "express"
import { response } from "../types/types"
import Cryptr from "cryptr"
import jwt from "jsonwebtoken"
import User from "../models/User"

let cryptr = new Cryptr(process.env.ENC_PASS!)
const users:Application = express()

// TOKEN Authorization
users.use(async (req:Request, res:Response, next:NextFunction)=>{

    let response:response = {
        status: false,
        message: "api user authentication failed!"
    }

    if (!req.headers['authorization']) {
        return res.json(response); 
    }

    let authorization_header:any = (req.headers['authorization'])?.split(" ");
    let token:any = authorization_header[authorization_header.length-1];

       
    jwt.verify(token, process.env.JWT_TOKEN!, (err:any, decoded:any)=>{
        if (err) {
           return res.json(response);
        }

        else{

            req.body.authorization = cryptr.decrypt(decoded);
            next();
        }
    })

})



users.post('/data', async (req, res)=>{

    let response:response = {
        status: false,
        message: "data fetch failed!"
    }

    try {

        let data = await User.findById(
            req.body.authorization, 
            {
                remember_token: 0, 
                password: 0,
                _id : 0
            })


        response = {
            ...response,
            status : true,
            message: "data fetched successfully",
            data
        }
        
        
    } catch (error) {
        response = {
            ...response,
            status : false,
            message: "data fetched failed, please check your authentication token"
        }
    }

   
    res.json(response)
});


users.post('/update', async (req, res)=>{

    let response:response = {
        status: false,
        message: "data update failed!"
    }

    const emailPattern = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+/i;

    try {

        //Check Email Validity
        if(!(req.body.email).match(emailPattern)){
            throw new Error("this is not a valid email address")
        }
    
        //Check Password Strength
        if(!req.body.name){
            throw new Error("please enter you name")
        }

     

        await User.findByIdAndUpdate( 
            req.body.authorization, 
            {$set: {
                email : req.body.email,
                name : req.body.name
            }}
            
            )

        response = {
            ...response,
            status : true,
            message: "data updated successfully"
        }
        
        
    } catch (error:any) {
        
        response = {
            ...response,
            status : false,
            message: error.message
        }
    }

   
    res.json(response)
});









users.post('/updatepassword', async (req, res)=>{

    let response:response = {
        status: false,
        message: "password update failed!"
    }
    const passwordStrengthPattern = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;

    try {


        let {password} = await User.findById(
            req.body.authorization, 
            { password: 1})

        if (req.body.old_password != password) {
            
            throw new Error("old pasword does not match")
        }

        if(!(req.body.new_password).match(passwordStrengthPattern)){
            throw new Error("weak password")
        }

        await User.findByIdAndUpdate( 
            req.body.authorization, 
            {$set: { password: req.body.new_password}
        })

        response = {
            ...response,
            status : true,
            message: "password updated successfully"
        }
        
        
    } catch (error:any) {
        
        response = {
            ...response,
            status : false,
            message: error.message
        }
    }

   
    res.json(response)
});





export default users

