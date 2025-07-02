import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthProvider';

export default function Auth() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' או 'signup'

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    setError(error?.message || '');
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setError(error?.message || '');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div>
        <div>שלום, {user.email}</div>
        <button onClick={handleSignOut}>התנתק</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{mode === 'signin' ? 'התחברות' : 'הרשמה'}</h2>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="אימייל"
        type="email"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="סיסמה"
      />
      {mode === 'signin' ? (
        <>
          <button onClick={handleSignIn}>התחבר</button>
          <div>
            אין לך חשבון?{' '}
            <button type="button" onClick={() => setMode('signup')}>להרשמה</button>
          </div>
        </>
      ) : (
        <>
          <button onClick={handleSignUp}>הרשם</button>
          <div>
            כבר יש לך חשבון?{' '}
            <button type="button" onClick={() => setMode('signin')}>להתחברות</button>
          </div>
        </>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
} 