import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { doctors as staticDoctors } from "../assets/assets";
import { AppContext } from "./AppContext.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "" : "http://localhost:4000");

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(false);
  const [doctorToken, setDoctorToken] = useState(
    localStorage.getItem("doctorToken") || ""
  );
  const [doctorData, setDoctorData] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserData(false);
  };

  const logoutDoctor = () => {
    localStorage.removeItem("doctorToken");
    setDoctorToken("");
    setDoctorData(false);
  };

  const loadUserProfileData = async () => {
    if (!token) {
      setUserData(false);
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token },
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        logout();
      }
    } catch (error) {
      console.error("Profile load error:", error);
      toast.error("Failed to load profile");
      logout();
    }
  };

  const loadDoctorProfileData = async () => {
    if (!doctorToken) {
      setDoctorData(false);
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dtoken: doctorToken },
      });

      if (data.success) {
        setDoctorData(data.doctorData);
      } else {
        toast.error(data.message);
        logoutDoctor();
      }
    } catch (error) {
      console.error("Doctor profile load error:", error);
      toast.error("Failed to load doctor profile");
      logoutDoctor();
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success && data.doctors && data.doctors.length > 0) {
        setDoctors([...staticDoctors, ...data.doctors]);
      } else {
        setDoctors(staticDoctors);
      }
    } catch (error) {
      console.error("Fetch doctors error:", error);
      setDoctors(staticDoctors);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  useEffect(() => {
    if (doctorToken) {
      loadDoctorProfileData();
    } else {
      setDoctorData(false);
    }
  }, [doctorToken]);

  const value = {
    doctors,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    logout,
    doctorToken,
    setDoctorToken,
    doctorData,
    setDoctorData,
    loadDoctorProfileData,
    logoutDoctor,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
