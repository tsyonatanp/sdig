import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import CompleteProfile from './components/CompleteProfile';
import MainApp from './components/MainApp';
import AdminPanel from './components/AdminPanel';
import { supabase } from './config/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const buildingId = localStorage.getItem('building_id');
    if (!buildingId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase.from('buildings').select('*').eq('id', buildingId).single();
      if (data && data.setup_complete) {
        setProfile(data);
        setUser({ id: buildingId, email: data.email });
        loadContent(data.id);
      } else if (data) {
        setUser({ id: buildingId, email: data.email });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (buildingId) => {
    try {
      const [messagesResponse, imagesResponse] = await Promise.all([
        supabase.from('messages').select('*').eq('building_id', buildingId),
        supabase.from('images').select('*').eq('building_id', buildingId)
      ]);
      
      setMessages(messagesResponse.data || []);
      setImages(imagesResponse.data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleRegistered = (userData) => {
    setUser(userData);
  };

  const handleProfileComplete = async () => {
    await checkAuth();
  };

  // עדכון בזמן אמת
  useEffect(() => {
    if (!profile?.id) return;

    const messagesSubscription = supabase
      .channel('app_messages_changes')
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

    const imagesSubscription = supabase
      .channel('app_images_changes')
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
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(imagesSubscription);
    };
  }, [profile?.id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>טוען...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? (
              <Registration onRegistered={handleRegistered} />
            ) : !profile ? (
              <CompleteProfile user={user} onComplete={handleProfileComplete} />
            ) : (
              <MainApp profile={profile} messages={messages} images={images} />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            user ? <AdminPanel /> : <Navigate to="/" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 