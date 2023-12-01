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
exports.Usercontroller = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_1 = require("../../firebase");
const user_validator_1 = require("../validation/user.validator");
const firestore_1 = require("firebase/firestore");
const uuid_1 = require("uuid");
exports.Usercontroller = {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { email } = req.body;
                email = email.toLowerCase();
                const { is_admin } = req.body;
                let { password } = req.body;
                const { name } = req.body;
                const RegistrationError = (0, user_validator_1.validateRegistrationData)(name, email, password);
                let user_email = "";
                const userefs = (0, firestore_1.collection)(firebase_1.db, 'users');
                const search = (0, firestore_1.query)(userefs, (0, firestore_1.where)("email", "==", email));
                const searchsnapshot = yield (0, firestore_1.getDocs)(search);
                // console.log(searchsnapshot)
                searchsnapshot.forEach((doc) => {
                    //console.log(doc.id, "=>", doc.data())
                    user_email = doc.data().email;
                });
                if (RegistrationError) {
                    return res.status(400).json({ status: false, error: RegistrationError });
                }
                if (user_email == email) {
                    return res.status(400).json({ status: false, message: "User exists" });
                }
                password = yield bcrypt_1.default.hash(password, 10);
                //const useref = collection(db, 'users')
                const { is_verified } = req.body;
                const user = {
                    email,
                    password,
                    name,
                    is_admin,
                    is_verified
                };
                const randomUid = (0, uuid_1.v4)();
                const userDocRef = (0, firestore_1.doc)(firebase_1.db, 'users', randomUid);
                const new_user = yield (0, firestore_1.setDoc)(userDocRef, user);
                const id = userDocRef.id;
                const userprofileref = (0, firestore_1.doc)(firebase_1.db, "userProfiles", randomUid);
                const user_profile = yield (0, firestore_1.setDoc)(userprofileref, {
                    userId: id,
                    location: { latitude: 0, longitude: 0 },
                    age: 18,
                    distance: 50,
                });
                //const new_user =  await addDoc(useref, user)
                return res.status(201).json({ status: true, message: "Signup Successful" });
            }
            catch (error) {
                res.status(500).json({ status: false, error });
                console.log(error);
            }
        });
    },
    login(req, res, io) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const LoginValidation = (0, user_validator_1.validateLoginData)(email, password);
            if (LoginValidation) {
                return res.status(401).json({ status: false, error: LoginValidation });
            }
            let user_password = "";
            let user_data = {};
            let user_id = "";
            const useref = (0, firestore_1.collection)(firebase_1.db, 'users');
            const search = (0, firestore_1.query)(useref, (0, firestore_1.where)("email", "==", email.toLowerCase()));
            const searchsnapshot = yield (0, firestore_1.getDocs)(search);
            // console.log(searchsnapshot)
            searchsnapshot.forEach((doc) => {
                //console.log(doc.id, "=>", doc.data())
                user_password = doc.data().password;
                user_data = doc.data();
                user_id = doc.id;
            });
            const correct_password = yield bcrypt_1.default.compare(password, user_password);
            if (!correct_password) {
                return res.status(401).json({ status: false, message: "Password is incorrect" });
            }
            // const secret  = process.env.HASH
            const token = jsonwebtoken_1.default.sign({
                email,
                password,
                user_id
            }, "SECRET");
            io.emit('login successful', { user_id });
            return res.status(200).json({ status: true, message: "Logged In", token: token, data: user_data });
        });
    },
    UpdateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone, height, father_name, mother_name, parent_is_married, siblings_and_married, rabbi_shul, name, relation, about, looking_for, cohen, marital_status, first_name, last_name, d_o_b, location, profile_picture, photos, } = req.body;
                const user_id = req.body.user_id;
                const users = (0, firestore_1.doc)(firebase_1.db, "users", user_id);
                const usersnap = yield (0, firestore_1.getDoc)(users);
                if (!usersnap.exists()) {
                    return res.status(400).json({ status: false, message: "user does not exist" });
                }
                const userId = user_id;
                const data_to_update = {
                    phone, height, father_name, mother_name, parent_is_married,
                    siblings_and_married, rabbi_shul, name, relation, about, looking_for,
                    cohen, marital_status,
                    first_name,
                    last_name,
                    d_o_b, location, profile_picture, photos
                };
                const filteredData = Object.fromEntries(Object.entries(data_to_update).filter(([_, value]) => value !== undefined));
                const docRef = (0, firestore_1.doc)(firebase_1.db, "userProfiles", user_id);
                const data = yield (0, firestore_1.updateDoc)(docRef, filteredData);
                return res.status(200).json({ status: true, message: "data update Successful", data: data });
            }
            catch (error) {
                return res.status(500).json({ status: false, error });
            }
        });
    },
    set_preferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { minDistance, maxDistance, minAge, maxAge } = req.body;
            const user_id = req.body.user_id;
            const users = (0, firestore_1.doc)(firebase_1.db, "users", user_id);
            const usersnap = yield (0, firestore_1.getDoc)(users);
            if (!usersnap.exists()) {
                return res.status(400).json({ status: false, message: "user does not exist" });
            }
            const docRef = (0, firestore_1.doc)(firebase_1.db, "userProfiles", user_id);
            const pref = {
                minDistance, maxDistance, minAge, maxAge
            };
            const data = yield (0, firestore_1.updateDoc)(docRef, pref);
            return res.status(200).json({ status: true, message: "Pref set successfully Successful" });
        });
    },
    joingroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { group_id } = req.body;
            const user_id = req.body.user_id;
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
            const addRef = (0, firestore_1.doc)(firebase_1.db, "groups", group_id);
            const membersCollection = (0, firestore_1.collection)(addRef, 'members');
            const memberDocRef = (0, firestore_1.doc)(membersCollection, user_id);
            yield (0, firestore_1.setDoc)(memberDocRef, { inGroup: true });
            //  /const Ref =await updateDoc(addRef, data_to_update)
            return res.status(200).json({ status: true, message: "User joined group successfully", });
        });
    },
    fetch_all_groups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = (0, firestore_1.collection)(firebase_1.db, "groups");
            const userSnapshot = yield (0, firestore_1.getDocs)(groups);
            const data = {};
            userSnapshot.forEach((doc) => {
                //console.log(doc.id, " => ", doc.data());
                data[doc.id] = doc.data();
            });
            return res.status(201).json({ status: true, data });
        });
    },
    matching_algorithm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_id = req.body.user_id;
            const addRef = (0, firestore_1.doc)(firebase_1.db, "userProfiles", user_id);
            const currentuserprofile = yield (0, firestore_1.getDoc)(addRef);
            const currentUserData = currentuserprofile.data();
            const ageQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, 'userProfiles'), (0, firestore_1.where)('age', '>=', currentUserData.minAge), (0, firestore_1.where)('age', '<=', currentUserData.maxAge));
            const userIdQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, 'userProfiles'), (0, firestore_1.where)('userId', '!=', user_id));
            const ageSnapshot = yield (0, firestore_1.getDocs)(ageQuery);
            const userIdSnapshot = yield (0, firestore_1.getDocs)(userIdQuery);
            const potentialMatches = [...ageSnapshot.docs, ...userIdSnapshot.docs]
                .filter(doc => {
                const matchData = doc.data();
                return matchData.location && currentUserData.location && matchData.userId != user_id
                    && calculateDistance(matchData.location, currentUserData.location) <= currentUserData.maxDistance;
            })
                .map(doc => doc.data());
            res.status(200).json({ matches: potentialMatches });
        });
    }
};
function calculateDistance(point1, point2) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const lat1 = toRadians(point1.latitude);
    const lon1 = toRadians(point1.longitude);
    const lat2 = toRadians(point2.latitude);
    const lon2 = toRadians(point2.longitude);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c; // Distance in kilometers
    return distance;
}
// Helper function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
