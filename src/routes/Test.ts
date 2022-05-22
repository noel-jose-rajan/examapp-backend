
import express, {Response, Request, NextFunction, Application } from "express"
import UserDB from "../models/User"
import { response } from "../types/types"
import jwt from "jsonwebtoken"
import Cryptr from "cryptr"
import Question from "../models/Question"

let cryptr = new Cryptr(process.env.ENC_PASS!)

const test:Application = express()
test.use(express.json())

// TOKEN Authorization
test.use(async (req:Request, res:Response, next:NextFunction)=>{

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


test.get('/', async (req: Request, res: Response) => {
    res.send("Test Route")
});




//Generate Test Paper
test.post('/questionPaper', async (req: Request, res: Response) => {
    let response:response = {
        status: false,
        message: "Question Paper Preperation failed!"
    }

   try {

    
       
    if (!req.body.subject) {
        throw new Error("please send the subject in the query")
    }

    let subjects = req.body.subject
    let data:any = [];
    let subjectsRequested:any = [];


    for (let index = 0; index < subjects.length; index++) {

        
        const element = subjects[index];

        if (subjectsRequested.includes(element[0])) {
            continue;
        }else{
            subjectsRequested.push(element[0])
        }

        let query:any = await Question.aggregate([
            { 
              $match: { 
                subject: element[0] 
              }
            },
            { $sample: { size: element[1] > 50? 50 : element[1] } }
        ]).catch((error:any)=>{

        })

      data.push(...query)
    }

    response.data = {
        questions :  data,
        count : data.length
    }
   

   } catch (error) {
       console.log(error);
       
   }

    
    res.json(response)
});

//Save Test Paper




export default test
