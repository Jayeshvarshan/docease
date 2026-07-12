import express from "express";
import {
  doctorList,
  registerDoctor,
  loginDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/register", registerDoctor);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/profile", authDoctor, getDoctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.get("/appointments", authDoctor, getDoctorAppointments);
doctorRouter.post("/update-appointment", authDoctor, updateAppointmentStatus);

export default doctorRouter;
