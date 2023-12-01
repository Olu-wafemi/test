import bodyParser from "body-parser"
import express from "express"
import http from "http"
import WebSocket from "ws"
import userRouter from "./src/routes/user.route"
import AdminRouter from "./src/routes/admin.route"
import * as functionsV2 from 'firebase-functions/v2';

//import * as functionsV2 from 'firebase-functions';
import UserRoutes from "./src/routes/user.route"
//import { Server } from 'socket.io';
//import { configureRoutes } from './src/routes/chat'
import chatRoutes from './src/routes/chat';
const app = express()
const jwt = require('jsonwebtoken')

import {Server, Socket} from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';


const server = http.createServer(app);

const io = new Server(server);
//io.on("connection",()=>{
//  console.log('connected')
//})
app.use(bodyParser.json())
app.use("/api", AdminRouter)
app.use('/api', chatRoutes(io));
app.use('/api', UserRoutes(io))
app.use((req, res, next) => {
  // Implement your logic to extract user information from the request
  // For example, retrieve user ID from a session, token, or other authentication mechanism
  
  next()
});

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,set-cookie');
  res.setHeader('Access-Control-Allow-Credentials', "true");
  next();
});


export const receiverIdToSocketIdMap: any = {};


interface CustomSocket extends Socket {
  userId?: string;
}



io.on('connection', async(socket: CustomSocket) => {
  console.log('A user connected');

  socket.on('join', (token) => {
    
    // Handle user joining logic
    const decodedToken = jwt.verify(token, "SECRET");

  const user_id = decodedToken.user_id

    // Associate userId with the socket for later reference
    socket.userId= user_id;

    socket.join(user_id);


  })
  /*
  const token = socket.handshake.query.token

  const decodedToken = jwt.verify(token, "SECRET");

  const user_id = decodedToken.user_id

  receiverIdToSocketIdMap[user_id] = socket.id

  console.log(receiverIdToSocketIdMap)
  */


  //console.log(socket.request)
  //userSocketMap[user_id] = socket.id;
  //console.log(socket)
  //console.log(user_id)

  
  

  socket.emit("Connection Successful")

  // Listen for chat messages
 

  socket.on('join-group', async(group_id, token) => {

  

  const decodedToken = jwt.verify(token, "SECRET");

  const user_id = decodedToken.user_id

  const addRef = doc(db, "groups", group_id)

  const membersCollection = collection(addRef, 'members');
  const memberDocRef = doc(membersCollection, user_id);
  await setDoc(memberDocRef, { inGroup: true });
    console.log(`${user_id} joined group ${group_id}`);
    socket.join(group_id);
    // Additional logic: you might want to notify others in the group about the new member
    io.to(group_id).emit('user-joined-group', { group_id, user_id });
});


  socket.on('send-group-message', async ( group_id, token, message ) => {
    //console.log(`Group message in group ${group_id} from ${to}: ${message}`);
    const decodedToken = jwt.verify(token, "SECRET");

  const sender_id = decodedToken.user_id
    // Handle group message sending logic, e.g., save to Firestore and broadcast to group members
    const addRef = doc(db, "groups", group_id)
    //const groupDoc = collection( addRef, group_id)
    const messagesCollection = collection(addRef, 'messages');
    const timestamp = new Date();

    
    await addDoc(messagesCollection, {
      sender_id,
      text: message,

      timestamp,
    });
    

    

    // Broadcast the message to the group members using Socket.io
    io.to(group_id).emit('receive-group-message', { sender_id, message, timestamp });
});


socket.on('send-user-message', async ( token, message ) => {
  console.log(`User ${socket.userId} sent a message to $: ${message}`);

  const sender = socket.userId!

  const decodedToken = jwt.verify(token, "SECRET");

  const recipientId = decodedToken.user_id

  const addRef = doc(db, "groups", sender)
  // Handle user message sending logic, e.g., save to Firestore
  const messagesCollection = collection(addRef, 'user_messages')

  // Save the message to the sender's collection

  // Save the message to the recipient's collection
  const timestamp = new Date();
  await addDoc(messagesCollection, {
   recipientId,
   text: message,
   timestamp,
  });

  // Emit the message to both the sender and the recipient
  io.to(sender).emit('receive-user-message', { recipientId, senderId: socket.userId, message });
  io.to(recipientId).emit('receive-user-message', { recipientId, senderId: socket.userId, message });
});

  /*
  socket.on('login successful',(msg)=>{

    const user_id = msg.user_id

    userSocketMap[user_id] = socket.id;
    

    console.log(userSocketMap)
    io.emit( userSocketMap[user_id]);

  })
  */


  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
    const receiverId = receiverIdToSocketIdMap[socket.id];
    if (receiverId) {
      receiverIdToSocketIdMap[receiverId] = "";
    }
    console.log(receiverIdToSocketIdMap)

  });
});


io.on("login successful", (socket)=>{

  console.log(socket)
})


//app.use("/api", userRouter)

//configureRoutes(app, io);
const port = 3000
server.listen(port, () => {
    console.log(`Servier is running on port ${port}`)
})

app.all("*", (req, res) => {
    res.status(404).json({
      status: false,
      error: "You Completely Lost Your Way 😈",
    });
  });



//export const the_appv2 = functionsV2.https.onRequest(app)