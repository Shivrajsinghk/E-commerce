import { Link } from "react-router-dom";   
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { logout } from "../features/authSlice";

const NavBar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const cartItems = useSelector((state) =>state.cart.cartItems)
    const totalQuantity = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;
    const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
    const handleLogout = () => {
        removeToken()
        dispatch(logout());
        navigate('/login')
    }

    return(
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition"
                >
                    MyStore
                </Link>
                {/* Right Side */}
                <div className="flex items-center gap-6">
                    {/* Cart */}
                    <button
                        onClick={() => {
                            if (!isLoggedIn) {
                                navigate("/login"); 
                            } else {
                                navigate("/cart");  
                            }
                        }}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                    >
                        <span className="text-lg">🛒</span>
                        <span className="hidden sm:block">Cart</span>
                        {totalQuantity > 0 && (
                            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                {totalQuantity}
                            </span>
                        )}
                    </button>
                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <Link 
                                to='/login'
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 transition text-sm font-semibold">
                                    Login
                                </Link>

                                <Link 
                                to='/signup'
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 transition text-sm font-semibold"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* 🧾 My Orders */}
                                <Link 
                                    to="/orders"
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
                                >
                                    Orders
                                </Link>

                                {/* ✅ Profile Link */}
                                <Link 
                                    to="/user-profile"
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
                                >
                                    Profile
                                </Link>

                                {/* Logout */}
                                <button 
                                className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 transition text-sm font-semibold"
                                onClick={handleLogout}>
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )

}

export default NavBar;