import axios from "../../utils/axiosConfig";
import React, { useState }  from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export const ForbiddenPage = () => (
  <div style={{ textAlign: "center", padding: "50px" }}>
    <h1>403 - Forbidden</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

export const UnauthorizedPage = () => (
  <div style={{ textAlign: "center", padding: "50px" }}>
    <h1>401 - Unauthorized Access</h1>
    <p>401 - You don’t have permission to view this page.</p>
  </div>
);

export const NotFoundPage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>404 - Page Not Found</h1>
      <p>404 - The page you’re looking for doesn’t exist.</p>
    </div>
  );
}
