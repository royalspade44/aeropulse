import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import LoginBrandSection from './LoginBrandSection';
import LoginForm from './LoginForm';
import LockoutWarning from './LockOutWarning';
import GoogleButton from './GoogleButton';

function Login() {
  const { login, loginAsAdmin, loginAsTechnician, register } = useUser();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    email: '',
    password: '',
    role: null,
  });
  const [errors, setErrors] = useState({});
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState('role'); // role | login
  const [adminKindStep, setAdminKindStep] = useState(false);
  
  const timerRef = useRef(null);

  const roles = [
    { id: 'customer', label: 'Customer', icon: '👤', redirectTo: '/home' },
    { id: 'technician', label: 'Technician', icon: '🔧', redirectTo: '/tech/dashboard' },
    { id: 'admin', label: 'Admin', icon: '👨‍💼', redirectTo: '/admin/dashboard' },
    { id: 'superadmin', label: 'Super Admin', icon: '🛡️', redirectTo: '/superadmin/dashboard' },
  ];

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

  const selectRole = (roleId) => {
    setUser((prev) => ({ ...prev, role: roleId }));
    setStep('login');
    setAdminKindStep(false);
    setLockoutInfo(null);
    setSecondsLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
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

    alert(`If an account exists for ${user.email}, a password reset link will be sent.`);
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
        case 'superadmin':
          loggedInUser = await login(user.email, user.password, 'superadmin');
          break;
        default:
          loggedInUser = await login(user.email, user.password);
      }
      
      console.log('Login successful:', loggedInUser);
      
      // Store user with role in session
      const userWithRole = { ...loggedInUser, selectedRole: user.role };
      localStorage.setItem('currentUser', JSON.stringify(userWithRole));
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      setLoading(false);
      
      // Redirect based on role
      const selectedRoleConfig = roles.find(r => r.id === user.role);
      navigate(selectedRoleConfig.redirectTo);
      
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
      
      try {
        await register(googleUserData, user.role);
      } catch (_registerError) {
        // If account already exists, continue with login path.
      }

      try {
        let loggedInUser;
        switch(user.role) {
          case 'admin':
            loggedInUser = await loginAsAdmin(googleEmail, googleUserData.password);
            break;
          case 'technician':
            loggedInUser = await loginAsTechnician(googleEmail, googleUserData.password);
            break;
          case 'superadmin':
            loggedInUser = await login(googleEmail, googleUserData.password, 'superadmin');
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
      setGoogleLoading(false);
    }, 1000);
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const selectedRole = useMemo(() => roles.find((r) => r.id === user.role) || null, [roles, user.role]);

  return (
    <div className="login-container">
      <div className="login-grid">
        <LoginBrandSection />
        
        <div className="login-form-section">
          <div className="form-header">
            <h2>{step === 'role' ? 'Choose your portal' : 'Welcome Back'}</h2>
            <p>{step === 'role' ? 'Select how you want to sign in' : 'Sign in to your account to continue'}</p>
          </div>

          <LockoutWarning
            lockoutInfo={lockoutInfo}
            secondsLeft={secondsLeft}
          />

          {step === 'role' ? (
            <div className="role-cards">
              {!adminKindStep ? (
                <>
                  <button type="button" className="role-card" onClick={() => selectRole('customer')}>
                    <span className="role-card-icon">👤</span>
                    <span className="role-card-title">Customer</span>
                  </button>
                  <button type="button" className="role-card" onClick={() => selectRole('technician')}>
                    <span className="role-card-icon">🔧</span>
                    <span className="role-card-title">Technician</span>
                  </button>
                  <button type="button" className="role-card" onClick={() => setAdminKindStep(true)}>
                    <span className="role-card-icon">🛡️</span>
                    <span className="role-card-title">Admin</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="role-card" onClick={() => selectRole('admin')}>
                    <span className="role-card-icon">👨‍💼</span>
                    <span className="role-card-title">Admin</span>
                  </button>
                  <button type="button" className="role-card" onClick={() => selectRole('superadmin')}>
                    <span className="role-card-icon">🛡️</span>
                    <span className="role-card-title">Super Admin</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setAdminKindStep(false)}>
                    Back
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16, color: '#64748b', fontWeight: 600 }}>
                Signing in as: <span style={{ color: '#1e293b' }}>{selectedRole?.label || 'User'}</span>{' '}
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {
                    setStep('role');
                    setUser((prev) => ({ ...prev, role: null }));
                  }}
                  style={{ marginLeft: 10 }}
                >
                  change
                </button>
              </div>

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

              <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

              <div className="signup-link">
                Don't have an account? <button onClick={handleSignUp}>Sign up</button>
              </div>

              <div className="tips-card">
                <div className="tips-header">🔒 Security Information</div>
                <div className="tips-list">
                  <span>• 3 login attempts before temporary lockout</span>
                  <span>• Lockout duration increases with failed attempts</span>
                  <span>• Only Admins can manually unlock accounts early</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;