import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth"; 
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/authSlice";

function Login(){
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const [form, setForm] = useState({
        username: "",
        password: ""
    })
    const [msg, setMsg] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMsg('')
        try{
            const response = await axios.post(`${BASE_URL}/api/token/`, 
                form, 
                { 
                headers: {
                    "Content-Type": "application/json"
                },
            }) 
            setToken(response.data);
            dispatch(loginSuccess());
            setMsg("Login successful! Redirecting...");
            setTimeout(() => {
                navigate("/");
            }, 1000);
        }
        catch(err){
            setMsg("Invalid credentials ❌"); 
            console.log(err)
        }
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Login
                </h2>
                <form 
                className="space-y-5"
                onSubmit={handleSubmit}
                >
                    {/* Username */}
                    <input
                    type="text"
                    onChange={handleChange}
                    name="username"
                    placeholder="username"
                    required
                    value={form.username}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Password */}
                    <input
                    type="password"
                    onChange={handleChange}
                    name="password"
                    placeholder="password"
                    required
                    value={form.password}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Submit Button */}
                    <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
                    >
                        Login
                    </button>
                    <p className={`text-sm text-center ${msg.includes("successful") ? "text-green-400" : "text-red-400"}`}>
                        {msg}
                    </p>
                    <p className="text-gray-300 text-sm text-center">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-indigo-400 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login