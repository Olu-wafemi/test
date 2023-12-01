import express from 'express';
import { AdminController } from '../controllers/admin';
import is_admin from "../middleware/is_admin";

const Router = express.Router()

Router.get("/admin/fetch-users", is_admin, AdminController.fetchallusers)
Router.post("/admin/edit-profile", is_admin,AdminController.edit_user_profile)
Router.delete("/admin/delete_user/:id",is_admin, AdminController.delete_user)
Router.post("/admin/review_profile", is_admin, AdminController.reviewuser)
Router.post("/admin/creategroup", is_admin, AdminController.creategroups)
Router.delete("/admin/delete_group/:id",  is_admin,AdminController.deletegroup)
Router.put("/admin/edit_group", is_admin,AdminController.editgroup)

export default Router