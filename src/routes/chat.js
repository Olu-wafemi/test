"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { Server } from 'socket.io';
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const router = express_1.default.Router();
const chatRoutes = (io) => {
    router.get('/:user1/:user2', chat_1.chatController.getChats);
    router.post('/send-message', (req, res) => chat_1.chatController.sendMessage(req, res, io));
    return router;
};
exports.default = chatRoutes;
