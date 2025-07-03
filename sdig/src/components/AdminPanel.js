import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './AdminPanel.css';

function AdminPanel() {
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [newMessage, setNewMessage] = useState({ title: '', body: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [buildingId, setBuildingId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('building_id');
    setBuildingId(id);
    if (id) {
      loadContent();
    }
  }, []);

  // עדכון בזמן אמת
  useEffect(() => {
    if (!buildingId) return;

    const messagesSubscription = supabase
      .channel('admin_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `building_id=eq.${buildingId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(msg => msg.id === payload.new.id ? payload.new : msg));
          }
        }
      )
      .subscribe();

    const imagesSubscription = supabase
      .channel('admin_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'images',
          filter: `building_id=eq.${buildingId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setImages(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setImages(prev => prev.filter(img => img.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setImages(prev => prev.map(img => img.id === payload.new.id ? payload.new : img));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(imagesSubscription);
    };
  }, [buildingId]);

  const loadContent = async () => {
    try {
      // טעינת הודעות
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      // טעינת תמונות
      const { data: imagesData } = await supabase
        .from('images')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      setMessages(messagesData || []);
      setImages(imagesData || []);
    } catch (error) {
      setError('שגיאה בטעינת התוכן: ' + error.message);
    }
  };

  const handleAddMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.title.trim() || !newMessage.body.trim()) {
      setError('נא למלא את כל השדות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            building_id: buildingId,
            title: newMessage.title,
            body: newMessage.body
          }
        ]);

      if (error) throw error;

      setNewMessage({ title: '', body: '' });
      setSuccess('הודעה נוספה בהצלחה!');
      loadContent();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('שגיאה בהוספת הודעה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הודעה זו?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setSuccess('הודעה נמחקה בהצלחה!');
      loadContent();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('שגיאה במחיקת הודעה: ' + error.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('נא לבחור קובץ תמונה תקין');
      setSelectedFile(null);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setError('נא לבחור קובץ תמונה');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // העלאה ל-Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${buildingId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('building-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // קבלת URL הציבור
      const { data: { publicUrl } } = supabase.storage
        .from('building-images')
        .getPublicUrl(fileName);

      // שמירה בטבלת images
      const { error: dbError } = await supabase
        .from('images')
        .insert([
          {
            building_id: buildingId,
            url: publicUrl,
            description: selectedFile.name
          }
        ]);

      if (dbError) throw dbError;

      setSelectedFile(null);
      setSuccess('תמונה הועלתה בהצלחה!');
      loadContent();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('שגיאה בהעלאת תמונה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId, imageUrl) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) return;

    try {
      // מחיקה מ-Storage
      const fileName = imageUrl.split('/').pop();
      await supabase.storage
        .from('building-images')
        .remove([`${buildingId}/${fileName}`]);

      // מחיקה מהטבלה
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setSuccess('תמונה נמחקה בהצלחה!');
      loadContent();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('שגיאה במחיקת תמונה: ' + error.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('זה ימחק את כל ההודעות והתמונות. האם אתה בטוח?')) return;

    setLoading(true);
    setError('');

    try {
      // מחיקת כל ההודעות
      await supabase
        .from('messages')
        .delete()
        .eq('building_id', buildingId);

      // מחיקת כל התמונות מ-Storage
      const { data: imagesToDelete } = await supabase
        .from('images')
        .select('url')
        .eq('building_id', buildingId);

      if (imagesToDelete && imagesToDelete.length > 0) {
        const fileNames = imagesToDelete.map(img => {
          const fileName = img.url.split('/').pop();
          return `${buildingId}/${fileName}`;
        });

        await supabase.storage
          .from('building-images')
          .remove(fileNames);
      }

      // מחיקת כל התמונות מהטבלה
      await supabase
        .from('images')
        .delete()
        .eq('building_id', buildingId);

      setSuccess('המערכת אופסה בהצלחה!');
      loadContent();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('שגיאה באיפוס המערכת: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!buildingId) {
    return <div className="admin-panel">טוען...</div>;
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>🔧 פאנל ניהול מערכת</h1>
        <button 
          onClick={() => window.location.href = '/'}
          className="back-btn"
        >
          ← חזרה ללוח הדיגיטלי
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-content">
        {/* ניהול הודעות */}
        <section className="messages-section">
          <h2>📝 ניהול הודעות</h2>
          
          <form onSubmit={handleAddMessage} className="message-form">
            <div className="form-group">
              <label>כותרת:</label>
              <input
                type="text"
                value={newMessage.title}
                onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                placeholder="כותרת ההודעה"
                required
              />
            </div>
            <div className="form-group">
              <label>תוכן:</label>
              <textarea
                value={newMessage.body}
                onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
                placeholder="תוכן ההודעה"
                rows="4"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'מוסיף...' : 'הוסף הודעה'}
            </button>
          </form>

          <div className="messages-list">
            <h3>הודעות קיימות:</h3>
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="message-item">
                  <div className="message-content">
                    <h4>{message.title}</h4>
                    <p>{message.body}</p>
                    <small>{new Date(message.created_at).toLocaleString('he-IL')}</small>
                  </div>
                  <button 
                    onClick={() => handleDeleteMessage(message.id)}
                    className="delete-btn"
                  >
                    🗑️ מחק
                  </button>
                </div>
              ))
            ) : (
              <p className="no-content">אין הודעות להצגה</p>
            )}
          </div>
        </section>

        {/* ניהול תמונות */}
        <section className="images-section">
          <h2>🖼️ ניהול תמונות</h2>
          
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFile && (
              <div className="selected-file">
                <p>נבחר: {selectedFile.name}</p>
                <button 
                  onClick={handleUploadImage}
                  disabled={loading}
                  className="upload-btn"
                >
                  {loading ? 'מעלה...' : 'העלה תמונה'}
                </button>
              </div>
            )}
          </div>

          <div className="images-grid">
            <h3>תמונות קיימות:</h3>
            {images.length > 0 ? (
              <div className="images-list">
                {images.map((image) => (
                  <div key={image.id} className="image-item">
                    <img src={image.url} alt={image.description} />
                    <div className="image-actions">
                      <span className="image-name">{image.description}</span>
                      <button 
                        onClick={() => handleDeleteImage(image.id, image.url)}
                        className="delete-btn"
                      >
                        🗑️ מחק
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-content">אין תמונות להצגה</p>
            )}
          </div>
        </section>

        {/* איפוס מערכת */}
        <section className="reset-section">
          <h2>⚠️ איפוס מערכת</h2>
          <p>פעולה זו תמחק את כל ההודעות והתמונות ותאפס את המערכת למצב התחלתי.</p>
          <button 
            onClick={handleReset}
            disabled={loading}
            className="reset-btn"
          >
            {loading ? 'מאפס...' : 'אפס מערכת'}
          </button>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel; 