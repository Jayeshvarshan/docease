import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.js";
import { assets } from "../assets/assets";

const DoctorDashboard = () => {
  const { backendUrl, doctorToken } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const parts = slotDate.split("-");
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  };

  const isToday = (slotDate) => {
    const today = new Date();
    const parts = slotDate.split("-");
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[0], 10);
    return (
      today.getDate() === day &&
      today.getMonth() + 1 === month &&
      today.getFullYear() === year
    );
  };

  const fetchDoctorData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dtoken: doctorToken },
      });
      if (data.success) {
        setDoctorData(data.doctorData);
      }
    } catch (error) {
      console.error("Fetch doctor data error:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { dtoken: doctorToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch appointments error:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-appointment`,
        { appointmentId, status },
        { headers: { dtoken: doctorToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update appointment");
    }
  };

  useEffect(() => {
    if (doctorToken) {
      fetchDoctorData();
      fetchAppointments();
    }
  }, [doctorToken]);

  const todayAppointments = appointments.filter(
    (a) => isToday(a.slotDate) && !a.cancelled
  );

  const upcomingAppointments = appointments.filter(
    (a) => !isToday(a.slotDate) && !a.cancelled && !a.isCompleted
  );

  const displayedAppointments =
    activeTab === "today" ? todayAppointments : upcomingAppointments;

  const statusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Doctor Info Header */}
      {doctorData && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <img
              className="w-36 h-36 object-cover rounded-lg bg-indigo-50"
              src={doctorData.image || assets?.profile_pic}
              alt="doctor"
            />
          </div>
          <div className="flex-1 border border-gray-200 rounded-lg p-6 bg-white">
            <p className="text-2xl font-semibold text-gray-900">
              {doctorData.name}
            </p>
            <p className="text-gray-600 mt-1">
              {doctorData.speciality}
              {doctorData.experience && ` · ${doctorData.experience}`}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              {doctorData.about}
            </p>
            <p className="text-primary font-medium mt-2">
              Consultation Fee: ${doctorData.fees}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
          <p className="text-2xl font-bold text-primary">
            {todayAppointments.length}
          </p>
          <p className="text-gray-500 text-sm">Today's Appointments</p>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
          <p className="text-2xl font-bold text-primary">
            {upcomingAppointments.length}
          </p>
          <p className="text-gray-500 text-sm">Upcoming</p>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
          <p className="text-2xl font-bold text-primary">
            {appointments.filter((a) => !a.cancelled).length}
          </p>
          <p className="text-gray-500 text-sm">Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "today"
              ? "bg-primary text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}>
          Today's Appointments
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "upcoming"
              ? "bg-primary text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}>
          Upcoming Appointments
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading appointments...</p>
      ) : displayedAppointments.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No {activeTab === "today" ? "today's" : "upcoming"} appointments.
        </p>
      ) : (
        <div className="space-y-4">
          {displayedAppointments.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Patient Info */}
                <div className="flex items-center gap-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover bg-indigo-50"
                    src={item.userData?.image}
                    alt="patient"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.userData?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.userData?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Phone: {item.userData?.phone}
                    </p>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {slotDateFormat(item.slotDate)}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {item.slotTime}
                  </p>
                  <p>
                    <span className="font-medium">Fee:</span> ${item.amount}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor(
                      item.status
                    )}`}>
                    {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                  </span>

                  {item.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(item._id, "accepted")}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(item._id, "rejected")}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}

                  {item.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(item._id, "completed")}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
