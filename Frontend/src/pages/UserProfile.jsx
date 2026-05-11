import { useEffect, useState } from "react"; 
import authFetch from '../utils/auth'
import { setProfile } from "../features/profileSlice";
import { useDispatch } from "react-redux";
import Loading from "../components/Loading";

function UserProfile() {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: "",
        email: "",
        address: "",
        phone_number: "",
        city: "",
        state: "",
        pincode: "",
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const response = await authFetch("/api/user_profile/");
                const data = {
                    name: response.data.name || "",
                    email: response.data.email || "",
                    address: response.data.address || "",
                    phone_number: response.data.phone_number || "",
                    city: response.data.city || "",
                    state: response.data.state || "",
                    pincode: response.data.pincode || "",
                }
                setForm(data)
                dispatch(setProfile(data))
            } catch (err) {
                console.error(err);
            }
            finally{
                setLoading(false)
            }
            };
            fetchProfile();
    }, [dispatch])

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            await authFetch.put("/api/user_profile/", {
                name: form.name,
                address: form.address,
                phone_number: form.phone_number,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
            });
        alert("Profile updated ✅");
        } catch (err) {
        console.error(err);
        }
        finally{
            setLoading(false)
        }
    }

    if(loading){
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
            <div className="w-full max-w-xl bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">
                User Profile
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
                />
                {/* Email */}
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    placeholder="Your Email"
                    className="w-full p-3 rounded-xl bg-gray-700 opacity-70 cursor-not-allowed"
                />
                {/* Address */}
                <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Your Address"
                    className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
                />
                {/* Phone Number */}
                <input
                    type="text"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
                />
                {/* City */}
                <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
                />
                {/* State */}
                <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
                />
                {/* Pin Code */}
                <input
                    type="number"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="Pin Code"
                    className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
                />
                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 p-3 rounded-xl transition"
                >
                    {loading ? "Updating..." : "Update Profile"}
                </button>
                </form>
            </div>
        </div>
    )
}

export default UserProfile