"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controllers/admin");
const is_admin_1 = __importDefault(require("../middleware/is_admin"));
const Router = express_1.default.Router();
Router.get("/admin/fetch-users", is_admin_1.default, admin_1.AdminController.fetchallusers);
Router.post("/admin/edit-profile", is_admin_1.default, admin_1.AdminController.edit_user_profile);
Router.delete("/admin/delete_user/:id", is_admin_1.default, admin_1.AdminController.delete_user);
Router.post("/admin/review_profile", is_admin_1.default, admin_1.AdminController.reviewuser);
Router.post("/admin/creategroup", is_admin_1.default, admin_1.AdminController.creategroups);
Router.delete("/admin/delete_group/:id", is_admin_1.default, admin_1.AdminController.deletegroup);
Router.put("/admin/edit_group", is_admin_1.default, admin_1.AdminController.editgroup);
exports.default = Router;
