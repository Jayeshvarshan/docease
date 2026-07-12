import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.js";

const DoctorLogin = () => {
  const { backendUrl, doctorToken, setDoctorToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    if (doctorToken) {
      navigate("/doctor-dashboard");
    }
  }, [doctorToken, navigate]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setSpeciality("");
    setExperience("");
    setFees("");
    setAbout("");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === "Sign Up") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        const { data } = await axios.post(`${backendUrl}/api/doctor/register`, {
          name,
          email,
          password,
          phone,
          speciality,
          experience,
          fees,
          about,
        });

        if (data.success) {
          localStorage.setItem("doctorToken", data.token);
          setDoctorToken(data.token);
          toast.success(data.message || "Doctor account created successfully");
          navigate("/doctor-dashboard");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("doctorToken", data.token);
          setDoctorToken(data.token);
          toast.success(data.message || "Login successful");
          navigate("/doctor-dashboard");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Doctor auth error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[304px] sm:min-w-[420px] border border-gray-200 rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Doctor Registration" : "Doctor Login"}
        </p>
        <p>
          {state === "Sign Up"
            ? "Register as a doctor on MedicoHub"
            : "Login to your doctor account"}
        </p>

        {state === "Sign Up" && (
          <>
            <div className="w-full">
              <p>Full Name *</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
                minLength={2}
              />
            </div>
            <div className="w-full">
              <p>Phone Number</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="tel"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
              />
            </div>
            <div className="w-full">
              <p>Specialization *</p>
              <select
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                required>
                <option value="">Select Specialization</option>
                <option value="General physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            <div className="flex gap-3 w-full">
              <div className="w-1/2">
                <p>Years of Experience</p>
                <input
                  className="border border-zinc-300 rounded w-full p-2 mt-1"
                  type="text"
                  onChange={(e) => setExperience(e.target.value)}
                  value={experience}
                  placeholder="e.g. 5 Years"
                />
              </div>
              <div className="w-1/2">
                <p>Consultation Fee ($)</p>
                <input
                  className="border border-zinc-300 rounded w-full p-2 mt-1"
                  type="number"
                  onChange={(e) => setFees(e.target.value)}
                  value={fees}
                  min="0"
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            <div className="w-full">
              <p>Short Description / Bio</p>
              <textarea
                className="border border-zinc-300 rounded w-full p-2 mt-1 resize-none"
                rows="3"
                onChange={(e) => setAbout(e.target.value)}
                value={about}
                placeholder="Tell patients about your experience and expertise"
              />
            </div>
          </>
        )}

        <div className="w-full">
          <p>Email *</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Password *</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            minLength={8}
          />
        </div>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Confirm Password *</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
              minLength={8}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-70">
          {loading
            ? "Please wait..."
            : state === "Sign Up"
            ? "Create Doctor Account"
            : "Login"}
        </button>

        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => {
                resetForm();
                setState("Login");
              }}
              className="text-primary underline cursor-pointer">
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new doctor account?{" "}
            <span
              onClick={() => {
                resetForm();
                setState("Sign Up");
              }}
              className="text-primary underline cursor-pointer">
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default DoctorLogin;
