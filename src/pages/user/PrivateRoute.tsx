import { CircularProgress } from "@mui/material";
import { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import http from "../../../httpclient";
interface PrivateRouteProps {
  children: JSX.Element;
}

const ACCESS_TOKEN = "accessToken"; // Your token key

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null); // null = loading, true = valid, false = invalid

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsValid(false);
      return;
    }

    // Validate token via API
    http
      .get("/v1/userdetails")
      .then(() => setIsValid(true))
      .catch(() => {
        localStorage.clear();
        setIsValid(false);
      });
  }, []);

  if (isValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <CircularProgress size="5rem" style={{ color: "#8B4513" }} />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default PrivateRoute;
