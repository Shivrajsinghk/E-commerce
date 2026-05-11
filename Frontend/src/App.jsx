import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NavBar from "./components/NavBar";
import Cart from "./pages/Cart";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCart } from "./features/cartSlice";
import Checkout from "./pages/Checkout";
import Login from './pages/Login'
import Signup  from './pages/Signup'
import PrivateRouter from './components/PrivateRouter'
import authFetch from "./utils/auth";
import { authInitialized, loginSuccess, logout } from "./features/authSlice";
import { getAccessToken, getRefreshToken, isTokenExpired, refreshAccessToken, removeToken } from "./utils/auth";
import UserProfile from "./pages/UserProfile";
import Orders from "./pages/Orders";

function App() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const dispatch = useDispatch();
    
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            if (!accessToken && !refreshToken) {
                dispatch(authInitialized());
                return;
            }

            try {
                if (!accessToken || isTokenExpired(accessToken)) {
                    await refreshAccessToken();
                }

                dispatch(loginSuccess());
                try {
                    const res = await authFetch.get("/api/get_cart/");
                    dispatch(getCart(res.data));
                }
                catch {
                }
            }
            catch {
                removeToken();
                dispatch(logout());
            }
            finally {
                dispatch(authInitialized());
            }
        };

        initializeAuth();
    }, [BASE_URL, dispatch])

    return (
        <Router>
            <NavBar />
                <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route element={<PrivateRouter />}>
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/user-profile" element={<UserProfile />} />
                        <Route path="/orders" element={<Orders />} />
                    </Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Routes>
        </Router>
    );
}

export default App;
