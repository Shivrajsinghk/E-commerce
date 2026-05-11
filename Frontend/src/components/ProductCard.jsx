import { Link } from "react-router-dom";

function ProductCard({ product }) {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    return (
        <Link to={`/product/${product.id}`} className="block">
            <div className="bg-gray-600 p-4 m-2 shadow-md rounded-lg hover:bg-gray-700 transition duration-300 cursor-pointer">
                {/* Product Image */}
                <div className="mb-4">
                    <img 
                        src={`${BASE_URL}${product.image}`} 
                        alt={product.name} 
                        className="w-full h-40 object-cover rounded"
                    />
                </div>
                {/* Product Name */}
                <div className="text-lg font-semibold text-white capitalize mb-2">
                    {product.name}
                </div>
                {/* Product Price */}
                <div className="text-xl font-bold text-green-400">
                    ₹{product.price}
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;