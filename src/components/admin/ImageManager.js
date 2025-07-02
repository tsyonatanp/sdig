import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase, TABLES, IMAGE_CATEGORIES } from '../../config/supabase';
import { Plus, Edit, Trash2, Eye, Upload, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminStyles.css';

const ImageManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: IMAGE_CATEGORIES.CAROUSEL,
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLES.IMAGES)
        .select('*')
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('שגיאה בטעינת התמונות');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const filePath = `images/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
        const { error } = await supabase
          .from(TABLES.IMAGES)
          .insert([{
            title: file.name.replace(/\.[^/.]+$/, ''),
            description: '',
            category: IMAGE_CATEGORIES.CAROUSEL,
            isActive: true,
            order: images.length,
            url: publicUrlData.publicUrl,
            size: file.size,
            format: file.type
          }]);
        if (error) throw error;
        return publicUrlData.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`שגיאה בהעלאת ${file.name}`);
        return null;
      }
    });
    try {
      await Promise.all(uploadPromises);
      toast.success('התמונות הועלו בהצלחה');
      fetchImages();
    } catch (error) {
      console.error('Error in batch upload:', error);
    } finally {
      setUploading(false);
    }
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingImage) {
        const { error } = await supabase
          .from(TABLES.IMAGES)
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingImage.id);
        if (error) throw error;
        toast.success('התמונה עודכנה בהצלחה');
      }
      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('שגיאה בשמירת התמונה');
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) return;
    try {
      if (image.url) {
        const filePath = image.url.split('/storage/v1/object/public/images/')[1];
        if (filePath) {
          await supabase.storage.from('images').remove([filePath]);
        }
      }
      const { error } = await supabase
        .from(TABLES.IMAGES)
        .delete()
        .eq('id', image.id);
      if (error) throw error;
      toast.success('התמונה נמחקה בהצלחה');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('שגיאה במחיקת התמונה');
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      category: image.category || IMAGE_CATEGORIES.CAROUSEL,
      isActive: image.isActive,
      order: image.order || 0
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: IMAGE_CATEGORIES.CAROUSEL,
      isActive: true,
      order: 0
    });
    setEditingImage(null);
    setShowForm(false);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from(TABLES.IMAGES)
        .update({ isActive: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success('סטטוס התמונה עודכן');
      fetchImages();
    } catch (error) {
      console.error('Error toggling image status:', error);
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      [IMAGE_CATEGORIES.CAROUSEL]: 'קרוסלה',
      [IMAGE_CATEGORIES.GALLERY]: 'גלריה',
      [IMAGE_CATEGORIES.DOCUMENTS]: 'מסמכים'
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="admin-loading">טוען תמונות...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>ניהול תמונות</h2>
        <button 
          className="admin-btn primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          הוסף תמונה
        </button>
      </div>

      {/* Upload Area */}
      <div className="upload-section">
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload size={48} />
          {uploading ? (
            <p>מעלה תמונות...</p>
          ) : isDragActive ? (
            <p>שחרר את הקבצים כאן...</p>
          ) : (
            <div>
              <p>גרור תמונות לכאן, או לחץ לבחירה</p>
              <small>תמונות JPG, PNG, GIF, WebP</small>
            </div>
          )}
        </div>
      </div>

      {showForm && editingImage && (
        <div className="admin-form-overlay">
          <div className="admin-form">
            <div className="admin-form-header">
              <h3>עריכת תמונה</h3>
              <button onClick={resetForm} className="admin-btn-icon">
                <X size={20} />
              </button>
            </div>

            <div className="image-preview">
              <img src={editingImage.url} alt={editingImage.title} />
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
                <label>תיאור</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>קטגוריה</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {Object.entries(IMAGE_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getCategoryLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>סדר</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
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

              <div className="form-actions">
                <button type="submit" className="admin-btn primary">
                  <Save size={16} />
                  עדכן
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
        {images.map((image) => (
          <div key={image.id} className="admin-card image-card">
            <div className="image-card-header">
              <img src={image.url} alt={image.title} className="image-thumbnail" />
              <div className="image-overlay">
                <div className="image-actions">
                  <button
                    onClick={() => toggleActive(image.id, image.isActive)}
                    className="admin-btn-icon"
                    title={image.isActive ? 'הסתר' : 'הצג'}
                  >
                    {image.isActive ? <Eye size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(image)}
                    className="admin-btn-icon"
                    title="ערוך"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(image)}
                    className="admin-btn-icon danger"
                    title="מחק"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="card-content">
              <h4>{image.title}</h4>
              {image.description && <p>{image.description}</p>}
            </div>

            <div className="card-footer">
              <span className="category-badge">
                {getCategoryLabel(image.category)}
              </span>
              <span className="size-badge">
                {formatFileSize(image.size)}
              </span>
              <span className={`status-badge ${image.isActive ? 'active' : 'inactive'}`}>
                {image.isActive ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="admin-empty">
          <p>אין תמונות להצגה</p>
          <button 
            className="admin-btn primary"
            onClick={() => setShowForm(true)}
          >
            העלה תמונה ראשונה
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageManager; 