import { ArrowLeft, Info, ShieldCheck } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import BoutiqueAuthHeader from "../common/boutique/BoutiqueAuthHeader";
import BoutiqueAuthLayout from "../common/boutique/BoutiqueAuthLayout";
import { BQ_COLORS, BQ_SHADOWS } from "../common/boutique/BoutiqueTheme";
import LockoutWarning from "./LockOutWarning";
import LoginForm from "./LoginForm";

const getRoleHomePath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "superadmin") return "/superadmin/dashboard";
  return "/home";
};

function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authMessage, setAuthMessage] = useState("");
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft > 0) {
      setLockoutInfo((prev) =>
        prev
          ? {
              ...prev,
              message: `Account locked. Try again in ${secondsLeft}s.`,
              secondsLeft,
            }
          : prev,
      );
    }
  }, [secondsLeft]);

  useEffect(() => {
    setAuthMessage("");
  }, [location.search]);

  const handleEmailChange = (email) => {
    setUser((prev) => ({ ...prev, email }));
    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (password) => {
    setUser((prev) => ({ ...prev, password }));
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  };

  const authenticateUser = async () => {
    setErrors({});
    if (!user.email || !user.password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(user.email, user.password);
      const activeBranch =
        loggedInUser?.activeBranch || loggedInUser?.assignedBranch || "";
      if (activeBranch) localStorage.setItem("activeBranch", activeBranch);

      setLoading(false);
      navigate(getRoleHomePath(loggedInUser?.role));
    } catch (err) {
      if (err?.status === 423) {
        const lockSeconds = err?.data?.secondsLeft || 60;
        setLockoutInfo({ message: err.message, secondsLeft: lockSeconds });
        setSecondsLeft(lockSeconds);
        timerRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setLockoutInfo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors((prev) => ({ ...prev, password: err.message }));
      }
      setLoading(false);
    }
  };

  return (
    <BoutiqueAuthLayout>
      {/* Floating Back Button */}
      <button
        className="bq-login-back-btn"
        onClick={() => navigate("/home")}
        title="Back to Home"
      >
        <ArrowLeft size={20} weight="bold" />
      </button>

      <BoutiqueAuthHeader
        title="Welcome Back"
        subtitle="Sign in to your boutique account"
      />

      <div className="bq-login-form-inner">
        <LockoutWarning lockoutInfo={lockoutInfo} secondsLeft={secondsLeft} />

        {authMessage && (
          <div className="bq-auth-banner">
            <Info size={18} weight="bold" />
            <span>{authMessage}</span>
          </div>
        )}

        <LoginForm
          email={user.email}
          password={user.password}
          errors={errors}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={authenticateUser}
          loading={loading}
          disabled={!!lockoutInfo}
          onForgotPassword={() => navigate("/forgot-password")}
        />

        <div className="bq-login-footer-actions">
          <p className="bq-signup-prompt">
            New to AeroPulse?{" "}
            <button onClick={() => navigate("/register")}>
              Create Account
            </button>
          </p>
        </div>

        <div className="bq-security-tips">
          <div className="bq-tips-header">
            <ShieldCheck size={20} weight="fill" />
            <span>Boutique Security</span>
          </div>
          <ul className="bq-tips-list">
            <li>Automatic lockout after 3 failed attempts</li>
            <li>Encrypted session management</li>
            <li>Assigned branch auto-routing enabled</li>
          </ul>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-login-form-inner { display: flex; flex-direction: column; gap: 24px; }

        .bq-login-back-btn {
          position: absolute; top: 40px; left: 40px;
          background: white; border: none;
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s ease;
          color: ${BQ_COLORS.ink}; box-shadow: ${BQ_SHADOWS.soft};
          z-index: 100;
        }
        .bq-login-back-btn:hover { transform: translateX(-4px); box-shadow: ${BQ_SHADOWS.float}; }

        .bq-auth-banner { padding: 16px 20px; background: ${BQ_COLORS.bgAlt}; color: ${BQ_COLORS.ink}; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }

        .bq-login-footer-actions { margin-top: 8px; text-align: center; }
        .bq-signup-prompt { font-size: 15px; color: ${BQ_COLORS.inkMuted}; font-weight: 500; }
        .bq-signup-prompt button { background: none; border: none; color: ${BQ_COLORS.brand}; font-weight: 800; cursor: pointer; text-decoration: underline; padding: 0 4px; }

        .bq-security-tips {
          margin-top: 24px; padding: 24px; background: ${BQ_COLORS.bgAlt};
          border-radius: 20px; border: 1.5px dashed ${BQ_COLORS.border};
        }
        .bq-tips-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: ${BQ_COLORS.ink}; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; }
        .bq-tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .bq-tips-list li { font-size: 13px; color: ${BQ_COLORS.inkMuted}; font-weight: 600; position: relative; padding-left: 18px; }
        .bq-tips-list li::before { content: "•"; position: absolute; left: 0; color: ${BQ_COLORS.accent}; font-weight: 900; }

        @media (max-width: 1024px) {
          .bq-login-back-btn { top: 20px; left: 20px; width: 40px; height: 40px; }
        }
      `,
        }}
      />
    </BoutiqueAuthLayout>
  );
}

export default Login;
