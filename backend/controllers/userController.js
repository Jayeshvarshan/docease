import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

const validateRegistrationInput = ({ name, email, password }) => {
  if (!name || !email || !password) return "All fields are required";
  if (name.trim().length < 2) return "Please enter a valid name";
  if (!validator.isEmail(email)) return "Please enter a valid email";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !password) return "Email and password are required";
  if (!validator.isEmail(email)) return "Please enter a valid email";
  return null;
};

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validationError = validateRegistrationInput({ name, email, password });
    if (validationError) return res.json({ success: false, message: validationError });

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) return res.json({ success: false, message: "Email already registered. Please login." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, message: "Account created successfully" });
  } catch (error) {
    console.error("Register error:", error);
    if (error.errno === 1062) return res.json({ success: false, message: "Email already registered. Please login." });
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validationError = validateLoginInput({ email, password });
    if (validationError) return res.json({ success: false, message: validationError });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) return res.json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId);
    if (!userData) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, userData: sanitize(userData) });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile. Please try again." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    if (!name || !phone || !dob || !gender) return res.json({ success: false, message: "All profile fields are required" });

    let parsedAddress = address;
    if (typeof address === "string") {
      try { parsedAddress = JSON.parse(address); }
      catch { return res.json({ success: false, message: "Invalid address format" }); }
    }

    await userModel.updateById(req.userId, { name: name.trim(), phone: phone.trim(), address: parsedAddress, dob, gender });
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile. Please try again." });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime, docData, amount } = req.body;
    if (!docId || !slotDate || !slotTime || !docData || !amount) return res.json({ success: false, message: "All fields are required" });

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    const existing = await appointmentModel.findOne({ doc_id: docId, slot_date: slotDate, slot_time: slotTime, cancelled: false });
    if (existing) return res.json({ success: false, message: "This doctor is already booked for the selected date and time. Please choose another time slot." });

    await appointmentModel.create({
      userId, docId, slotDate, slotTime,
      userData: { name: user.name, email: user.email, image: user.image, phone: user.phone, address: user.address, dob: user.dob, gender: user.gender },
      docData: { name: docData.name, image: docData.image, speciality: docData.speciality, fees: docData.fees },
      amount: Number(amount), date: Date.now(),
    });

    res.json({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Book appointment error:", error);
    if (error.errno === 1062) return res.json({ success: false, message: "This doctor is already booked for the selected date and time. Please choose another time slot." });
    res.status(500).json({ success: false, message: "Failed to book appointment. Please try again." });
  }
};

const listAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ user_id: req.userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("List appointments error:", error);
    res.status(500).json({ success: false, message: "Failed to load appointments. Please try again." });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.json({ success: false, message: "Appointment ID is required" });

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.json({ success: false, message: "Appointment not found" });
    if (appointment.user_id !== req.userId) return res.json({ success: false, message: "Unauthorized" });
    if (appointment.cancelled) return res.json({ success: false, message: "Appointment already cancelled" });

    await appointmentModel.updateById(appointmentId, { cancelled: true });
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel appointment. Please try again." });
  }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment };
