import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ //comes from userPayload,,, should be the same
    nameLNfirst: "",
    nameFNfirst: "",
    userId: "",
    schoolId: "",
    role: "",
    lastName: "", 
    firstName: "",
    isArchived: false,
  });
  const [accessToken, setAccessToken] = useState('');

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);