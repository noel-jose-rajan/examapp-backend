import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors"

import AuthRoute from "./routes/Auth";
import IndexRoute from "./routes/Index";
import UsersRoute from "./routes/Users";


const app  = express();

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWD}@cluster0.lgzgs.mongodb.net/examace?retryWrites=true&w=majority`, ()=>{
  console.log("Connected");
  
});

app.use(express.json())
app.use(cors({
  origin: true,
}))


app.use("/",IndexRoute)
app.use("/auth",AuthRoute)
app.use("/user", UsersRoute)


app.listen(5000, ()=>{ console.log("The server is running at http://127.0.0.1:5000")})