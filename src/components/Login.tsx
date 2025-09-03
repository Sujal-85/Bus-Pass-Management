import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import LoaderOverlay from './LoaderOverlay';

const styles: Record<string, React.CSSProperties> = {
  body: {
    background: 'linear-gradient(to bottom, #455a7eff, #bcc6d1ff)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Segoe UI, sans-serif',
  },
  container: {
    backgroundColor: '#0f1e36',
    padding: '48px 40px 36px 40px',
    width: 400,
    borderRadius: 16,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain' as const,
    filter: 'invert(1)', // makes black icon white
    marginRight: 10,
  },
  h2: {
    color: '#fff',
    fontSize: 28,
    letterSpacing: 1,
    fontWeight: 700,
    margin: 0,
    padding: 0,
    lineHeight: 1.2,
  },
  inputGroup: {
    position: 'relative' as const,
    marginBottom: 22,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 48px 14px 18px',
    background: '#1c2e4a',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
  },
  icon: {
    position: 'absolute' as const,
    right: 18,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#bbb',
    fontSize: 20,
    pointerEvents: 'none' as const,
  },
  forgotPassword: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  forgotLink: {
    textDecoration: 'none',
    color: '#ccc',
    fontSize: 14,
    transition: 'color 0.2s',
  },
  loginBtn: {
    width: '100%',
    background: '#5693f2',
    border: 'none',
    padding: '15px 0',
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.3s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(86,147,242,0.15)',
    outline: 'none',
    marginBottom: 10,
  },
  loginBtnHover: {
    background: '#437dde',
    boxShadow: '0 4px 16px rgba(67,125,222,0.18)',
  },
  messageBox: {
    marginTop: 18,
    textAlign: 'center' as const,
    fontSize: 15,
    minHeight: 32,
  },
  error: {
    color: 'red',
    fontWeight: 500,
    marginBottom: 2,
    display: 'block',
  },
  success: {
    color: '#00ff00',
    fontWeight: 500,
    marginBottom: 2,
    display: 'block',
  },
  hint: {
    display: 'block',
    fontSize: 13,
    color: '#b0b8c9',
    marginTop: 2,
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<React.ReactNode | null>(null);
  const [btnHover, setBtnHover] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === 'neha22mane01@gmail.com' && password === 'AITRC@12345') {
      setLoading(true);
      setMessage(<span style={styles.success}>Login successful! Redirecting...</span>);
      setTimeout(() => {
        login();
        navigate('/Dashboard');
      }, 1500);
    } else {
      setMessage(<><span style={styles.error}>Username and password do not match</span><span style={styles.hint}>Hint : 5C-Latters/Symbol/Numbers</span></>);
    }
  };

  return (
    <div style={styles.body}>
      <LoaderOverlay show={loading} message="Signing in…" fullscreen />
      <div style={styles.container}>
        <div style={styles.titleRow}>
          <img
            src="https://cdn-icons-png.flaticon.com/128/1992/1992901.png"
            alt="Admin Logo"
            style={styles.logo}
          />
          <h2 style={styles.h2}>AITRC ADMIN LOGIN</h2>
        </div>
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={styles.inputGroup}>
            <input
              type="text"
              id="username"
              placeholder="Username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
              autoComplete="username"
            />
            <i className="fas fa-user" style={styles.icon}></i>
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              id="password"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
            />
            <i className="fas fa-lock" style={styles.icon}></i>
          </div>
          <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.forgotLink}>Lost Password?</Link>
          </div>
          <button
            className="login-btn"
            type="submit"
            style={btnHover ? { ...styles.loginBtn, ...styles.loginBtnHover } : styles.loginBtn}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            Login
          </button>
          <div id="messageBox" style={styles.messageBox}>{message}</div>
        </form>
      </div>
      {/* FontAwesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}
   