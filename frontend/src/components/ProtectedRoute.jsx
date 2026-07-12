import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext.js";

const ProtectedRoute = ({ children, doctorOnly }) => {
  const { token, doctorToken } = useContext(AppContext);
  const location = useLocation();

  if (doctorOnly) {
    if (!doctorToken) {
      return (
        <Navigate
          to="/doctor-login"
          state={{ from: location.pathname }}
          replace
        />
      );
    }
    return children;
  }

  if (!token) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
