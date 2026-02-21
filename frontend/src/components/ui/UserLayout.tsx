import { Outlet } from "react-router-dom";
import Navbar from "../layout/NavBar";
import CartDrawer from "./CartDrawer";

export const UserLayout = () => {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Outlet /> {/* หน้าลูกๆ เช่น HomePage, ProductDetail จะมาโผล่ตรงนี้ */}
      </main>
    </>
  );
};
