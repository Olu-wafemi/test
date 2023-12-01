"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const Router = express_1.default.Router();
const UserRoutes = (io) => {
    Router.post("/register", user_controller_1.Usercontroller.register);
    Router.post("/login", (req, res) => user_controller_1.Usercontroller.login(req, res, io));
    Router.post("/updateprofile", auth_1.default, user_controller_1.Usercontroller.UpdateProfile);
    Router.post("/joingroup", auth_1.default, user_controller_1.Usercontroller.joingroup);
    Router.get("/fectch-all-groups", auth_1.default, user_controller_1.Usercontroller.fetch_all_groups);
    Router.post("/set-preference", auth_1.default, user_controller_1.Usercontroller.set_preferences);
    Router.get("/match-alogrithm", auth_1.default, user_controller_1.Usercontroller.matching_algorithm);
    return Router;
};
exports.default = UserRoutes;
