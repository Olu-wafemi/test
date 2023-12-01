import { Request, Response } from 'express';
import { ref } from 'firebase-functions/lib/v1/providers/database';
import { collection, getDocs, doc, updateDoc, getDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';


export const AdminController ={
    
    async fetchallusers(req: Request, res: Response){

        try{
        const users = collection(db, "users")
        

        const email= req.body.email
        const useref = collection(db, 'users')
         const search =    query(useref,where("email", "==", email))
         const searchsnapshot = await getDocs(search)
        let role = true

         searchsnapshot.forEach((doc)=>{
            //console.log(doc.id, "=>", doc.data())
            role = doc.data().is_admin

         })

        
         if(role!= true){
            return res.status(401).json({status: false, message: "Unauthorized access"})
         }

            
      

        


        const userSnapshot = await getDocs(users)
        const data: Record<string, any> = {};
      
        userSnapshot.forEach((doc) => {
            //console.log(doc.id, " => ", doc.data());
             data[doc.id] = doc.data()


           });

        return res.status(201).json({status: true, data})

        }
        catch(error){
            return res.status(500).json({status:false, error })
        }
        


    },
    async edit_user_profile(req: Request, res: Response){

        try{

        const {id, phone,height,father_name,mother_name, parent_is_married,
            siblings_and_married,rabbi_shul,name, relation,about,looking_for, 
            cohen, marital_status,
            first_name,
            last_name,
            d_o_b,location, profile_picture, photos, 
        } = req.body


        if(!id){
            return res.status(400).json({status:false, message: "id is required"})

        }
        const users = doc(db, "users", id)
        const usersnap = await getDoc(users)

        if(!usersnap.exists()){
            return res.status(400).json({status:false, message: "user does not exist"})
        }
     
     
     

     const data_to_update = {
        phone,height,father_name,mother_name, parent_is_married,
            siblings_and_married,rabbi_shul,name, relation,about,looking_for, 
            cohen, marital_status,
            first_name,
            last_name,
            d_o_b,location, profile_picture, photos
     }

     const docRef = doc(db, "users", id)
     const data =await updateDoc(docRef, data_to_update)

     return res.status(200).json({status: true, message: "data update Successful", data: data})

     


    }
    catch(error){
        return res.status(500).json({status:false, error })

    }
        


    },
    async delete_user(req:Request, res:Response){
        try{
        const {id} = req.params

        const users = doc(db, "users", id)
            const usersnap = await getDoc(users)

            if(!usersnap.exists()){
                return res.status(400).json({status:false, message: "user does not exist"})
            }

        const docRef = doc(db, "users", id)
        await deleteDoc(docRef)

        return res.status(200).json({status: true, message: "User removed successfully"})

        }
        catch(error){
            return res.status(500).json({status:false, error})
            
        }
    },
    async creategroups(req: Request, res: Response){
        const email= req.body.email
        const useref = collection(db, 'users')
         const search =    query(useref,where("email", "==", email))
         const searchsnapshot = await getDocs(search)
        let role = true

         searchsnapshot.forEach((doc)=>{
            //console.log(doc.id, "=>", doc.data())
            role = doc.data().is_admin

         })

        
         if(role!= true){
            return res.status(401).json({status: false, message: "Unauthorized access"})
         }


         const {group_name, description} = req.body
         const members: [] = []


         const groupref = collection(db, 'groups')

       const group = {
        group_name,
        description,
        }

     
        

    
       const new_group =  await addDoc(groupref, group)
       const membersCollection = collection(new_group, 'members');
       const groups = doc(db, "groupz", new_group.id)
         const groupsnap =  await getDoc(groups)
        

         

       return res.status(201).json({status:true, message:"Group created successfully",  data: groupsnap.data()})

        
    },

    async reviewuser(req: Request, res: Response){
        const {user_id, is_verified} = req.body


        const email= req.body.email
        const useref = collection(db, 'users')
         const search =    query(useref,where("email", "==", email))
         const searchsnapshot = await getDocs(search)
        let role = true

         searchsnapshot.forEach((doc)=>{
            //console.log(doc.id, "=>", doc.data())
            role = doc.data().is_admin

         })

        
         if(role!= true){
            return res.status(401).json({status: false, message: "Unauthorized access"})
         }

         const users = doc(db, "users", user_id)
         const usersnap = await getDoc(users)

         if(!usersnap.exists()){
             return res.status(400).json({status:false, message: "user does not exist"})
         }
      
      
      

      const data_to_update = {
        is_verified
      }

      const docRef = doc(db, "users", user_id)
      const data =await updateDoc(docRef, data_to_update)

      return res.status(200).json({status: true, message: "User review successful", data: data})


         






    },

    async deletegroup(req: Request, res: Response){
        const {id} = req.params

        const group = doc(db, "groups", id)
        const groupsnap = await getDoc(group)

        if(!groupsnap.exists()){
            return res.status(400).json({status:false, message: "Group does not exist"})
        }

        const docRef = doc(db, "groups", id)
        await deleteDoc(docRef)

        return res.status(200).json({status: true, message: "Group Deleted Successfully"})
    },
    async editgroup(req: Request, res:Response){

        const {group_id} = req.body

        const {description} = req.body

        const group = doc(db, "groups", group_id)
        const groupsnap = await getDoc(group)

        if(!groupsnap.exists()){
            return res.status(400).json({status:false, message: "Group does not exist"})
        }
       

        const data_to_update ={
            description: description
         }

         const addRef = doc(db, "groups", group_id)
         const Ref =await updateDoc(addRef, data_to_update)


         return res.status(200).json({status: true, message: "Group edited successfully"})



    }



}