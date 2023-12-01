import { Application } from 'express';
//import { Server } from 'ws';



//import { configureController } from '../controllers/chat';
//import {configureController} from '../controllers/chat'
//import configureController from '../controllers/chat';
import WebSocket from 'ws';
//import { Server } from 'socket.io';


import express from 'express';
import { chatController } from '../controllers/chat'
import { Server } from 'socket.io';

const router = express.Router();
const chatRoutes = (io: Server) => {
  router.get('/:user1/:user2', chatController.getChats);
  router.post('/send-message', (req, res) => chatController.sendMessage(req, res, io));

  return router;
};


export default chatRoutes;





