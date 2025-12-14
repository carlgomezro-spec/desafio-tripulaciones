import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Header/Navbar/Navbar";
import Footer from "../Footer/Footer";

const Layout = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const hideNavbarRoutes = ["/login", "/"];

  const showNavbar =
    isLoggedIn && !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Outlet />
      {showNavbar && <Footer />}
    </>
  );
};

export default Layout;
