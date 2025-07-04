import { Outlet, useLocation, useNavigate } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useEffect } from "react"
import injectContext from "../store/appContext";

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        // exp está en segundos, Date.now() en ms
        return Date.now() > payload.exp * 1000;
    } catch {
        return true;
    }
}

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
const LayoutComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (isTokenExpired(token)) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            navigate("/login");
            return;
        }
        if (!token && location.pathname !== "/login") {
            navigate("/login");
        }
    }, [location, navigate]);

    return (
        <ScrollToTop>
            <Navbar />
            <div className="flex-grow-1">
                <Outlet />
            </div>
            <Footer />
        </ScrollToTop>
    )
}

export const Layout = injectContext(LayoutComponent);