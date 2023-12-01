import {   Request, Response } from "express"
import jsonwebtoken from 'jsonwebtoken'
import bcrypt from "bcrypt"
import { db } from '../../firebase';
import { validateRegistrationData, validateLoginData } from '../validation/user.validator';
import { collection, addDoc, where, query, getDocs, doc, getFirestore, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { user } from "firebase-functions/v1/auth";
//import { User } from "../models/users";
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export const Usercontroller = {

    async register(req: Request, res: Response){
    try{
        let { email} = req.body
        email = email.toLowerCase()

        const {is_admin} = req.body

        let {password} = req.body
        const {name} = req.body

        

        const RegistrationError =  validateRegistrationData(name,email,password)
        
        let user_email  = ""
 
         const userefs = collection(db, 'users')
          const search =    query(userefs,where("email", "==", email))
          const searchsnapshot = await getDocs(search)
         // console.log(searchsnapshot)
 
          searchsnapshot.forEach((doc)=>{
             //console.log(doc.id, "=>", doc.data())
             
             user_email = doc.data().email
 
          })

        if(RegistrationError){
            return res.status(400).json({status: false,error: RegistrationError})
        }

        if(user_email == email){
            return res.status(400).json({status:false, message: "User exists"})
        }

        password =  await bcrypt.hash(password, 10)

       //const useref = collection(db, 'users')
       const {is_verified} = req.body

       const user = {
        email,
        password,
        name,
        is_admin,
        is_verified
       }
       const randomUid: string = uuidv4();
       const userDocRef = doc(db, 'users', randomUid);
       const new_user = await setDoc(userDocRef, user);

       const id = userDocRef.id

       const userprofileref = doc(db, "userProfiles", randomUid)
       const user_profile = await setDoc(userprofileref, {
        userId: id,
        location: { latitude: 0, longitude: 0 },
        age: 18,
        distance: 50,
       })


       
       //const new_user =  await addDoc(useref, user)
       
       
       
       return res.status(201).json({status:true, message: "Signup Successful"})

    }
    catch(error){
        res.status(500).json({status:false, error})
        console.log(error)

    }
},

    async login(req: Request, res:Response, io: Server){

        const {email, password } = req.body

        const LoginValidation = validateLoginData(email,password)

        if(LoginValidation){
            return res.status(401).json({status: false, error:LoginValidation})
        }

       let user_password: string = ""
       let user_data  = {}
       let user_id = ""

        const useref = collection(db, 'users')
         const search =    query(useref,where("email", "==", email.toLowerCase()))
         const searchsnapshot = await getDocs(search)
        // console.log(searchsnapshot)

         searchsnapshot.forEach((doc)=>{
            //console.log(doc.id, "=>", doc.data())
            user_password = doc.data().password
            user_data = doc.data()
            user_id = doc.id
           

         })
         

        
        

        const correct_password = await bcrypt.compare(password,user_password)
        if(!correct_password){
            return res.status(401).json({status:false, message: "Password is incorrect"})
        }

       // const secret  = process.env.HASH

        const token = jsonwebtoken.sign({
            email,
            password,
            user_id
        }, "SECRET")
        io.emit('login successful', {user_id});
        return res.status(200).json({status: true, message: "Logged In", token: token, data: user_data})

    },

    async UpdateProfile(req: Request, res: Response){
        try{
            const {phone,height,father_name,mother_name, parent_is_married,
                siblings_and_married,rabbi_shul,name, relation,about,looking_for, 
                cohen, marital_status,
                first_name,
                last_name,
                d_o_b,location, profile_picture, photos, 
            } = req.body

            const user_id = req.body.user_id
          
            const users = doc(db, "users", user_id)
            const usersnap = await getDoc(users)

            if(!usersnap.exists()){
                return res.status(400).json({status:false, message: "user does not exist"})
            }

            interface UpdateProfileRequest {
                phone: string,height : string,father_name: string,mother_name: string, 
                parent_is_married: string,
                siblings_and_married: string,rabbi_shul: string,name: string, relation: string,about: string,
                looking_for: string, 
                cohen: string, marital_status: string,
                first_name: string,
                last_name: string,
                d_o_b: string,
                location?: { latitude: number; longitude: number }, profile_picture: string, photos: string,
                

                // Add other optional fields as needed
              }
              const userId = user_id
         const data_to_update = {
            phone,height,father_name,mother_name, parent_is_married,
                siblings_and_married,rabbi_shul,name, relation,about,looking_for, 
                cohen, marital_status,
                first_name,
                last_name,
                d_o_b,location, profile_picture, photos
         }
         const filteredData = Object.fromEntries(
            Object.entries(data_to_update).filter(([_, value]) => value !== undefined)
          );
      

         const docRef = doc(db, "userProfiles", user_id)
         const data =await updateDoc(docRef, filteredData)

         return res.status(200).json({status: true, message: "data update Successful", data: data})

         



        }
        catch(error){
            return res.status(500).json({status: false, error })

        }
    },
    async set_preferences(req: Request, res: Response){

        const {minDistance, maxDistance, minAge, maxAge} = req.body

        const user_id = req.body.user_id
          
        const users = doc(db, "users", user_id)
        const usersnap = await getDoc(users)

        if(!usersnap.exists()){
            return res.status(400).json({status:false, message: "user does not exist"})
        }

        const docRef = doc(db, "userProfiles", user_id)
        const pref = {
            minDistance, maxDistance, minAge, maxAge
        }
        const data =await updateDoc(docRef, pref)
        


        return res.status(200).json({status: true, message: "Pref set successfully Successful"})
        



    },
    async joingroup(req: Request, res: Response){
        const {group_id} = req.body

        const user_id = req.body.user_id
        
        
        /*

        const groups = doc(db, "groupz", group_id)
         const groupsnap =  await getDoc(groups)
         const data = groupsnap.data()?.members || []
         

         if (data.includes(user_id)){
            return res.status(401).json({status:false, message: "user already belongs to group"})
         }


         const data_to_update ={
            members: [ ...data, user_id]
         }
         */

         const addRef = doc(db, "groups", group_id)

         const membersCollection = collection(addRef, 'members');
         const memberDocRef = doc(membersCollection, user_id);
        await setDoc(memberDocRef, { inGroup: true });
        //  /const Ref =await updateDoc(addRef, data_to_update)

         return res.status(200).json({status: true, message: "User joined group successfully",})




         

         

        


    },
    async fetch_all_groups(req: Request, res: Response){
        const groups = collection(db, "groups")

        const userSnapshot = await getDocs(groups)
        const data: Record<string, any> = {};
      
        userSnapshot.forEach((doc) => {
            //console.log(doc.id, " => ", doc.data());
             data[doc.id] = doc.data()


           });

        return res.status(201).json({status: true, data})

    },
    

    async matching_algorithm(req: Request, res:Response){

        const user_id = req.body.user_id

        const addRef = doc(db, "userProfiles", user_id )
        const currentuserprofile = await getDoc(addRef)
        const currentUserData: any = currentuserprofile.data()

        const ageQuery = query(
            collection(db, 'userProfiles'),
            where('age', '>=', currentUserData.minAge),
            where('age', '<=', currentUserData.maxAge)
           );
           
           const userIdQuery = query(
            collection(db, 'userProfiles'),
            where('userId', '!=', user_id)
           );
           
           const ageSnapshot = await getDocs(ageQuery);
           const userIdSnapshot = await getDocs(userIdQuery);
           
           const potentialMatches = [...ageSnapshot.docs, ...userIdSnapshot.docs]
            .filter(doc => {
              const matchData = doc.data();
              
              return matchData.location && currentUserData.location && matchData.userId != user_id
                && calculateDistance(matchData.location, currentUserData.location) <= currentUserData.maxDistance;
            })
            .map(doc => doc.data());


            res.status(200).json({ matches: potentialMatches });
           


    }
}



function calculateDistance(point1: any, point2: any) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
  
    const lat1 = toRadians(point1.latitude);
    const lon1 = toRadians(point1.longitude);
    const lat2 = toRadians(point2.latitude);
    const lon2 = toRadians(point2.longitude);
  
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = earthRadius * c; // Distance in kilometers
    return distance;
  }
  
  // Helper function to convert degrees to radians
  function toRadians(degrees: any) {
    return degrees * (Math.PI / 180);
  }
