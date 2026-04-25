import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { BRANCHES } from '../../domain/branches/branches';
import './Login.css';
import icons from '../common/icons';
import LoginBrandSection from './LoginBrandSection';
import LoginForm from './LoginForm';
import LockoutWarning from './LockOutWarning';
import GoogleButton from './GoogleButton';

const getRoleHomePath = (role) => {
  if (role === 'technician') return '/tech/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'superadmin') return '/superadmin/dashboard';
  return '/home';
};

function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState({
    email: '',
    password: '',
    branch: '',
  });
  const [errors, setErrors] = useState({});
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft > 0) {
      setLockoutInfo(prev => prev ? ({
        ...prev,
        message: `Account locked. Try again in ${secondsLeft} seconds.`,
        secondsLeft: secondsLeft
      }) : prev);
    }
  }, [secondsLeft]);

  const handleEmailChange = (email) => {
    setUser(prev => ({ ...prev, email }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (password) => {
    setUser(prev => ({ ...prev, password }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleBranchChange = (branch) => {
    setUser((prev) => ({ ...prev, branch }));
    if (errors.branch) {
      setErrors((prev) => ({ ...prev, branch: '' }));
    }
  };

  const handleForgotPassword = () => {
    if (!user.email) {
      alert('Please enter your email address first.');
      return;
    }

    alert(`If an account exists for ${user.email}, a password reset link will be sent.`);
  };

  const authenticateUser = async () => {
    setErrors({});
    setLoading(true);

    // Check for empty fields
    for (const [k, v] of Object.entries(user)) {
      if (k !== 'branch' && (!v || v.length < 1)) {
        setErrors(prev => ({ ...prev, [k]: 'This field is required' }));
        alert('All fields must be filled!');
        setLoading(false);
        return;
      }
    }

    try {
      const loggedInUser = await login(user.email, user.password, user.branch);
      const activeBranch = loggedInUser?.activeBranch || loggedInUser?.assignedBranch || user.branch || '';

      if (activeBranch) {
        localStorage.setItem('activeBranch', activeBranch);
      }
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      setLoading(false);
      
      navigate(getRoleHomePath(loggedInUser?.role));
      
    } catch (err) {
      console.error('Login error details:', err);

      if (err?.status === 423) {
        const lockSeconds = err?.data?.secondsLeft || 60;
        setLockoutInfo({
          message: err.message || `Account locked. Try again in ${lockSeconds} seconds.`,
          secondsLeft: lockSeconds,
        });
        setSecondsLeft(lockSeconds);
        if (timerRef.current) clearInterval(timerRef.current);
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
        setErrors((prev) => ({ ...prev, password: err.message || 'Invalid credentials' }));
        alert(err.message || 'Invalid email or password!');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    window.location.href = `${API_BASE_URL}/auth/google/start`;
  };

  const handleSignUp = () => {
    const fromCheckout = location.state?.from?.pathname === '/checkout';
    navigate('/register', { state: { returnToCheckout: fromCheckout } });
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        <LoginBrandSection />
        
        <div className="login-form-section">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <LockoutWarning
            lockoutInfo={lockoutInfo}
            secondsLeft={secondsLeft}
          />

          <LoginForm
            email={user.email}
            password={user.password}
            branch={user.branch}
            errors={errors}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onBranchChange={handleBranchChange}
            branchOptions={BRANCHES}
            onSubmit={authenticateUser}
            loading={loading}
            disabled={!!lockoutInfo}
            onForgotPassword={handleForgotPassword}
            showAccountRecovery={true}
          />

          <div className="divider">
            <span>or</span>
          </div>

          <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

          <div className="signup-link">
            Don't have an account? <button onClick={handleSignUp}>Sign up</button>
          </div>

          <div className="tips-card">
            <div className="tips-header">
              <img src={icons.lock} alt="" className="inline-icon inline-icon--md" />
              Security Information
            </div>
            <div className="tips-list">
              <span>• 3 login attempts before temporary lockout</span>
              <span>• Lockout duration increases with failed attempts</span>
              <span>• Branch-scoped accounts reuse the branch you enter here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;