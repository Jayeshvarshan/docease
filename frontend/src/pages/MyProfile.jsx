import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext.js";

const MyProfile = () => {
  const { userData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [profileData, setProfileData] = useState({
    name: "",
    image: assets.profile_pic,
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
    },
    gender: "Not Selected",
    dob: "Not Selected",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || "",
        image: userData.image || assets.profile_pic,
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || { line1: "", line2: "" },
        gender: userData.gender || "Not Selected",
        dob: userData.dob || "Not Selected",
      });
    }
  }, [userData]);

  const updateUserProfileData = async () => {
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        {
          name: profileData.name,
          phone: profileData.phone,
          address: JSON.stringify(profileData.address),
          gender: profileData.gender,
          dob: profileData.dob,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        await loadUserProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <p className="text-gray-500 mt-10">Loading profile...</p>;
  }

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      <img className="w-36 rounded" src={profileData.image} alt="user-image" />
      {isEdit ? (
        <input className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          value={profileData.name}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4 ">{profileData.name}</p>
      )}

      <hr className= "hr-gray bg-zinc-300 h-[1px] border border-none" />
      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium ">Email Id:</p>
          <p className="text-blue-500">{profileData.email}</p>
          <p className="font-medium ">Phone:</p>
          {isEdit ? (
            <input className="bg-gray-100 max-w-52"
              type="text"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <p className="text-blue-400">{profileData.phone}</p>
          )}
          <p className="font-medium ">Address:</p>
          {isEdit ? (
            <p>
              <input className="bg-gray-50"
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
                value={profileData.address.line1}
                type="text"
              />
              <br />
              <input  className="bg-gray-50"
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
                value={profileData.address.line2}
                type="text"
              />
            </p>
          ) : (
            <p className="text-gray-500">
              {profileData.address.line1}
              <br />
              {profileData.address.line2}
            </p>
          )}
        </div>
      </div>
      <div>
        <p className="text-neutral-500 underline mt-3 ">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select className="max-w-20 bg-gray-100"
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, gender: e.target.value }))
              }
              value={profileData.gender}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{profileData.gender}</p>
          )}
          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input className="max-w-28 bg-gray-100"
              type="date"
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, dob: e.target.value }))
              } value={profileData.dob === "Not Selected" ? "" : profileData.dob}
            />
          ) : (
            <p className="text-gray-400">{profileData.dob}</p>
          )}
        </div>
      </div>
      <div className="mt-10">
        {
          isEdit ?
          <button
            disabled={loading}
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-300ms disabled:opacity-70"
            onClick={updateUserProfileData}>
            {loading ? "Saving..." : "Save information"}
          </button>:
          <button className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-300ms" onClick={()=>setIsEdit(true)}>Edit</button>

        }
      </div>
    </div>
  );
};

export default MyProfile;
