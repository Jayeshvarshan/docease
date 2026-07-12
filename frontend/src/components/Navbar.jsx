import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.js";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, userData, logout, doctorToken, logoutDoctor } =
    useContext(AppContext);
  const [showMenu, setshowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleDoctorLogout = () => {
    logoutDoctor();
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-300">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer active:scale-95 transition-transform duration-150"
        src={assets.logo}
        alt="logo-picture"
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">HOME</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">ALL DOCTORS</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-3">
        {/* Doctor logged in */}
        {doctorToken ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/doctor-dashboard")}
              className="bg-primary text-white px-6 py-3 rounded-full font-light hidden md:block">
              Doctor Dashboard
            </button>
            <button
              onClick={handleDoctorLogout}
              className="text-red-600 border border-red-200 px-4 py-3 rounded-full font-light hidden md:block hover:bg-red-50 transition-all">
              Logout
            </button>
          </div>
        ) : token ? (
          /* Patient logged in */
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setShowDropdown(!showDropdown)}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}>
            <img
              className="w-8 rounded-full"
              src={userData ? userData.image : assets.profile_pic}
              alt="profile picture"
            />
            <img
              className="w-2.5"
              src={assets.dropdown_icon}
              alt="dropdown icon"
            />
            {showDropdown && (
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 shadow-lg">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="hover:text-black cursor-pointer">
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="hover:text-black cursor-pointer">
                    My Appointments
                  </p>
                  <p
                    onClick={handleLogout}
                    className="hover:text-red-600 text-red-600 cursor-pointer">
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Not logged in */
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/doctor-login")}
              className="border border-primary text-primary px-6 py-3 rounded-full font-light hidden md:block hover:bg-primary hover:text-white transition-all">
              Doctor's Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block">
              Create account
            </button>
          </div>
        )}

        <img
          onClick={() => setshowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="menu-icon"
        />

        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="logo-pic" />
            <img
              className="w-7"
              onClick={() => setshowMenu(false)}
              src={assets.cross_icon}
              alt="cross-icon"
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setshowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setshowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setshowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setshowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>

            {doctorToken ? (
              <>
                <NavLink
                  onClick={() => setshowMenu(false)}
                  to="/doctor-dashboard">
                  <p className="px-4 py-2 rounded inline-block">
                    DOCTOR DASHBOARD
                  </p>
                </NavLink>
                <p
                  onClick={() => {
                    handleDoctorLogout();
                    setshowMenu(false);
                  }}
                  className="px-4 py-2 rounded inline-block text-red-600 cursor-pointer">
                  LOGOUT
                </p>
              </>
            ) : token ? (
              <>
                <NavLink onClick={() => setshowMenu(false)} to="/my-profile">
                  <p className="px-4 py-2 rounded inline-block">MY PROFILE</p>
                </NavLink>
                <NavLink
                  onClick={() => setshowMenu(false)}
                  to="/my-appointments">
                  <p className="px-4 py-2 rounded inline-block">
                    MY APPOINTMENTS
                  </p>
                </NavLink>
                <p
                  onClick={() => {
                    handleLogout();
                    setshowMenu(false);
                  }}
                  className="px-4 py-2 rounded inline-block text-red-600 cursor-pointer">
                  LOGOUT
                </p>
              </>
            ) : (
              <>
                <NavLink onClick={() => setshowMenu(false)} to="/login">
                  <p className="px-4 py-2 rounded inline-block">
                    PATIENT LOGIN
                  </p>
                </NavLink>
                <NavLink
                  onClick={() => setshowMenu(false)}
                  to="/doctor-login">
                  <p className="px-4 py-2 rounded inline-block">
                    DOCTOR LOGIN
                  </p>
                </NavLink>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
