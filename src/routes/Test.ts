
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

    if (!req.body.questionPaper || 
        !req.body.metaData || 
        !req.body.selectedAnswers || 
        !req.body.testDate ) 
        {
            throw new Error("please send all the data required to save the test")
        }

    await SavedTest.create({
        userId: req.body.authorization,
        questionPaper : req.body.questionPaper,
        metaData : req.body.metaData,
        selectedAnswers : req.body.selectedAnswers,
        testDate : req.body.testDate
        

    })

    console.log(req.body);
    

    response = {
        status: true,
        message: "answer paper saved!"
    }
   

   } catch (error:any) {
    response = {
        status: false,
        message: error.message
    }
   
       
   }

    
    res.json(response)
});


//Retrieve Saved Test
test.post('/mytests', async (req: Request, res: Response) => {
    let response:response = {
        status: false,
        message: "answer papers failed to fetch!"
    }

   try {

    if (!req.body.authorization) {
        throw new Error("please check the token")
    }

    await SavedTest.find({userId: req.body.authorization},{
        _id: 1,
        metaData : 1,
        testDate : 1
    })
    .then(res => {

        response = {
            status: true,
            message: "answer papers fetched!",
            data : res
        }
        
        
    })
    .catch(err => {
        throw new Error(err)
        
    })

    
   

   } catch (error) {
       console.log(error);
       
   }

    
    res.json(response)
});


//Retrieve Specific Saved Test
test.post('/testdetails', async (req: Request, res: Response) => {
    let response:response = {
        status: false,
        message: "answer paper failed to fetch!"
    }

   try {

    if (!req.body.test_id) {
        throw new Error("please send the test id")
    }

    await SavedTest.findById(req.body.test_id)
    .then(res => {

        response = {
            status: true,
            message: "answer paper fetched!",
            data : res
        }
        
        
    })
    .catch(err => {
        throw new Error(err)
        
    })

    
   

   } catch (error) {
       console.log(error);
       
   }

    
    res.json(response)
});



export default test
