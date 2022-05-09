export type signup  = {
    name: string,
    
    date_of_birth:string,

    email: string,

    email_verified_at: string,

    password: string,

    remember_token: string,

    created_at: string,

    updated_at: string,
    phone_number: {
        type: string,
        required: true
    },

    description: string,

    profile_image: string,

    gender: string,
}

export type response = {
    status:boolean,
    message:string,
    data?: string | array | object | number,
    errorMessage?: any
}