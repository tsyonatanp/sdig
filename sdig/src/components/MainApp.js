import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { getHebrewDate, getHebrewTime } from '../utils/hebrewDate';
import './MainApp.css';

function MainApp({ profile, messages: initialMessages, images: initialImages }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messages, setMessages] = useState(initialMessages || []);
  const [images, setImages] = useState(initialImages || []);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audio] = useState(new Audio('/ניגוני הינוקא.mp3'));

  // עדכון זמן כל שנייה
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // קרוסלת תמונות
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [images.length]);

  // טעינת מזג אוויר (דוגמה - צריך API key)
  useEffect(() => {
    // כאן יהיה קוד לטעינת מזג אוויר
    setWeather({
      temp: 22,
      condition: 'שמשי',
      humidity: 45
    });
  }, []);

  // טעינת זמני שבת (דוגמה - צריך API)
  useEffect(() => {
    // כאן יהיה קוד לטעינת זמני שבת
    setShabbatTimes({
      candleLighting: '18:30',
      havdalah: '19:30'
    });
  }, []);

  // עדכון בזמן אמת - הודעות
  useEffect(() => {
    if (!profile?.id) return;

    const messagesSubscription = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `building_id=eq.${profile.id}`
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

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [profile?.id]);

  // עדכון בזמן אמת - תמונות
  useEffect(() => {
    if (!profile?.id) return;

    const imagesSubscription = supabase
      .channel('images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'images',
          filter: `building_id=eq.${profile.id}`
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
      supabase.removeChannel(imagesSubscription);
    };
  }, [profile?.id]);

  // ניהול מוזיקה
  const toggleMusic = () => {
    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.play();
      setIsMusicPlaying(true);
    }
  };

  // הגדרת אירועי מוזיקה
  useEffect(() => {
    audio.addEventListener('ended', () => setIsMusicPlaying(false));
    audio.addEventListener('error', () => setIsMusicPlaying(false));
    
    return () => {
      audio.removeEventListener('ended', () => setIsMusicPlaying(false));
      audio.removeEventListener('error', () => setIsMusicPlaying(false));
    };
  }, [audio]);

  return (
    <div className="main-app">
      {/* Header עם זמן ופרטי בניין */}
      <header className="app-header">
        <div className="building-info">
          <h1>{profile?.street}</h1>
          <p>{profile?.management_company}</p>
        </div>
        <div className="time-display">
          <div className="current-time">
            {getHebrewTime(currentTime)}
          </div>
          <div className="current-date">
            {getHebrewDate(currentTime)}
          </div>
        </div>
      </header>

      <div className="content-grid">
        {/* קרוסלת תמונות */}
        <div className="image-carousel">
          {images.length > 0 ? (
            <div className="carousel-container">
              <img 
                src={images[currentImageIndex]?.url} 
                alt={images[currentImageIndex]?.description || 'תמונה'}
                className="carousel-image"
              />
              {images.length > 1 && (
                <div className="carousel-indicators">
                  {images.map((_, index) => (
                    <span 
                      key={index} 
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="no-images">
              <p>אין תמונות להצגה</p>
            </div>
          )}
        </div>

        {/* הודעות */}
        <div className="messages-section">
          <h2>הודעות ועד הבית</h2>
          <div className="messages-list">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="message-card">
                  <h3>{message.title}</h3>
                  <p>{message.body}</p>
                  <small>{new Date(message.created_at).toLocaleDateString('he-IL')}</small>
                </div>
              ))
            ) : (
              <p className="no-messages">אין הודעות להצגה</p>
            )}
          </div>
        </div>

        {/* מזג אוויר */}
        <div className="weather-section">
          <h2>מזג אוויר</h2>
          {weather ? (
            <div className="weather-card">
              <div className="weather-temp">{weather.temp}°C</div>
              <div className="weather-condition">{weather.condition}</div>
              <div className="weather-humidity">לחות: {weather.humidity}%</div>
            </div>
          ) : (
            <p>טוען מזג אוויר...</p>
          )}
        </div>

        {/* זמני שבת */}
        <div className="shabbat-section">
          <h2>זמני שבת</h2>
          {shabbatTimes ? (
            <div className="shabbat-card">
              <div className="shabbat-time">
                <span>הדלקת נרות:</span>
                <span>{shabbatTimes.candleLighting}</span>
              </div>
              <div className="shabbat-time">
                <span>הבדלה:</span>
                <span>{shabbatTimes.havdalah}</span>
              </div>
            </div>
          ) : (
            <p>טוען זמני שבת...</p>
          )}
        </div>

        {/* שירותים מהירים */}
        <div className="quick-services">
          <h2>שירותים מהירים</h2>
          <div className="services-grid">
            <div className="service-item" onClick={() => window.open(`tel:${profile?.contact_phone || '100'}`)}>
              <span>📞</span>
              <span>חירום</span>
            </div>
            <div className="service-item" onClick={() => window.open(`mailto:${profile?.contact_email || 'info@example.com'}`)}>
              <span>📧</span>
              <span>צור קשר</span>
            </div>
            <div className="service-item">
              <span>🔧</span>
              <span>תחזוקה</span>
            </div>
            <div className="service-item">
              <span>📋</span>
              <span>תקנון</span>
            </div>
          </div>
          {profile?.contact_name && (
            <div className="contact-info">
              <p><strong>איש קשר:</strong> {profile.contact_name}</p>
              <p><strong>טלפון:</strong> {profile.contact_phone}</p>
              <p><strong>אימייל:</strong> {profile.contact_email}</p>
            </div>
          )}
        </div>
      </div>

      {/* כפתורי בקרה */}
      <div className="control-buttons">
        <button 
          onClick={toggleMusic}
          className={`music-btn ${isMusicPlaying ? 'playing' : ''}`}
        >
          {isMusicPlaying ? '🔇 עצור מוזיקה' : '🎵 הפעל מוזיקה'}
        </button>
        <button 
          onClick={() => window.location.href = '/admin'}
          className="admin-btn"
        >
          🔧 ניהול מערכת
        </button>
      </div>
    </div>
  );
}

export default MainApp; 