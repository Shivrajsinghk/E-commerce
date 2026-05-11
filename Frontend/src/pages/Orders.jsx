import { useState, useEffect } from "react"
import authFetch from '../utils/auth'
import Loading from '../components/Loading'

function Orders() {
    const[orders, setOrders] = useState([]) 
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const orderSteps = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered"];
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await authFetch("/api/user_order_history/");
                setOrders(response.data);
            } 
            catch (err) {
                console.log(err);
            }
            finally {
                setLoading(false); 
            }
        };
        fetchOrders();
    }, [])

    if(loading){
        return <Loading />
    }

    const capitalize = (text) => {
        if (!text) return "";
        return text
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-500/10 text-green-400";
            case "cancelled":
                return "bg-red-500/10 text-red-400";
            case "out_for_delivery":
            case "shipped":
                return "bg-blue-500/10 text-blue-400";
            case "confirmed":
                return "bg-amber-500/10 text-amber-400";
            default:
                return "bg-gray-500/10 text-gray-300";
        }
    };

    const getStepState = (currentStatus, step) => {
        if (currentStatus === "cancelled") {
            return "cancelled";
        }

        const currentIndex = orderSteps.indexOf(currentStatus);
        const stepIndex = orderSteps.indexOf(step);

        if (stepIndex < currentIndex) {
            return "completed";
        }
        if (stepIndex === currentIndex) {
            return "current";
        }
        return "upcoming";
    };

    const getStepClasses = (stepState) => {
        switch (stepState) {
            case "completed":
                return "bg-teal-400 border-teal-400 text-black";
            case "current":
                return "bg-indigo-500 border-indigo-400 text-white";
            case "cancelled":
                return "bg-red-500/20 border-red-400 text-red-300";
            default:
                return "bg-white/5 border-white/10 text-gray-500";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
                    My Orders
                </h1>

                <span className="text-sm text-gray-400">
                    {orders.length} Orders
                </span>
            </div>

            {/* Empty State */}
            {!loading && orders.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                    <p className="text-lg">No orders yet 🛒</p>
                </div>
            )}

            {/* Orders */}
            <div className="grid gap-6">
                {orders.map((order) => (
                    <div 
                        key={order.id}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
                    >

                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-400">
                                    Order #{order.id}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </p>
                            </div>

                            <span className="text-sm bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full">
                                {order.items.length} items
                            </span>
                            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">
                                {order.payment_method}
                            </span>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-3">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusClasses(order.order_status)}`}>
                                Order: {order.order_status_display || capitalize(order.order_status?.replaceAll("_", " "))}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusClasses(order.payment_status)}`}>
                                Payment: {order.payment_status_display || capitalize(order.payment_status)}
                            </span>
                        </div>

                        {order.order_status !== "cancelled" ? (
                            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                                {orderSteps.map((step) => {
                                    const stepState = getStepState(order.order_status, step);
                                    return (
                                        <div
                                            key={step}
                                            className={`rounded-xl border px-3 py-3 text-center text-xs font-medium transition ${getStepClasses(stepState)}`}
                                        >
                                            {capitalize(step.replaceAll("_", " "))}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                This order has been cancelled.
                            </div>
                        )}

                        <div className="border-t border-white/10 mb-4"></div>

                        {/* Items */}
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div 
                                    key={index}
                                    className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                                >
                                    <div>
                                        <p className="text-gray-300 font-medium">
                                            {capitalize(item.product?.name)}
                                        </p>
                                    </div>

                                    <span className="text-teal-400 font-semibold text-lg">
                                        × {item.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/10 mb-4"></div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                                Total Amount
                            </span>
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
                                ₹ {Number(order.total_price).toLocaleString("en-IN")}
                            </span>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Orders
