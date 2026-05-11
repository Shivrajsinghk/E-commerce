import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

function Signup(){
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        password2: ""
    })
    const [msg, setMsg] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMsg('')
        if (form.password !== form.password2) {
            setMsg("Passwords do not match ❌");
            return;
        }
        try{
            const response = await axios.post(`${BASE_URL}/api/register/`, 
                form, 
                { 
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const data = response.data; 
            setMsg("Sign Up successful! Redirecting...");
            setTimeout(() => {
                navigate("/login");
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
                    Sign Up
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
                    placeholder="Username"
                    required
                    value={form.username}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Email */}
                    <input
                    type="email"
                    onChange={handleChange}
                    name="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Password */}
                    <input
                    type="password"
                    onChange={handleChange}
                    name="password"
                    placeholder="Password"
                    required
                    value={form.password}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Confirm Password */}
                    <input
                    type="password"
                    onChange={handleChange}
                    name="password2"
                    placeholder="Confirm Password"
                    required
                    value={form.password2}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Submit Button */}
                    <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
                    >
                        Sign Up
                    </button>
                    <p className={`text-sm text-center ${msg.includes("successful") ? "text-green-400" : "text-red-400"}`}>
                        {msg}
                    </p>
                    <p className="text-gray-300 text-sm text-center">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-400 hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Signup