import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    padding: '48px 40px',
    width: 400,
    borderRadius: 16,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  inputGroup: {
    position: 'relative' as const,
    marginBottom: 20,
  },
  input: {
    width: '90%',
    padding: '14px 18px',
    background: '#1c2e4a',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    outline: 'none',
  },
  button: {
    width: '100%',
    background: '#5693f2',
    border: 'none',
    padding: '14px 0',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 12,
  },
  message: {
    marginTop: 16,
    textAlign: 'center' as const,
    color: '#ccc',
    fontSize: 14,
  },
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(otp);
    console.log('Generated OTP:', otp); // For demo only
    setStep(2);
  };

  const verifyOtp = () => {
    if (enteredOtp === otp) {
      setStep(3);
    } else {
      setMessage('Invalid OTP. Try again.');
    }
  };

  const handlePasswordReset = () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    // Here, you would send email + new password to backend.
    setMessage('Password reset successful! Redirecting...');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.title}>Forgot Password</h2>

        {step === 1 && (
          <>
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button style={styles.button} onClick={generateOTP}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                style={styles.input}
              />
            </div>
            <button style={styles.button} onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            <button style={styles.button} onClick={handlePasswordReset}>
              Reset Password
            </button>
          </>
        )}

        <div style={styles.message}>{message}</div>
      </div>
    </div>
  );
};

export default ForgotPassword;
