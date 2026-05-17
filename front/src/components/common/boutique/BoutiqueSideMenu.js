import {
  Gear,
  Phone,
  ShoppingBag,
  SignOut,
  User,
  UserCircle,
  Wind,
  Wrench,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BoutiqueDrawer from "./BoutiqueDrawer";
import { BQ_COLORS, BQ_FONTS, BQ_SHADOWS } from "./BoutiqueTheme";

export default function BoutiqueSideMenu({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarBroken, setAvatarBroken] = useState(false);

  const menuItems = [
    { id: "profile", label: "Profile", icon: UserCircle, path: "/profile" },
    { id: "myunit", label: "My Unit", icon: Wind, path: "/myunit" },
    { id: "services", label: "Services", icon: Wrench, path: "/services" },
    { id: "shop", label: "Shop", icon: ShoppingBag, path: "/shop" },
    { id: "settings", label: "Settings", icon: Gear, path: "/settings" },
    { id: "contact", label: "Contact", icon: Phone, path: "/contact" },
  ];

  const handleNavigation = (path) => {
    if (!isAuthenticated && path !== "/shop" && path !== "/contact") {
      navigate("/login");
    } else {
      navigate(path);
    }
    onClose();
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest User";
    return (
      user.name || user.name_first || user.email?.split("@")[0] || "Customer"
    );
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <BoutiqueDrawer isOpen={isOpen} onClose={onClose} side="left" width="360px">
      <div className="bq-menu-wrapper">
        <div className="bq-user-block">
          <div className="bq-avatar">
            {user?.avatarUrl && !avatarBroken ? (
              <img
                src={user.avatarUrl}
                alt="Me"
                onError={() => setAvatarBroken(true)}
              />
            ) : isAuthenticated ? (
              <span className="bq-initial">{getUserInitial()}</span>
            ) : (
              <User size={32} weight="bold" />
            )}
          </div>
          <div className="bq-user-info">
            <span className="bq-greeting">
              {isAuthenticated ? "Welcome back," : "Hello,"}
            </span>
            <h3 className="bq-username">{getUserDisplayName()}</h3>
          </div>
        </div>

        <nav className="bq-menu-nav">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.id}
                className={`bq-nav-item ${active ? "active" : ""}`}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon size={24} weight={active ? "fill" : "bold"} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="bq-menu-divider" />

          {isAuthenticated ? (
            <button
              className="bq-nav-item bq-logout-btn"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              <SignOut size={24} weight="bold" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              className="bq-nav-item bq-login-btn"
              onClick={() => {
                navigate("/login");
                onClose();
              }}
            >
              <SignOut size={24} weight="bold" />
              <span>Sign In</span>
            </button>
          )}
        </nav>

        <div className="bq-menu-footer">
          <span className="bq-version">AeroPulse v1.0.0</span>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-menu-wrapper { display: flex; flex-direction: column; height: 100%; }

        .bq-user-block { padding: 40px 32px; display: flex; flex-direction: column; gap: 16px; }
        .bq-avatar {
          width: 64px; height: 64px; background: ${BQ_COLORS.bgAlt};
          border-radius: 20px; display: flex; align-items: center; justify-content: center;
          overflow: hidden; color: ${BQ_COLORS.brand}; box-shadow: ${BQ_SHADOWS.soft};
        }
        .bq-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .bq-initial { font-family: ${BQ_FONTS.heading}; font-size: 24px; font-weight: 900; }

        .bq-user-info { display: flex; flex-direction: column; }
        .bq-greeting { font-size: 13px; font-weight: 600; color: ${BQ_COLORS.inkMuted}; }
        .bq-username { font-family: ${BQ_FONTS.heading}; font-size: 20px; font-weight: 800; color: ${BQ_COLORS.ink}; margin: 0; }

        .bq-menu-nav { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }

        .bq-nav-item {
          display: flex; align-items: center; gap: 16px; padding: 16px;
          background: transparent; border: none; border-radius: 20px;
          cursor: pointer; font-size: 16px; font-weight: 600; color: ${BQ_COLORS.inkMuted};
          transition: all 0.3s; width: 100%; text-align: left;
        }
        .bq-nav-item:hover { background: ${BQ_COLORS.bgAlt}; color: ${BQ_COLORS.ink}; }
        .bq-nav-item.active { background: ${BQ_COLORS.brand}; color: white; box-shadow: ${BQ_SHADOWS.float}; }

        .bq-menu-divider { height: 1px; background: ${BQ_COLORS.border}; margin: 16px; }

        .bq-logout-btn { color: ${BQ_COLORS.danger}; }
        .bq-logout-btn:hover { background: #fef2f2; color: ${BQ_COLORS.danger}; }

        .bq-menu-footer { padding: 32px; border-top: 1px solid ${BQ_COLORS.border}; }
        .bq-version { font-size: 12px; font-weight: 700; color: ${BQ_COLORS.inkFaint}; text-transform: uppercase; letter-spacing: 0.05em; }
      `,
        }}
      />
    </BoutiqueDrawer>
  );
}
