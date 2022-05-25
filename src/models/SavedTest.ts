import {Schema, model} from "mongoose";
import Question from "./Question";

const SavedTestSchema = new Schema({

    userId: {type:String},
    questionPaper:  [{type:Object}]  ,
    selectedAnswers: { type: [Number], required: true },
    metaData: { 
        correct_answers: {type: Number},
        wrong_answers: {type: Number}, 
        not_selected_answers: {type: Number} ,
        test_name:{type:String}
    }
    ,
    testDate:{type:String}

})


const SavedTest = model("SavedTest", SavedTestSchema)

export default SavedTest

