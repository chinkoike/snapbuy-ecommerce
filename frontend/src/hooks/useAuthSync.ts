import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useUserStore } from "../store/ีuseUserStore";

export const useAuthSync = () => {
  const { getAccessTokenSilently, isAuthenticated, user, isLoading } =
    useAuth0();
  const setUser = useUserStore((state) => state.setUser);

  // ใช้ Ref เพื่อป้องกันการเรียก API ซ้ำซ้อน (Prevent double-call in React Strict Mode)
  const isSyncing = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      // เช็คว่าโหลดเสร็จหรือยัง, ล็อกอินหรือยัง และไม่ได้กำลังซิงค์อยู่
      if (isLoading || !isAuthenticated || !user || isSyncing.current) return;

      isSyncing.current = true;

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "openid profile email",
          },
        });

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // เก็บข้อมูล User จาก DB ลงใน Zustand
        setUser(response.data);
      } catch (error) {
        console.error("Error syncing user:", error);
      } finally {
        isSyncing.current = false; // จบการซิงค์
      }
    };

    syncUser();
  }, [isLoading, isAuthenticated, getAccessTokenSilently, user, setUser]);
};
