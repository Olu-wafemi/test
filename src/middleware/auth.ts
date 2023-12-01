import { NextFunction, Request, Response , } from 'express';
const jwt = require('jsonwebtoken')

const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get("Authorization")
    
   

    if (!authHeader) {

        return res.status(401).json({
            status: false,
            message: 'Authorization Header is not Present'
        })
    }
    const token = authHeader.split(' ')[1];
  
    
    let decodedToken
    try {
        decodedToken = jwt.verify(token, "SECRET")

    } catch (error: any) {
        
        if(error.message == 'jwt expired'){
        return res.status(401).json({
           status: false,
            //message: 'Invalid Authentication Token'
            message: error.message
        })
    }
    return res.status(400).json({
        status:false,
        message: error.message
    })
    }
    
    //if the token was not verified
    if (!decodedToken) {

        return res.status(401).json({
            status: false,
            message: 'Invalid Authentication Token'
        })
    }

    req.body.email = decodedToken.email;
    req.body.user_id = decodedToken.user_id
    req.body.token = token

    next()
}

export default auth