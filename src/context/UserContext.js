import React, { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "../config/api";

const UserContext = createContext();
const ACTIVE_ACCOUNT_SESSION_KEY = "activeAccountSession";

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const saveSession = (token, user) => {
  localStorage.setItem("accessToken", token);
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("userRole", user.role);
};

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userRole");
};

const readActiveSession = () => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_ACCOUNT_SESSION_KEY));
  } catch (_error) {
    return null;
  }
};

const activateSingleSession = (user) => {
  const session = {
    accountId: user?.id || user?.email || "unknown",
    email: user?.email || "",
    startedAt: new Date().toISOString()
  };
  localStorage.setItem(ACTIVE_ACCOUNT_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("accessToken");
      const cachedUser = localStorage.getItem("currentUser");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await apiRequest("/auth/me");
        const active = readActiveSession();
        const accountId = result.user?.id || result.user?.email || "unknown";
        if (active?.accountId && active.accountId !== accountId) {
          clearSession();
          setLoading(false);
          return;
        }
        setUser(result.user);
        setUserRole(result.user.role || null);
        setCurrentSession(result.user);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(result.user));
        activateSingleSession(result.user);
      } catch (_error) {
        clearSession();
        if (cachedUser) {
          localStorage.removeItem("currentUser");
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== ACTIVE_ACCOUNT_SESSION_KEY || !isAuthenticated || !user) return;
      const next = readActiveSession();
      const accountId = user.id || user.email || "unknown";
      if (next?.accountId && next.accountId !== accountId) {
        clearSession();
        setUser(null);
        setUserRole(null);
        setCurrentSession(null);
        setIsAuthenticated(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthenticated, user]);

  const login = async (email, password, role = null) => {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    saveSession(result.token, result.user);
    activateSingleSession(result.user);
    setUser(result.user);
    setUserRole(result.user.role || null);
    setCurrentSession(result.user);
    setIsAuthenticated(true);
    return result.user;
  };

  const register = async (userData, role = "customer") => {
    const result = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...userData, role: userData.role || role }),
    });
    saveSession(result.token, result.user);
    activateSingleSession(result.user);
    setUser(result.user);
    setUserRole(result.user.role || null);
    setCurrentSession(result.user);
    setIsAuthenticated(true);
    return result.user;
  };

  const loginAsAdmin = async (email, password) => login(email, password, "admin");
  const loginAsTechnician = async (email, password) => login(email, password, "technician");
  const loginAsSuperAdmin = async (email, password) => login(email, password, "superadmin");

  const logout = () => {
    const active = readActiveSession();
    const accountId = user?.id || user?.email || "unknown";
    if (!active?.accountId || active.accountId === accountId) {
      localStorage.removeItem(ACTIVE_ACCOUNT_SESSION_KEY);
    }
    clearSession();
    setUser(null);
    setUserRole(null);
    setCurrentSession(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updatedData) => {
    const result = await apiRequest("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(updatedData),
    });
    setUser(result.user);
    setUserRole(result.user.role || null);
    setCurrentSession(result.user);
    localStorage.setItem("currentUser", JSON.stringify(result.user));
    return result.user;
  };

  const updatePreferences = async (preferences) => {
    const result = await apiRequest("/users/preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences),
    });
    setUser(result.user);
    setCurrentSession(result.user);
    localStorage.setItem("currentUser", JSON.stringify(result.user));
    return result.user;
  };

  const updatePrivacy = async (privacy) => {
    const result = await apiRequest("/users/privacy", {
      method: "PATCH",
      body: JSON.stringify(privacy),
    });
    setUser(result.user);
    setCurrentSession(result.user);
    localStorage.setItem("currentUser", JSON.stringify(result.user));
    return result.user;
  };

  const updateNotifications = async (notifications) => {
    const result = await apiRequest("/users/notifications", {
      method: "PATCH",
      body: JSON.stringify(notifications),
    });
    setUser(result.user);
    setCurrentSession(result.user);
    localStorage.setItem("currentUser", JSON.stringify(result.user));
    return result.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return apiRequest("/users/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const deleteAccount = async () => {
    const result = await apiRequest("/users/me", { method: "DELETE" });
    logout();
    return result;
  };

  const getUserByEmail = () => null;
  const getAllUsers = () => [];
  const getUsersByRole = () => [];
  const getAllCustomers = () => [];
  const getAllTechnicians = () => [];
  const getAllAdmins = () => [];
  const hasRole = (role) => userRole === role;
  const isAdmin = () => userRole === "admin" || userRole === "superadmin";
  const isTechnician = () => userRole === "technician";
  const isCustomer = () => userRole === "customer";

  const value = {
    user,
    userRole,
    isAuthenticated,
    loading,
    currentSession,
    register,
    login,
    loginAsAdmin,
    loginAsTechnician,
    loginAsSuperAdmin,
    logout,
    updateProfile,
    updatePreferences,
    updatePrivacy,
    updateNotifications,
    changePassword,
    deleteAccount,
    getUserByEmail,
    getAllUsers,
    getUsersByRole,
    getAllCustomers,
    getAllTechnicians,
    getAllAdmins,
    hasRole,
    isAdmin,
    isTechnician,
    isCustomer,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;