import express, {Response, Request, NextFunction, Application } from "express"
import UserDB from "../models/User"
import { response } from "../types/types"
import jwt from "jsonwebtoken"
import Cryptr from "cryptr"
import mailer from "nodemailer"
import config from "../config"

let cryptr = new Cryptr(process.env.ENC_PASS!)


const auth:Application = express()
auth.use(express.json())




auth.get('/', async (req: Request, res: Response) => {
    res.send("Authentication Route")
});

auth.post('/signup', async (req: Request, res: Response) => {

    let the_user = await UserDB.find({email: req.body.email}) || []
  
    let response: response = {
        status: false,
        message: "somthing went wrong, try later",
        
    }

    const passwordStrengthPattern = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;

    const emailPattern = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+/i;
    
    let data = (Object.entries(req.body).map((item: any) => {

            //Date of birth must be between 1970 to now
            if (typeof item[1] == "string" && item[0] != "password") {
                return [item[0], (item[1]).toLocaleLowerCase()]
            } else {
                return [item[0], item[1]]
            }

    })).reduce(function (key: any, value: any) {
        key[value[0]] = value[1];
        return key;
    }, {});

    try {

        //Check Email Validity
        if(!(req.body.email).match(emailPattern)){
            throw new Error("this is not a valid email address")
        }
        //Check Exising Email / Number

        if (the_user.length > 0) {
            throw new Error("this email already exists")
        } 
        //Check Password Strength
        if(!(req.body.password).match(passwordStrengthPattern)){
            throw new Error("weak password")
        }
        

        let save_user = new UserDB(data)

        await save_user.save()
        .then(async (res: any) =>{
            response.status = true
            response.message = "account created!, the email will be only valid for 10 minutes"

            let token = jwt.sign(
                (cryptr.encrypt((res._id))).toString(),
                process.env.JWT_EMAIL_TOKEN!
            )

            return token
        
        })
        .then(async (token:any)=>{
            // const transporter = mailer.createTransport({
            //     host: 'smtp.ethereal.email',
            //     port: 587,
            //     auth: {
            //         user: 'maci.medhurst97@ethereal.email',
            //         pass: 'hVZ63n8vnVcf6JhhXb'
            //     }
            // });

            //  await transporter.sendMail({
            //     from: '"Exam Ace 💯📝" verify@examace.com', // sender address
            //     to: `${req.body.name}, ${req.body.email}`, // list of receivers
            //     subject: "Hello ✔", // Subject line
            //     text: `<a href="${config.API}/auth/verify?token=${token}"> Click this link to verify </a>`, // plain text body
            //     html: `<a href="${config.API}/auth/verify?token=${token}">Click this link to verify </a>`, // html body
            //   });

            console.log(`${config.API}/auth/verify?token=${token}`);
            
        })
        .catch((err: any) => {
            console.log(err);
            response.status = false
            response.message = err.message
            typeof err == "string"? response.errorMessage == err: null
        })
        
    } catch (error:any) {
            response = {
                ...response,
                status : false,
                message :error.message
            }
               

    }
    
    res.json(response)
});


auth.post('/login', async (req: any, res: Response) => {

    let response: response = {
        status: false,
        message: "somthing went wrong, try later"
    }

    try {

       
        if (!req.body.password || !req.body.email) {
            throw new Error("login credentials required")
        }

        let the_user = await UserDB.findOne({email: req.body.email})

        if (!the_user) {
            throw new Error("an account with this email does not exist")
        }

        if (the_user.password != req.body.password ) {
            throw new Error("wrong password")
        }
        if (the_user.password != req.body.password ) {
            throw new Error("wrong password")
        }

        else if (the_user.email_verified_at == "not verified") {
            throw new Error("please verify your account")
        }

        let token = jwt.sign( cryptr.encrypt(the_user._id), process.env.JWT_TOKEN!);

        await UserDB.findByIdAndUpdate(the_user._id, {remember_token: token})
        .then(()=>{

            response = {
                status : true,
                message : "logged in",
                data : {token},
            }

        })
        .catch(()=>{
            throw new Error("token authorization failed");
            
        })

    } catch (error:any) {
        response = {
            ...response,
            status : false,
            message : error.message,
        }
    }

    res.json(response)
});

auth.get("/verify", async (req: Request, res: Response)=>{

    let response: response = {
        status: false,
        message: "somthing went wrong, try later"
    }

    try {
        let {token} : any = req.query
        let info:any = jwt.verify(token, process.env.JWT_EMAIL_TOKEN!, (error:any, decode:any)=>{
            if (error) { return false }
            else { return decode }
        })

        let db_id = cryptr.decrypt(info);
        if (db_id) {
            console.log(db_id);
            
            UserDB
            .findByIdAndUpdate(db_id, {email_verified_at: new Date()})
            .catch(()=>{throw new Error})

            response.status = true;
            response.message = "successfully verified";
        } else {
            throw new Error("the token is invalid");
            
        }
        

    } catch (error) {
       
        response.status = false;
        response.message = typeof error == 'string'? error: "somthing went wrong, try later";
    }

    res.json(response)
})

//Resend Sign up verification
auth.post("/reverification",  async (req: any, res: Response) =>{
    let response: response = {
        status: false,
        message: "somthing went wrong, try later"
    }

    try {

        let the_user = await UserDB.findOne({email: req.body.email})       
        if (!req.body.email) {
            throw new Error("email field annot be empty")
        }
        
        else if ( the_user && the_user.email_verified_at === "not verified") {
            
        
            let token = jwt.sign(
                (cryptr.encrypt((the_user._id))).toString(),
                process.env.JWT_EMAIL_TOKEN!
            )
            

            const transporter = mailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'maci.medhurst97@ethereal.email',
                    pass: 'hVZ63n8vnVcf6JhhXb'
                }
            });

             await transporter.sendMail({
                from: '"Exam Ace 💯📝" verify@examace.com', // sender address
                to: `${req.body.name}, ${req.body.email}`, // list of receivers
                subject: "Hello ✔", // Subject line
                text: `<a href="${config.API}/${token}"> Click this link to verify </a>`, // plain text body
                html: `<a href="${config.API}/${token}">Click this link to verify </a>`, // html body
              });
        }else {
            throw new Error("the email cannot be found!");
            
        }

        response.status = true
        response.message = "please check your inbox for reverification email"
        
    } catch (error:any) {
        
        response.message = typeof error == "string"? error: error.message
    }

    res.json(response)
})

//Reset Password
auth.post("/resetpassword",  async (req: any, res: Response) =>{
    let response: response = {
        status: false,
        message: "somthing went wrong, try later"
    }

    await UserDB.findOne({email: req.body.email})
    .then(async (res:any)=>{


        if (res == null) {
            throw new Error("user cannot be found");
            
        }
        
        const transporter = mailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'maci.medhurst97@ethereal.email',
                pass: 'hVZ63n8vnVcf6JhhXb'
            }
        });

            await transporter.sendMail({
            from: '"Exam Ace 💯📝" verify@examace.com', // sender address
            to: `${req.body.email}`, // list of receivers
            subject: "Hello ✔", // Subject line
            text: `<p>Your Password is ${res.password}</p>`, // plain text body
            html: `<p>Your Password is ${res.password}</p>`, // html body
            });

            response.status = true
            response.message = "please check your e-mail for password recovery"
        
    })
    .catch((error:any)=>{
                
        response = {...response, status: true, message: error.message }
     
    })
       

    res.json(response)
})







export default auth











