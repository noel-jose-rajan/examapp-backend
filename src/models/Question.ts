import {Schema, model} from "mongoose";


const QuestionSchema = new Schema({

    question: { type:String } ,
    image: { type:String } ,
    options : [

        {
            option1img:  { type:String },	
            option1: { type:String } ,	
        },

        {
            option2img: { type:String } ,
            option2: { type:String } ,
        },

        {
            option3img: { type:String } ,
            option3: { type:String } ,
        },

        {
            option4img: { type:String } ,
            option4: { type:String } ,
        }

    ],

    answer:{ type: Number } ,
    explanation: { type:String } ,
    toughness: { type:Number } ,
    subject: { type:String } ,
    topic: { type:String } ,
    year: { type:Number} 

})


const Question = model("Question", QuestionSchema)

export default Question