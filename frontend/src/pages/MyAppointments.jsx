import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext.js";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const parts = slotDate.split("-");
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
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

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel appointment error:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700">My Appointments</p>
      <hr className="hr-gray" />

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No appointments booked yet.
        </p>
      ) : (
        <div>
          {appointments.map((item, index) => (
            <div
              key={item._id || index}
              className={`grid grid-cols-[1fr_2fr] sm:flex sm:items-center sm:justify-between sm:gap-6 py-4 border-b border-gray-200 ${
                item.cancelled ? "opacity-60" : ""
              }`}>
              {/* Doctor Image */}
              <div>
                <img
                  className="w-32 h-32 object-cover rounded-lg bg-indigo-50"
                  src={item.docData?.image}
                  alt="doctor"
                />
              </div>

              {/* Doctor Details */}
              <div className="flex-1 text-sm ml-4 sm:ml-0 text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item.docData?.name}
                </p>
                <p>{item.docData?.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item.docData?.address?.line1}</p>
                <p className="text-xs">{item.docData?.address?.line2}</p>
                <p className="text-sm mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
              <div></div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-4 sm:mt-0">
                {!item.cancelled && !item.isCompleted && (
                  <>
                    <button className="text-sm text-stone-500 text-center sm:min-w-48 ml-4 py-2 border rounded border-gray-200 hover:bg-primary hover:text-white transition-all duration-300">
                      Pay Online
                    </button>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 ml-4 py-2 border rounded border-gray-200 hover:bg-red-600 hover:text-white transition-all duration-300">
                      Cancel Appointment
                    </button>
                  </>
                )}
                {item.cancelled && (
                  <p className="text-sm text-red-500 text-center sm:min-w-48 ml-4 py-2 border border-red-200 rounded">
                    Cancelled
                  </p>
                )}
                {item.isCompleted && (
                  <p className="text-sm text-green-600 text-center sm:min-w-48 ml-4 py-2 border border-green-200 rounded">
                    Completed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
