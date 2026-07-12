import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.js";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message || "Account created successfully");
          navigate(location.state?.from || "/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message || "Login successful");
          navigate(location.state?.from || "/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center ">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[304px] sm:min-w-96 border border-gray-200 rounded-xl text-zinc-600  text-sm shadow-lg">
        <p className="text-2xl font-semibold">{state == "Sign Up" ? "Create Account" : "Login"}</p>
        <p >
          Please {state == "Sign Up" ? "sign up" : "log in"} to book appointment
        </p>
        {
          state==="Sign Up" && <div className="w-full">
          <p>Full Name</p>
          <input className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
            minLength={2}
          />
        </div>
        }
        
        <div className="w-full">
          <p>Email</p>
          <input className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-70'>
          {loading ? "Please wait..." : state == "Sign Up" ? "Create Account" : "Login"}
        </button>
        {
          state==="Sign Up"
          ?<p>Already have an account? <span onClick={()=>setState('Login')} className="text-primary underline cursor-pointer"> Login here</span></p>
          : <p>Create an new account?<span onClick={()=>setState('Sign Up')} className="text-primary underline cursor-pointer"> click here</span></p>
        }
      </div>
    </form>
  );
};

export default Login;
