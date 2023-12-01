import { NextFunction, Request, Response , } from 'express';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
const jwt = require('jsonwebtoken')

const is_admin = async(req: Request, res: Response, next: NextFunction) => {
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


    const email= decodedToken.email
    const useref = collection(db, 'users')
     const search =    query(useref,where ("email", "==", email))
     const searchsnapshot = await getDocs(search)
    let role = true

     searchsnapshot.forEach((doc)=>{
        //console.log(doc.id, "=>", doc.data())
        role = doc.data().is_admin

     })

     if(role!= true){
        return res.status(401).json({status: false, message: "Unauthorized access"})
     }

    next()
}

export default is_admin