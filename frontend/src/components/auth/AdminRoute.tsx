import { useAuth0 } from "@auth0/auth0-react";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading, isAuthenticated } = useAuth0();
  console.log("USER:", user);

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const roles = user?.["https://snapbuy-api/roles"] as string[] | undefined;

  if (roles?.includes("ADMIN")) {
    return children;
  }

  return <Navigate to="/" />;
};
