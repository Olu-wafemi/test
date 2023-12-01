"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../../firebase");
const index_1 = require("../../index");
exports.chatController = {
    getChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user1, user2 } = req.params;
            const messagesRef = (0, firestore_1.collection)(firebase_1.db, "messagecollection");
            const q = (0, firestore_1.query)(messagesRef, (0, firestore_1.where)('sender', 'in', [user1, user2]), (0, firestore_1.where)('receiver', 'in', [user1, user2]), (0, firestore_1.orderBy)('timestamp'));
            const querySnapshot = yield (0, firestore_1.getDocs)(q);
            /*
            querySnapshot.forEach((doc) => {
             console.log(doc.data());
            });
            */
            const messages = querySnapshot.docs.map((doc) => doc.data());
            res.json({ messages });
        });
    },
    sendMessage(req, res, io) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sender, receiver, message } = req.body;
            const messagecollection = (0, firestore_1.collection)(firebase_1.db, 'messagecollection');
            const data = {
                sender,
                receiver,
                message,
                timestamp: Date.now()
            };
            const new_data = yield (0, firestore_1.addDoc)(messagecollection, data);
            const receiverSocketId = index_1.receiverIdToSocketIdMap[receiver];
            io.to(receiverSocketId).emit('chat message', { message, sender });
            res.json({ message: 'Send message endpoint' });
        });
    }
};
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
