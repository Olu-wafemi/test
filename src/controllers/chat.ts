import { Application, Request, Response } from 'express';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import { collection, addDoc,query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

import admin from 'firebase-admin'

import { receiverIdToSocketIdMap } from '../../index';



export const chatController = {
   async getChats(req: Request, res: Response){

    const { user1, user2 } = req.params;

    const messagesRef = collection(db, "messagecollection");

  const q = query(messagesRef, 
  where('sender', 'in', [user1, user2]),
  where('receiver', 'in', [user1, user2]),
  orderBy('timestamp')
  );

const querySnapshot = await getDocs(q);
/*
querySnapshot.forEach((doc) => {
 console.log(doc.data());
});
*/

const messages = querySnapshot .docs.map((doc) => doc.data());
res.json({ messages });




   },
   async sendMessage(req: Request, res: Response, io: Server){



      const {sender, receiver,message} = req.body

      const messagecollection = collection(db, 'messagecollection')

      const data = {
        sender,
        receiver, 
        message,
        timestamp: Date.now()
      }

      const new_data = await addDoc(messagecollection,data)


      const receiverSocketId: string = receiverIdToSocketIdMap[receiver];

      io.to(receiverSocketId).emit('chat message', { message, sender });
      res.json({ message: 'Send message endpoint' });
      



   }
}

/*

  export const sendMessage = async (io: Server, req: Request, res: Response) => {

    
            

   
    const { senderId, receiverId, message }= req.body


        try{
            const path = `${senderId}-${receiverId}`
            const ref = collection(db, 'messages')
           // console.log(ref)
            const docsss = {
                senderId,
                message,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            }
            //console.log(doc)

            const new_chat = await addDoc(ref, docsss)
            console.log(new_chat)
            console.log('done')
            
            io.to(path).emit('message', { senderId, message });
        
             return res.status(200).json({ success: true });
        }
        catch{
            return 'Error'

        }
    }

    */


//export default configureController