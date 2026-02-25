import { Outlet } from "react-router-dom";
import Navbar from "../layout/NavBar";
import CartDrawer from "./CartDrawer";

export const UserLayout = () => {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Outlet />
      </main>
    </>
  );
};
