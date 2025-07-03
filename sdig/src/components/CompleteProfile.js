import React, { useState } from 'react';
import { supabase } from '../config/supabase';

function CompleteProfile({ user, onComplete }) {
  const [formData, setFormData] = useState({
    street: '',
    management_company: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('buildings')
        .update({
          ...formData,
          setup_complete: true
        })
        .eq('id', user.id);

      if (error) throw error;

      onComplete();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h2>השלמת פרטי בניין</h2>
      <p>ברוך הבא! אנא השלם את פרטי הבניין שלך</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>רחוב ומספר בניין:</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>חברת ניהול:</label>
          <input
            type="text"
            name="management_company"
            value={formData.management_company}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>שם איש קשר:</label>
          <input
            type="text"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>טלפון איש קשר:</label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>אימייל איש קשר:</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: 10, backgroundColor: '#28a745', color: 'white', border: 'none' }}
        >
          {loading ? 'שומר...' : 'שמור והמשך'}
        </button>
      </form>
    </div>
  );
}

export default CompleteProfile; 