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
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../../firebase");
const jwt = require('jsonwebtoken');
const is_admin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({
            status: false,
            message: 'Authorization Header is not Present'
        });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, "SECRET");
    }
    catch (error) {
        if (error.message == 'jwt expired') {
            return res.status(401).json({
                status: false,
                //message: 'Invalid Authentication Token'
                message: error.message
            });
        }
        return res.status(400).json({
            status: false,
            message: error.message
        });
    }
    //if the token was not verified
    if (!decodedToken) {
        return res.status(401).json({
            status: false,
            message: 'Invalid Authentication Token'
        });
    }
    req.body.email = decodedToken.email;
    req.body.user_id = decodedToken.user_id;
    req.body.token = token;
    const email = decodedToken.email;
    const useref = (0, firestore_1.collection)(firebase_1.db, 'users');
    const search = (0, firestore_1.query)(useref, (0, firestore_1.where)("email", "==", email));
    const searchsnapshot = yield (0, firestore_1.getDocs)(search);
    let role = true;
    searchsnapshot.forEach((doc) => {
        //console.log(doc.id, "=>", doc.data())
        role = doc.data().is_admin;
    });
    if (role != true) {
        return res.status(401).json({ status: false, message: "Unauthorized access" });
    }
    next();
});
exports.default = is_admin;
