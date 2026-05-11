import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../features/cartSlice';
import { useNavigate } from 'react-router-dom';
import authFetch from '../utils/auth';
import { setProfile } from '../features/profileSlice';
import Loading from '../components/Loading';

// Razorpay popup is NOT built into React. So, It comes from the external JS file
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function Checkout() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const user = useSelector((state) => state.profile.user)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.cartItems);
    const [form, setForm] = useState({
        name: "",
        email: "",
        address: "",
        phone_number: "",
        payment_method: "COD"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                address: user.address || "",
                phone_number: user.phone_number || ""
            }));
            return;
        }

        const fetchProfile = async () => {
            try{
                const response = await authFetch(`/api/user_profile/`)
                const data = response.data
                dispatch(setProfile(data));
                setForm((prev) => ({
                    ...prev,
                    name: data.name || "",
                    email: data.email || "",
                    address: data.address || "",
                    phone_number: data.phone_number || ""
                }))
            }
            catch (error) {
                console.log(error)
            }
        }
        if (isAuthenticated) {
            fetchProfile();  
        }
    }, [user, isAuthenticated, BASE_URL, dispatch])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (cartItems.length === 0) {
            setError("Cart is empty!")
            return
        }
        setLoading(true);
        try{
            if (form.payment_method !== "COD") {
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    setError("Unable to load Razorpay. Please check your internet connection.");
                    return;
                }

                const orderResponse = await authFetch.post(`/api/create_razorpay_order/`, {
                    ...form,
                    payment_method: "RAZORPAY"
                });
                const razorpayOrder = orderResponse.data;

                if (razorpayOrder.success === false) {
                    setError(razorpayOrder.error || "Unable to create Razorpay order.");
                    return;
                }

                await new Promise((resolve, reject) => {
                    const options = {
                        key: razorpayOrder.key,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        name: "E-Commerce Store",
                        description: "Order payment",
                        order_id: razorpayOrder.razorpay_order_id,
                        prefill: {
                            name: form.name,
                            email: form.email,
                            contact: form.phone_number
                        },
                        notes: {
                            address: form.address
                        },
                        handler: async (response) => {
                            try {
                                const verifyResponse = await authFetch.post(`/api/verify_razorpay_payment/`, {
                                    order_id: razorpayOrder.order_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                });

                                if (verifyResponse.data.success === false) {
                                    reject(new Error(verifyResponse.data.error || "Payment verification failed."));
                                    return;
                                }

                                resolve();
                            }
                            catch (err) {
                                reject(err);
                            }
                        },
                        modal: {
                            ondismiss: () => reject(new Error("Payment cancelled."))
                        },
                        theme: {
                            color: "#3b82f6"
                        }
                    };

                    const razorpay = new window.Razorpay(options);
                    razorpay.on("payment.failed", (response) => {
                        reject(new Error(response.error?.description || "Payment failed."));
                    });
                    razorpay.open();
                });

                setSuccess("Payment successful! Order placed.");
                dispatch(clearCart());
                setTimeout(() => {
                    navigate("/");
                }, 2000);
                return;
            }

            await authFetch.post(`/api/create_cod_order/`, {
                ...form,
                items: cartItems.map((item) => ({
                    product: item.id,
                    quantity: item.quantity
                }))
            });
            setSuccess("Order placed successfully!");
            setTimeout(() => {
                navigate("/");
            }, 2000);
            dispatch(clearCart());
        }
        catch(err){
            setError("Order failed")
            console.log("ORDER ERROR:", err)
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
            <h1 className='text-2xl font-bold mb-4'>Checkout Page</h1>
            <form 
            className='w-full max-w-md bg-white p-6 rounded-lg shadow-md'
            onSubmit={handleSubmit}    
            >
                {/* Name */}
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Name</label>
                    <input  
                    type="text"
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
                    value={form.name}   
                    placeholder='Full Name'
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                    />  
                </div>
                {/* Email */}
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Email</label>
                    <input 
                    type="email"
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
                    value={form.email}
                    placeholder='Email Address'
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    required
                    />
                </div>
                {/* Address */}
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Address</label>
                    <textarea
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
                    value={form.address}    
                    placeholder='Shipping Address'
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    required
                    />
                </div>
                {/* Phone Number */}
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Phone Number</label>    
                    <input
                    type="tel"
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
                    value={form.phone_number}
                    title="Enter 10 digit phone number"
                    placeholder='Phone Number'
                    onChange={(e) => setForm({...form, phone_number: e.target.value})}
                    required
                    />
                </div>
                {/* Payment Method */}
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Payment Method</label>
                    <select
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300'
                    value={form.payment_method}
                    onChange={(e) => setForm({...form, payment_method: e.target.value})}
                    >
                        <option value="COD">Cash on Delivery</option>
                        <option value="RAZORPAY">Razor Pay</option>
                    </select>
                </div>
                {/* Submit Button */}
                <button 
                type='submit'   
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md transition duration-200 
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                `}
                >
                    {loading ? <Loading /> : 'Place Order'}
                </button>
                {error && !success && <p className='text-red-500 mt-4'>{error}</p>}
                {success && <p className='text-green-500 mt-4'>{success}</p>}
            </form>
        </div>
    )
}

export default Checkout;
