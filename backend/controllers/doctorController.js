import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

const sanitize = (doc) => {
  if (!doc) return null;
  const { password, email, ...rest } = doc;
  return rest;
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.findAll();
    res.json({ success: true, doctors: doctors.map(sanitize) });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.json({ success: false, message: error.message });
  }
};

const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, speciality, experience, fees, about } = req.body;
    if (!name || !email || !password || !speciality) {
      return res.json({ success: false, message: "Name, email, password, and specialization are required" });
    }

    if (name.trim().length < 2) return res.json({ success: false, message: "Please enter a valid name" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await doctorModel.findOne({ email: normalizedEmail });
    if (existing) return res.json({ success: false, message: "Email already registered. Please login." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await doctorModel.create({
      name: name.trim(), email: normalizedEmail, password: hashedPassword,
      phone: phone || "", speciality, experience: experience || "",
      fees: Number(fees) || 0, about: about || "", date: Date.now(),
    });

    const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, message: "Doctor account created successfully" });
  } catch (error) {
    console.error("Register doctor error:", error);
    if (error.errno === 1062) return res.json({ success: false, message: "Email already registered. Please login." });
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: "Email and password are required" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" });

    const normalizedEmail = email.trim().toLowerCase();
    const doctor = await doctorModel.findOne({ email: normalizedEmail });
    if (!doctor) return res.json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, message: "Login successful" });
  } catch (error) {
    console.error("Login doctor error:", error);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctorData = await doctorModel.findById(req.doctorId);
    if (!doctorData) return res.json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctorData: sanitize(doctorData) });
  } catch (error) {
    console.error("Get doctor profile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile. Please try again." });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { name, phone, speciality, experience, fees, about, address, available } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (speciality) updateData.speciality = speciality;
    if (experience !== undefined) updateData.experience = experience;
    if (fees !== undefined) updateData.fees = Number(fees);
    if (about !== undefined) updateData.about = about;
    if (address !== undefined) updateData.address = address;
    if (available !== undefined) updateData.available = available;

    await doctorModel.updateById(req.doctorId, updateData);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update doctor profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile. Please try again." });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ doc_id: req.doctorId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({ success: false, message: "Failed to load appointments. Please try again." });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    if (!appointmentId || !status) return res.json({ success: false, message: "Appointment ID and status are required" });

    const validStatuses = ["accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) return res.json({ success: false, message: "Invalid status. Must be accepted, rejected, or completed" });

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.json({ success: false, message: "Appointment not found" });
    if (appointment.doc_id !== req.doctorId) return res.json({ success: false, message: "Unauthorized" });

    const updateData = { status };
    if (status === "completed") updateData.is_completed = true;
    if (status === "rejected") updateData.cancelled = true;

    await appointmentModel.updateById(appointmentId, updateData);
    res.json({ success: true, message: `Appointment ${status} successfully` });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ success: false, message: "Failed to update appointment. Please try again." });
  }
};

export { doctorList, registerDoctor, loginDoctor, getDoctorProfile, updateDoctorProfile, getDoctorAppointments, updateAppointmentStatus };
