import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response, NextFunction} from "express";
import mongoose from "mongoose";
import cors from "cors"
import Stripe from "stripe"
import Cryptr from "cryptr"
import jwt from "jsonwebtoken"
import { response } from "./types/types";
import User from "./models/User"

let cryptr = new Cryptr(process.env.ENC_PASS!)

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2020-08-27"
})


const payment  = express();


payment.post("/webhook", express.raw({type: "*/*"}), async (req, res) => {


    
    const sig:any = req.headers['stripe-signature']
    const payload = req.body
    let secret = process.env.STRIPE_WEBHOOK_KEY_1!
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, secret)
        // let userId = JSON.parse((req.body).toString('utf8')).data.object.metadata.id || false

         let data = JSON.parse((req.body).toString('utf8')).data.object.metadata || false

         
         console.log("Data from webhook: "+data);
         
      
        //Save To Data Base
        //***************

    } catch (error) {
        console.log(error);
        res.sendStatus(500)
        return
    }
    console.log("Data from webhook");

    res.sendStatus(200)
})


payment.use(express.json())
payment.use(cors({
  origin: true,
}))

payment.use(async (req:Request, res:Response, next:NextFunction)=>{

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

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWD}@cluster0.lgzgs.mongodb.net/examace?retryWrites=true&w=majority`, 
    ()=>{
        console.log("Connected");
  
    }
);


payment.get("/", (req, res)=>{
    res.send("Welcome to Payment API")
})

payment.post("/", async (req, res) => {

    let response:response = {
        status: false,
        message: "api user authentication failed!"
    }


    //30 60 360
    try {
        let plan = 30
        let amount = 299

        switch (req.body.plan) {
            case 30:
                plan = 30
                amount = 29900
                
                break;
            case 60:
                plan = 60
                amount = 59900
                
                break;
            case 360:
                plan = 360
                amount = 99900
                
                break;
        
            default:
                throw new Error("please select the correct plan");
                break;
        }
    

        let user_id = req.body.authorization

        const checkUser = await User.findById(user_id)
    
          
        let stripeURL = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: "Testing The Gate Way"
                    },
                    unit_amount:amount,
                },
                quantity: 1,
            }],
            metadata: {
                id : user_id,
                plan_days: plan

            },
            success_url: req.body.success_url,
            cancel_url:  req.body.cancel_url
    
        })
    
        return res.json({
            status: true,
            message: "payment link accquired successfully",
            data : {  paymentURL : stripeURL.url }
        })

    } catch (error) {

        console.log("error:");
        console.log(error);
        

        return res.json({  paymentURL : `www.yahoo.co.in`, error: error })

    }
})





payment.listen(6000, ()=>{ console.log("The payment server is running at http://127.0.0.1:6000")})