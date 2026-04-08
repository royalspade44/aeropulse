import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import LoginBrandSection from './LoginBrandSection';
import LoginForm from './LoginForm';
import RoleSelector from './RoleSelector';
import LockoutWarning from './LockOutWarning';
import GoogleButton from './GoogleButton';

function Login() {
  const { login, loginAsAdmin, loginAsTechnician, register, getUserByEmail } = useUser();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const timerRef = useRef(null);

  const roles = [
    { id: 'customer', label: 'Customer', icon: '👤', redirectTo: '/home' },
    { id: 'technician', label: 'Technician', icon: '🔧', redirectTo: '/tech/dashboard' },
    { id: 'admin', label: 'Admin', icon: '👨‍💼', redirectTo: '/admin/dashboard' }
  ];

  const getFailedAttempts = useCallback((email) => {
    const attempts = localStorage.getItem(`failed_attempts_${email}`);
    return attempts ? JSON.parse(attempts) : { count: 0, lockoutUntil: null };
  }, []);

  const saveFailedAttempts = useCallback((email, data) => {
    localStorage.setItem(`failed_attempts_${email}`, JSON.stringify(data));
  }, []);

  const canAttemptLogin = useCallback((email) => {
    const attempts = getFailedAttempts(email);
    if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
      const secondsLeft = Math.ceil((attempts.lockoutUntil - Date.now()) / 1000);
      return { canLogin: false, secondsLeft };
    }
    return { canLogin: true };
  }, [getFailedAttempts]);

  const handleLoginAttempt = useCallback(async (email, success) => {
    const attempts = getFailedAttempts(email);
    
    if (success) {
      saveFailedAttempts(email, { count: 0, lockoutUntil: null });
      return { success: true };
    } else {
      const newCount = (attempts.count || 0) + 1;
      let lockoutUntil = null;
      let lockoutDuration = 0;
      
      if (newCount >= 3) {
        lockoutDuration = 60000 + (newCount - 3) * 30000;
        lockoutUntil = Date.now() + lockoutDuration;
      }
      
      saveFailedAttempts(email, { count: newCount, lockoutUntil });
      
      if (lockoutUntil) {
        const lockoutSeconds = Math.ceil(lockoutDuration / 1000);
        return { locked: true, lockoutTime: lockoutSeconds, attempts: newCount };
      }
      
      return { locked: false, attempts: newCount };
    }
  }, [getFailedAttempts, saveFailedAttempts]);

  const clearLockout = useCallback((email) => {
    saveFailedAttempts(email, { count: 0, lockoutUntil: null });
    setLockoutInfo(null);
    if (timerRef.current) clearInterval(timerRef.current);
    alert('Lockout cleared. You can now attempt to login again.');
  }, [saveFailedAttempts]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (user.email) {
      const check = canAttemptLogin(user.email);
      if (!check.canLogin) {
        setLockoutInfo({
          message: `Account locked. Try again in ${check.secondsLeft} seconds.`,
          secondsLeft: check.secondsLeft
        });
        setSecondsLeft(check.secondsLeft);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setLockoutInfo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setLockoutInfo(null);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      setLockoutInfo(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [user.email, canAttemptLogin]);

  useEffect(() => {
    if (secondsLeft > 0) {
      setLockoutInfo(prev => prev ? ({
        ...prev,
        message: `Account locked. Try again in ${secondsLeft} seconds.`,
        secondsLeft: secondsLeft
      }) : prev);
    }
  }, [secondsLeft]);

  const handleRoleChange = (roleId) => {
    setUser(prev => ({ ...prev, role: roleId }));
  };

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

  const handleForgotPassword = () => {
    if (!user.email) {
      alert('Please enter your email address first.');
      return;
    }
    
    const existingUser = getUserByEmail(user.email);
    if (existingUser) {
      alert(`Password reset link sent to:\n${user.email}\n\nDemo reset token: reset_${Date.now()}`);
    } else {
      alert('No account found with this email address.');
    }
  };

  const authenticateUser = async () => {
    setErrors({});
    setLoading(true);

    // Check for empty fields
    for (const [k, v] of Object.entries(user)) {
      if (k !== 'role' && (!v || v.length < 1)) {
        setErrors(prev => ({ ...prev, [k]: 'This field is required' }));
        alert('All fields must be filled!');
        setLoading(false);
        return;
      }
    }

    // Check lockout
    const lockoutCheck = canAttemptLogin(user.email);
    if (!lockoutCheck.canLogin) {
      alert(`Too many failed attempts! Account locked for ${lockoutCheck.secondsLeft} seconds.`);
      setLockoutInfo({
        message: `Account locked. Try again in ${lockoutCheck.secondsLeft} seconds.`,
        secondsLeft: lockoutCheck.secondsLeft
      });
      setSecondsLeft(lockoutCheck.secondsLeft);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setLockoutInfo(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login for:', user.email, 'with role:', user.role);
      
      let loggedInUser;
      
      // Use different login methods based on selected role
      switch(user.role) {
        case 'admin':
          loggedInUser = await loginAsAdmin(user.email, user.password);
          break;
        case 'technician':
          loggedInUser = await loginAsTechnician(user.email, user.password);
          break;
        default:
          loggedInUser = await login(user.email, user.password);
      }
      
      console.log('Login successful:', loggedInUser);
      
      // Store user with role in session
      const userWithRole = { ...loggedInUser, selectedRole: user.role };
      localStorage.setItem('currentUser', JSON.stringify(userWithRole));
      
      await handleLoginAttempt(user.email, true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      setLoading(false);
      
      // Redirect based on role
      const selectedRoleConfig = roles.find(r => r.id === user.role);
      navigate(selectedRoleConfig.redirectTo);
      
    } catch (err) {
      console.error('Login error details:', err);
      
      // Handle failed login
      const result = await handleLoginAttempt(user.email, false);
      
      if (result.locked) {
        alert(`Too many failed attempts! Account locked for ${result.lockoutTime} seconds.`);
        setLockoutInfo({
          message: `Account locked. Try again in ${result.lockoutTime} seconds.`,
          secondsLeft: result.lockoutTime
        });
        setSecondsLeft(result.lockoutTime);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setLockoutInfo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors(prev => ({ ...prev, password: err.message || 'Invalid credentials' }));
        alert(`${err.message || 'Invalid email or password!'} Attempts: ${result.attempts}/3`);
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    setTimeout(async () => {
      const googleEmail = `google_${Date.now()}@example.com`;
      const googleUserData = {
        name_first: 'Google',
        name_last: 'User',
        email: googleEmail,
        phone: '',
        password: 'google_auth_' + Date.now(),
        isGoogleAccount: true,
        address: ''
      };
      
      const existingUser = getUserByEmail(googleEmail);
      
      if (existingUser) {
        try {
          let loggedInUser;
          switch(user.role) {
            case 'admin':
              loggedInUser = await loginAsAdmin(googleEmail, googleUserData.password);
              break;
            case 'technician':
              loggedInUser = await loginAsTechnician(googleEmail, googleUserData.password);
              break;
            default:
              loggedInUser = await login(googleEmail, googleUserData.password);
          }
          const userWithRole = { ...loggedInUser, role: user.role };
          localStorage.setItem('currentUser', JSON.stringify(userWithRole));
          const selectedRoleConfig = roles.find(r => r.id === user.role);
          navigate(selectedRoleConfig.redirectTo);
        } catch (err) {
          alert('Google login failed: ' + err.message);
        }
      } else {
        try {
          await register(googleUserData, user.role);
          const selectedRoleConfig = roles.find(r => r.id === user.role);
          navigate(selectedRoleConfig.redirectTo);
        } catch (err) {
          alert('Google registration failed: ' + err.message);
        }
      }
      setGoogleLoading(false);
    }, 1000);
  };

  const handleClearLockout = () => {
    if (user.email) {
      clearLockout(user.email);
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const selectedRole = roles.find(r => r.id === user.role) || roles[0];

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
            onClearLockout={handleClearLockout}
          />

          <RoleSelector
            selectedRole={selectedRole}
            roles={roles}
            onRoleChange={handleRoleChange}
            disabled={!!lockoutInfo}
          />

          <LoginForm
            email={user.email}
            password={user.password}
            errors={errors}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onSubmit={authenticateUser}
            loading={loading}
            disabled={!!lockoutInfo}
            onForgotPassword={handleForgotPassword}
          />

          <div className="divider">
            <span>or</span>
          </div>

          <GoogleButton
            onClick={handleGoogleSignIn}
            loading={googleLoading}
          />

          <div className="signup-link">
            Don't have an account? <button onClick={handleSignUp}>Sign up</button>
          </div>

          <div className="tips-card">
            <div className="tips-header">🔒 Security Information</div>
            <div className="tips-list">
              <span>• 3 login attempts before temporary lockout</span>
              <span>• Lockout duration increases with failed attempts</span>
              <span>• Demo Accounts Available:</span>
              <span>  - Customer: demo@example.com / demo123</span>
              <span>  - Technician: tech@example.com / tech123</span>
              <span>  - Admin: admin@example.com / admin123</span>
              <span>  - Super Admin: superadmin@example.com / super123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;