import express, {Response, Request, NextFunction, Application } from "express"

const index:Application = express()


index.get('/', (req, res)=>{
    res.send("Welcome to exam app API")
});





export default index