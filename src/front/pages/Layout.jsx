import { Outlet, useLocation, useNavigate } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useEffect } from "react"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
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