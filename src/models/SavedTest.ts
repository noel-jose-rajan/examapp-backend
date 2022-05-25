import {Schema, model} from "mongoose";
import Question from "./Question";

const SavedTestSchema = new Schema({

    questionPaper: { type: [ Question ] } ,
    selectedAnswers: [Number],
    metaData: [
        {correct_answers: Number},
        {wrong_answers: Number},
        {not_selected_answers: Number},

    ],
    testDate:[{test_Date: String}]


})


const SavedTest = model("SavedTest", SavedTestSchema)

export default SavedTest

