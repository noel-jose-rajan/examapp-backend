
import express, {Response, Request, NextFunction, Application } from "express"
import UserDB from "../models/User"
import { response } from "../types/types"
import jwt from "jsonwebtoken"
import Cryptr from "cryptr"
import Question from "../models/Question"
import SavedTest from "../models/SavedTest"

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
        status: true,
        message: "Question Paper Generated",
        questions :  data,
        count : data.length
    }
   

   } catch (error) {
       console.log(error);
       
   }

    
    res.json(response)
});

//Save Test Paper
test.post('/save', async (req: Request, res: Response) => {
    let response:response = {
        status: false,
        message: "answer paper save failed!"
    }

   try {

    if (!req.body.authorization) {
        throw new Error("please check the token")
    }

    await SavedTest.create({
        userId: req.body.authorization,
        questionPaper : req.body.questionPaper,
        metaData : req.body.questionPaper.metaData,
        selectedAnswers : req.body.questionPaper.selectedAnswers,
        testDate : req.body.questionPaper.testDate
        

    })

    response = {
        status: true,
        message: "answer paper saved!"
    }
   

   } catch (error) {
       console.log(error);
       
   }

    
    res.json(response)
});


//Retrieve Saved Test

//Retrieve Specific Saved Test



export default test
