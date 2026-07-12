import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm ">
        {/* left section */}
        <div>
          <img
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-40 mb-5 cursor-pointer active:scale-95 transition-transform duration-150"
            src={assets.logo}
            alt="logo-picture"
          />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>
        {/* center section */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="cursor-pointer hover:text-black">
              Home
            </li>
            <li
              onClick={() => {
                navigate("/about");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="cursor-pointer hover:text-black">
              About us
            </li>
            <li
              onClick={() => {
                navigate("/contact");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="cursor-pointer hover:text-black">
              Contact us
            </li>
            <li className="cursor-pointer hover:text-black">Privacy policy</li>
          </ul>
        </div>
        {/* right section */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>
              <a
                href="tel:+12124567890"
                className="text-primary hover:text-blue-800 hover:underline cursor-pointer transition-colors">
                +1-212-456-7890
              </a>
            </li>

            <li>
              <a
                href="mailto:mubaseer213@gmail.com"
                className="text-primary hover:text-blue-800 hover:underline cursor-pointer transition-colors">
                mubaseer213@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* COpyright text */}
      <div>
        <hr className="hr-gray"/>
        <p className="py-5  text-sm text-center">
          Copyright © 2025 MedicoHub - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
