import { Link, useParams } from "react-router-dom"; 
import { useState, useEffect } from "react";
import authFetch from "../utils/auth";
import { getCart } from "../features/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

function ProductDetails() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/get_product/${id}/`)
            .then((response) => {   
                setProduct(response.data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <Loading />
    }

    if (error) {
        return <div className="text-center text-red-400 mt-20">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
                {/* Image Section */}
                <div className="h-80 md:h-full">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col justify-between">
                    {/* Product Details */}
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {product.name.toUpperCase()}
                        </h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {product.description}
                        </p>
                        <p className="text-2xl font-semibold text-green-400 mb-6">
                            ₹{product.price}
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                    
                    {/* Add to Cart Button */}
                    <button 
                        onClick={async() => {
                            if (!isLoggedIn) {
                                navigate('/login');   
                                return;               
                            }
                            try{
                                await authFetch.post(`/api/add_to_cart/`, {
                                    product_id: product.id,
                                    quantity: 1
                                })
                                const updatedCart = await authFetch.get(`/api/get_cart/`);
                                dispatch(getCart(updatedCart.data));
                            }
                            catch (err) {
                                console.log("FULL ERROR:", err.response);
                            }
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-500 transition px-6 py-3 rounded-xl text-white font-semibold"
                    >
                        🛒 Add to Cart
                    </button>
                    
                    {/* Back Button */}
                    <Link 
                        to="/" 
                        className="flex-1 bg-gray-700 hover:bg-gray-600 transition px-6 py-3 rounded-xl text-white text-center"
                    >
                        ← Back
                    </Link>

                </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
