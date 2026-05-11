import { getCart, updateCart, removeFromCart } from "../features/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authFetch from "../utils/auth";
import Loading from "../components/Loading";

function Cart() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.cartItems || []); 
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const total = Array.isArray(cartItems)
        ? cartItems.reduce(
            (sum, item) =>
                sum + (Number(item.product.price) * Number(item.quantity)),
            0
        )
        : 0;

    useEffect(() => {
        authFetch.get(`/api/get_cart/`)
            .then((response) => {   
                dispatch(getCart(response.data));
            })
            .catch((error) => {
                console.log(error)
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch, BASE_URL, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-3">
            <div className="max-w-4xl w-full bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden p-4">
                <h2 className="text-3xl font-bold text-white mb-6">Your Cart</h2>
                {loading ? (
                    <Loading />
                ) : cartItems.length > 0 ? (
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            // Product Details 
                            <div key={item.id} className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg">
                                {/* Product Image */}
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                {/* Product Name and quantity */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                                    <p className="text-gray-400">₹{item.product.price} x {item.quantity}</p>
                                </div>
                                {/* Product's total price */}
                                <p className="text-lg font-semibold text-green-400">
                                    {
                                    item.product.price && item.quantity
                                        ? `₹${(Number(item.product.price) * Number(item.quantity)).toFixed(2)}`
                                        : "₹0.00"
                                    }
                                </p>
                                <div>
                                    {/* ➕ Increase */}
                                    <button
                                        onClick={async () => {
                                            const newQty = Number(item.quantity) + 1;
                                            try{
                                                const response = await authFetch.post(`/api/update_cart/`, {
                                                    product_id: item.product.id,
                                                    quantity: newQty
                                                })
                                                const updatedCart = await authFetch.get(`/api/get_cart/`);
                                                dispatch(getCart(updatedCart.data));
                                            }
                                            catch (err) {
                                                console.error(err)
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-500 transition px-3 py-1 rounded text-white font-semibold"   
                                    >
                                        +
                                    </button>
                                    {/* ➖ Decrease */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                if (Number(item.quantity) > 1) {
                                                    const newQty = Number(item.quantity) - 1;

                                                    await authFetch.post(`/api/update_cart/`, {
                                                        product_id: item.product.id,
                                                        quantity: newQty
                                                    });
                                                } else {
                                                    await authFetch.post(`/api/remove_from_cart/`, {
                                                        product_id: item.product.id
                                                    });
                                                }
                                                const updatedCart = await authFetch.get(`/api/get_cart/`);
                                                dispatch(getCart(updatedCart.data));
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                        className="ml-2 bg-yellow-600 hover:bg-yellow-500 transition px-3 py-1 rounded text-white font-semibold"
                                    >
                                        -
                                    </button>
                                </div>
                                 {/* ❌ Remove */}
                                <button
                                    onClick={async () => {
                                        try{                                        
                                            const response = await authFetch.post(`/api/remove_from_cart/`, {
                                                product_id: item.product.id
                                            })
                                            const updatedCart = await authFetch.get(`/api/get_cart/`);
                                            dispatch(getCart(updatedCart.data));
                                        }
                                        catch (err) {
                                            console.error(err)
                                        }
                                    }}
                                    className="ml-4 bg-red-600 hover:bg-red-500 transition px-3 py-1 rounded text-white font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))} 
                        {/* Total */}
                        <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Total</h3>
                            <p className="text-2xl font-bold text-green-400">
                                ₹{Number(total).toFixed(2)}
                            </p>
                        </div>
                        {/* Checkout Button */}
                        <div className="mt-6 flex justify-end">
                            <Link to="/checkout" className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded text-white font-semibold">
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">Your cart is empty.</p>
                )}
            </div>
        </div>
    );
}

export default Cart;
