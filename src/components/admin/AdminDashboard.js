import React, { useState } from 'react';
import { Settings, MessageSquare, Image, BarChart3, Users, LogOut } from 'lucide-react';
import MessageManager from './MessageManager';
import ImageManager from './ImageManager';
import './AdminStyles.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('messages');

  const tabs = [
    {
      id: 'messages',
      label: 'הודעות',
      icon: MessageSquare,
      component: MessageManager
    },
    {
      id: 'images',
      label: 'תמונות',
      icon: Image,
      component: ImageManager
    },
    {
      id: 'analytics',
      label: 'סטטיסטיקות',
      icon: BarChart3,
      component: () => <div className="admin-loading">סטטיסטיקות - בקרוב</div>
    },
    {
      id: 'users',
      label: 'משתמשים',
      icon: Users,
      component: () => <div className="admin-loading">ניהול משתמשים - בקרוב</div>
    },
    {
      id: 'settings',
      label: 'הגדרות',
      icon: Settings,
      component: () => <div className="admin-loading">הגדרות - בקרוב</div>
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h1>ממשק ניהול</h1>
          <p>ניהול תוכן המערכת</p>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>התנתק</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="main-header">
          <h2>{tabs.find(tab => tab.id === activeTab)?.label}</h2>
          <div className="header-actions">
            <span className="user-info">
              מנהל המערכת
            </span>
          </div>
        </div>

        <div className="main-content">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 