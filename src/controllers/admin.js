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
exports.AdminController = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../../firebase");
exports.AdminController = {
    fetchallusers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = (0, firestore_1.collection)(firebase_1.db, "users");
                const email = req.body.email;
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
                const userSnapshot = yield (0, firestore_1.getDocs)(users);
                const data = {};
                userSnapshot.forEach((doc) => {
                    //console.log(doc.id, " => ", doc.data());
                    data[doc.id] = doc.data();
                });
                return res.status(201).json({ status: true, data });
            }
            catch (error) {
                return res.status(500).json({ status: false, error });
            }
        });
    },
    edit_user_profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, phone, height, father_name, mother_name, parent_is_married, siblings_and_married, rabbi_shul, name, relation, about, looking_for, cohen, marital_status, first_name, last_name, d_o_b, location, profile_picture, photos, } = req.body;
                if (!id) {
                    return res.status(400).json({ status: false, message: "id is required" });
                }
                const users = (0, firestore_1.doc)(firebase_1.db, "users", id);
                const usersnap = yield (0, firestore_1.getDoc)(users);
                if (!usersnap.exists()) {
                    return res.status(400).json({ status: false, message: "user does not exist" });
                }
                const data_to_update = {
                    phone, height, father_name, mother_name, parent_is_married,
                    siblings_and_married, rabbi_shul, name, relation, about, looking_for,
                    cohen, marital_status,
                    first_name,
                    last_name,
                    d_o_b, location, profile_picture, photos
                };
                const docRef = (0, firestore_1.doc)(firebase_1.db, "users", id);
                const data = yield (0, firestore_1.updateDoc)(docRef, data_to_update);
                return res.status(200).json({ status: true, message: "data update Successful", data: data });
            }
            catch (error) {
                return res.status(500).json({ status: false, error });
            }
        });
    },
    delete_user(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const users = (0, firestore_1.doc)(firebase_1.db, "users", id);
                const usersnap = yield (0, firestore_1.getDoc)(users);
                if (!usersnap.exists()) {
                    return res.status(400).json({ status: false, message: "user does not exist" });
                }
                const docRef = (0, firestore_1.doc)(firebase_1.db, "users", id);
                yield (0, firestore_1.deleteDoc)(docRef);
                return res.status(200).json({ status: true, message: "User removed successfully" });
            }
            catch (error) {
                return res.status(500).json({ status: false, error });
            }
        });
    },
    creategroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.body.email;
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
            const { group_name, description } = req.body;
            const members = [];
            const groupref = (0, firestore_1.collection)(firebase_1.db, 'groups');
            const group = {
                group_name,
                description,
            };
            const new_group = yield (0, firestore_1.addDoc)(groupref, group);
            const membersCollection = (0, firestore_1.collection)(new_group, 'members');
            const groups = (0, firestore_1.doc)(firebase_1.db, "groupz", new_group.id);
            const groupsnap = yield (0, firestore_1.getDoc)(groups);
            return res.status(201).json({ status: true, message: "Group created successfully", data: groupsnap.data() });
        });
    },
    reviewuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, is_verified } = req.body;
            const email = req.body.email;
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
            const users = (0, firestore_1.doc)(firebase_1.db, "users", user_id);
            const usersnap = yield (0, firestore_1.getDoc)(users);
            if (!usersnap.exists()) {
                return res.status(400).json({ status: false, message: "user does not exist" });
            }
            const data_to_update = {
                is_verified
            };
            const docRef = (0, firestore_1.doc)(firebase_1.db, "users", user_id);
            const data = yield (0, firestore_1.updateDoc)(docRef, data_to_update);
            return res.status(200).json({ status: true, message: "User review successful", data: data });
        });
    },
    deletegroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const group = (0, firestore_1.doc)(firebase_1.db, "groups", id);
            const groupsnap = yield (0, firestore_1.getDoc)(group);
            if (!groupsnap.exists()) {
                return res.status(400).json({ status: false, message: "Group does not exist" });
            }
            const docRef = (0, firestore_1.doc)(firebase_1.db, "groups", id);
            yield (0, firestore_1.deleteDoc)(docRef);
            return res.status(200).json({ status: true, message: "Group Deleted Successfully" });
        });
    },
    editgroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { group_id } = req.body;
            const { description } = req.body;
            const group = (0, firestore_1.doc)(firebase_1.db, "groups", group_id);
            const groupsnap = yield (0, firestore_1.getDoc)(group);
            if (!groupsnap.exists()) {
                return res.status(400).json({ status: false, message: "Group does not exist" });
            }
            const data_to_update = {
                description: description
            };
            const addRef = (0, firestore_1.doc)(firebase_1.db, "groups", group_id);
            const Ref = yield (0, firestore_1.updateDoc)(addRef, data_to_update);
            return res.status(200).json({ status: true, message: "Group edited successfully" });
        });
    }
};
