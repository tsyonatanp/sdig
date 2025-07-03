import React, { useState } from 'react';
import { supabase } from '../config/supabase';

function Registration({ onRegistered }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // יצירת רשומה בטבלת buildings
        const { error: buildingError } = await supabase
          .from('buildings')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              setup_complete: false
            }
          ]);

        if (buildingError) throw buildingError;

        localStorage.setItem('building_id', data.user.id);
        onRegistered(data.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <h2>הרשמה למערכת לוח דיגיטלי</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>אימייל:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>סיסמה:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: 10, backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          {loading ? 'מרשם...' : 'הרשמה'}
        </button>
      </form>
    </div>
  );
}

export default Registration; 