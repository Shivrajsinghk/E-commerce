import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from "react-redux";

export default function PrivateRouter(){
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const initialized = useSelector((state) => state.auth.initialized);

    if (!initialized) {
        return null;
    }
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
