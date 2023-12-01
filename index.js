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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiverIdToSocketIdMap = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const admin_route_1 = __importDefault(require("./src/routes/admin.route"));
const cors_1 = __importDefault(require("cors"));
//import * as functionsV2 from 'firebase-functions';
const user_route_1 = __importDefault(require("./src/routes/user.route"));
//import { Server } from 'socket.io';
//import { configureRoutes } from './src/routes/chat'
const chat_1 = __importDefault(require("./src/routes/chat"));
const app = (0, express_1.default)();
const jwt = require('jsonwebtoken');
const socket_io_1 = require("socket.io");
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("./firebase");
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true
}));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "https://the-app-svqo.onrender.com");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,set-cookie');
    res.setHeader('Access-Control-Allow-Credentials', "true");
    next();
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
//io.on("connection",()=>{
//  console.log('connected')
//})
app.use(body_parser_1.default.json());
app.use("/api", admin_route_1.default);
app.use('/api', (0, chat_1.default)(io));
app.use('/api', (0, user_route_1.default)(io));
exports.receiverIdToSocketIdMap = {};
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('A user connected');
    socket.on('join', (token) => {
        // Handle user joining logic
        const decodedToken = jwt.verify(token, "SECRET");
        const user_id = decodedToken.user_id;
        // Associate userId with the socket for later reference
        socket.userId = user_id;
        socket.join(user_id);
    });
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
    socket.emit("Connection Successful");
    // Listen for chat messages
    socket.on('join-group', (group_id, token) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedToken = jwt.verify(token, "SECRET");
        const user_id = decodedToken.user_id;
        const addRef = (0, firestore_1.doc)(firebase_1.db, "groups", group_id);
        const membersCollection = (0, firestore_1.collection)(addRef, 'members');
        const memberDocRef = (0, firestore_1.doc)(membersCollection, user_id);
        yield (0, firestore_1.setDoc)(memberDocRef, { inGroup: true });
        console.log(`${user_id} joined group ${group_id}`);
        socket.join(group_id);
        // Additional logic: you might want to notify others in the group about the new member
        io.to(group_id).emit('user-joined-group', { group_id, user_id });
    }));
    socket.on('send-group-message', (group_id, token, message) => __awaiter(void 0, void 0, void 0, function* () {
        //console.log(`Group message in group ${group_id} from ${to}: ${message}`);
        const decodedToken = jwt.verify(token, "SECRET");
        const sender_id = decodedToken.user_id;
        // Handle group message sending logic, e.g., save to Firestore and broadcast to group members
        const addRef = (0, firestore_1.doc)(firebase_1.db, "groups", group_id);
        //const groupDoc = collection( addRef, group_id)
        const messagesCollection = (0, firestore_1.collection)(addRef, 'messages');
        const timestamp = new Date();
        yield (0, firestore_1.addDoc)(messagesCollection, {
            sender_id,
            text: message,
            timestamp,
        });
        // Broadcast the message to the group members using Socket.io
        io.to(group_id).emit('receive-group-message', { sender_id, message, timestamp });
    }));
    socket.on('send-user-message', (token, message) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`User ${socket.userId} sent a message to $: ${message}`);
        const sender = socket.userId;
        const decodedToken = jwt.verify(token, "SECRET");
        const recipientId = decodedToken.user_id;
        const addRef = (0, firestore_1.doc)(firebase_1.db, "groups", sender);
        // Handle user message sending logic, e.g., save to Firestore
        const messagesCollection = (0, firestore_1.collection)(addRef, 'user_messages');
        // Save the message to the sender's collection
        // Save the message to the recipient's collection
        const timestamp = new Date();
        yield (0, firestore_1.addDoc)(messagesCollection, {
            recipientId,
            text: message,
            timestamp,
        });
        // Emit the message to both the sender and the recipient
        io.to(sender).emit('receive-user-message', { recipientId, senderId: socket.userId, message });
        io.to(recipientId).emit('receive-user-message', { recipientId, senderId: socket.userId, message });
    }));
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
        const receiverId = exports.receiverIdToSocketIdMap[socket.id];
        if (receiverId) {
            exports.receiverIdToSocketIdMap[receiverId] = "";
        }
        console.log(exports.receiverIdToSocketIdMap);
    });
}));
io.on("login successful", (socket) => {
    console.log(socket);
});
//app.use("/api", userRouter)
//configureRoutes(app, io);
const port = 3000;
server.listen(port, () => {
    console.log(`Servier is running on port ${port}`);
});
app.all("*", (req, res) => {
    res.status(404).json({
        status: false,
        error: "You Completely Lost Your Way 😈",
    });
});
//export const the_appv2 = functionsV2.https.onRequest(app)
