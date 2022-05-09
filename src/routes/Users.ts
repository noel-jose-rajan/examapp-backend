import express, {Response, Request, NextFunction, Application } from "express"

const users:Application = express()


users.get('/', (req, res)=>{
    res.send("Users Route")
});





export default users

