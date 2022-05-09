import {Schema, model} from "mongoose";


const UserSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true
    },

    email_verified_at: {
        type: String,
        default: "not verified"
    },

    password: {
        type: String,
        required: true
    },

    remember_token: {
        type: String
    },

    created_at: {
        type: Date,
        required: true,
        default: new Date(),
        immutable: true
    }


})


const User = model("User", UserSchema)

export default User