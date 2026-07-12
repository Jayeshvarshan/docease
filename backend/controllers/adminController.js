import validator from "validator";
import bcrypt from "bcryptjs";
import doctorModel from "../models/doctorModel.js";

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" });
    if (password.length < 8) return res.json({ success: false, message: "Please enter a strong password" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = "";
    if (imageFile) {
      imageUrl = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await doctorModel.findOne({ email: normalizedEmail });
    if (existing) return res.json({ success: false, message: "Email already registered. Please login." });

    await doctorModel.create({
      name, email: normalizedEmail, image: imageUrl, password: hashedPassword,
      speciality, degree, experience, about, fees,
      address: typeof address === "string" ? JSON.parse(address) : address,
      date: Date.now(),
    });

    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ success: false, message: "Error. Please try again." });
  }
};

export { addDoctor };
