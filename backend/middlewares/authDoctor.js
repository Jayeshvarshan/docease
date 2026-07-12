import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  const { dtoken } = req.headers;

  if (!dtoken) {
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    req.doctorId = token_decode.id;
    next();
  } catch (error) {
    console.error("Doctor auth error:", error);
    res.json({ success: false, message: "Invalid or expired token. Login again." });
  }
};

export default authDoctor;
