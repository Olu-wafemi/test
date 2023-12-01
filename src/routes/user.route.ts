import express from "express"
import { Usercontroller } from '../controllers/user.controller';
import auth from "../middleware/auth";
import { Server } from 'socket.io';
const Router = express.Router()



const UserRoutes = (io: Server) => {
Router.post("/register", Usercontroller.register)
Router.post("/login", (req, res) => Usercontroller.login(req, res, io))
Router.post("/updateprofile", auth,Usercontroller.UpdateProfile)
Router.post("/joingroup",auth,Usercontroller.joingroup)
Router.get("/fectch-all-groups", auth, Usercontroller.fetch_all_groups)
Router.post("/set-preference", auth, Usercontroller.set_preferences)
Router.get("/match-alogrithm", auth, Usercontroller.matching_algorithm)
return Router;

}

export default UserRoutes