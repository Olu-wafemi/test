import validator from 'validator'

export function validateRegistrationData(name: string, email: string, password:string): string| null {
        if(!validator.isLength(name ,{min:3})){
            return 'Username must be at leat 3 characters long'

        }

        if(!validator.isEmail(email)){
            return 'Invalid email address'
        }

        if(!validator.isLength(password, {min:8})){
            return 'Password must be at least 8 characters long'

        }

        if(!validator.isStrongPassword(password)){
            return 'Password is not Strong enough'
        }

        return null

    
}



export function validateLoginData(email: string, password:string): string| null {
        if(!validator.isEmail(email)){
            return 'Email must be valid'

        }

       

        if(!validator.isLength(password, {min:8})){
            return 'Password must be at least 8 characters long'

        }

        

        return null

    
}