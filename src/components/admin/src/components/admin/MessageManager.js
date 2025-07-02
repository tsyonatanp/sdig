import React, { useState, useEffect } from 'react';
import { supabase, TABLES, MESSAGE_TYPES } from '../../config/supabase';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminStyles.css';

const MessageManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: MESSAGE_TYPES.NOTICE,
    icon: '📢',
    isActive: true,
    priority: 1,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('שגיאה בטעינת ההודעות');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMessage) {
        // Update existing message
        const { error } = await supabase
          .from(TABLES.MESSAGES)
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMessage.id);

        if (error) throw error;
        toast.success('ההודעה עודכנה בהצלחה');
      } else {
        // Create new message
        const { error } = await supabase
          .from(TABLES.MESSAGES)
          .insert([formData]);

        if (error) throw error;
        toast.success('ההודעה נוצרה בהצלחה');
      }

      resetForm();
      fetchMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('שגיאה בשמירת ההודעה');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הודעה זו?')) return;

    try {
      const { error } = await supabase
        .from(TABLES.MESSAGES)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('ההודעה נמחקה בהצלחה');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('שגיאה במחיקת ההודעה');
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      title: message.title,
      content: message.content,
      type: message.type,
      icon: message.icon,
      isActive: message.isActive,
      priority: message.priority,
      startDate: message.startDate || '',
      endDate: message.endDate || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: MESSAGE_TYPES.NOTICE,
      icon: '📢',
      isActive: true,
      priority: 1,
      startDate: '',
      endDate: ''
    });
    setEditingMessage(null);
    setShowForm(false);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from(TABLES.MESSAGES)
        .update({ isActive: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('סטטוס ההודעה עודכן');
      fetchMessages();
    } catch (error) {
      console.error('Error toggling message status:', error);
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      [MESSAGE_TYPES.NOTICE]: '#3b82f6',
      [MESSAGE_TYPES.ANNOUNCEMENT]: '#10b981',
      [MESSAGE_TYPES.EMERGENCY]: '#ef4444',
      [MESSAGE_TYPES.MAINTENANCE]: '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const labels = {
      [MESSAGE_TYPES.NOTICE]: 'הודעה',
      [MESSAGE_TYPES.ANNOUNCEMENT]: 'הכרזה',
      [MESSAGE_TYPES.EMERGENCY]: 'דחוף',
      [MESSAGE_TYPES.MAINTENANCE]: 'תחזוקה'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="admin-loading">טוען הודעות...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>ניהול הודעות</h2>
        <button 
          className="admin-btn primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          הודעה חדשה
        </button>
      </div>

      {showForm && (
        <div className="admin-form-overlay">
          <div className="admin-form">
            <div className="admin-form-header">
              <h3>{editingMessage ? 'עריכת הודעה' : 'הודעה חדשה'}</h3>
              <button onClick={resetForm} className="admin-btn-icon">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>כותרת</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>תוכן</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>סוג הודעה</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    {Object.entries(MESSAGE_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getTypeLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>אייקון</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="📢"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>עדיפות</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  >
                    <option value={1}>נמוכה</option>
                    <option value={2}>בינונית</option>
                    <option value={3}>גבוהה</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>סטטוס</label>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive">פעיל</label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>תאריך התחלה</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>תאריך סיום</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="admin-btn primary">
                  <Save size={16} />
                  {editingMessage ? 'עדכן' : 'צור'}
                </button>
                <button type="button" onClick={resetForm} className="admin-btn secondary">
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-grid">
        {messages.map((message) => (
          <div key={message.id} className="admin-card">
            <div className="card-header">
              <div className="card-title">
                <span className="card-icon">{message.icon}</span>
                <h4>{message.title}</h4>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => toggleActive(message.id, message.isActive)}
                  className="admin-btn-icon"
                  title={message.isActive ? 'הסתר' : 'הצג'}
                >
                  {message.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(message)}
                  className="admin-btn-icon"
                  title="ערוך"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="admin-btn-icon danger"
                  title="מחק"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="card-content">
              <p>{message.content}</p>
            </div>

            <div className="card-footer">
              <span 
                className="type-badge"
                style={{ backgroundColor: getTypeColor(message.type) }}
              >
                {getTypeLabel(message.type)}
              </span>
              <span className="priority-badge">
                עדיפות: {message.priority}
              </span>
              <span className={`status-badge ${message.isActive ? 'active' : 'inactive'}`}>
                {message.isActive ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="admin-empty">
          <p>אין הודעות להצגה</p>
          <button 
            className="admin-btn primary"
            onClick={() => setShowForm(true)}
          >
            צור הודעה ראשונה
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageManager; 