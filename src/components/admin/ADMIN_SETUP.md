# מדריך התקנת ממשק הניהול

## סקירה כללית

ממשק הניהול כולל:
- **ניהול הודעות** - יצירה, עריכה ומחיקה של הודעות לדיירים
- **ניהול תמונות** - העלאה וניהול תמונות עם Cloudinary
- **מסד נתונים** - שימוש ב-Supabase לאחסון נתונים
- **ממשק משתמש מתקדם** - עיצוב מודרני עם תמיכה ב-RTL

## התקנת תלויות

```bash
npm install
```

## הגדרת משתני סביבה

צור קובץ `.env` בתיקיית הפרויקט:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
REACT_APP_CLOUDINARY_API_KEY=your_api_key
REACT_APP_CLOUDINARY_API_SECRET=your_api_secret
```

## הגדרת Supabase

### 1. יצירת פרויקט Supabase
1. היכנס ל-[Supabase](https://supabase.com)
2. צור פרויקט חדש
3. העתק את ה-URL וה-Anon Key

### 2. יצירת טבלאות

הרץ את הפקודות הבאות ב-SQL Editor של Supabase:

```sql
-- טבלת הודעות
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'notice',
  icon TEXT DEFAULT '📢',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת תמונות
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'carousel',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  public_id TEXT,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  format TEXT,
  size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת משתמשים (אופציונלי)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת הגדרות
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- יצירת RLS Policies (Row Level Security)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- מדיניות גישה לטבלת הודעות
CREATE POLICY "Allow public read access to messages" ON messages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

-- מדיניות גישה לטבלת תמונות
CREATE POLICY "Allow public read access to images" ON images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage images" ON images
  FOR ALL USING (auth.role() = 'authenticated');
```

## הגדרת Cloudinary

### 1. יצירת חשבון Cloudinary
1. היכנס ל-[Cloudinary](https://cloudinary.com)
2. צור חשבון חינמי
3. העתק את פרטי החשבון

### 2. הגדרת Upload Preset
1. היכנס ל-Dashboard
2. עבור ל-Settings > Upload
3. צור Upload Preset חדש
4. הגדר את ההרשאות:
   - Signing Mode: Unsigned
   - Folder: sdig
   - Allowed formats: jpg, png, gif, webp

### 3. הגדרת Transformations (אופציונלי)
```javascript
// דוגמה לשינוי גודל אוטומטי
const transformations = {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto'
};
```

## הרצת האפליקציה

```bash
npm start
```

## כניסה לממשק הניהול

1. היכנס עם משתמש שיש לו הרשאות מנהל
2. או השתמש ב:
   - שם משתמש: `admin`
   - סיסמה: `admin`

## מבנה הקבצים

```
src/
├── components/
│   └── admin/
│       ├── AdminDashboard.js      # ממשק ראשי
│       ├── MessageManager.js      # ניהול הודעות
│       ├── ImageManager.js        # ניהול תמונות
│       └── AdminStyles.css        # סגנונות
├── config/
│   ├── supabase.js               # תצורת Supabase
│   └── cloudinary.js             # תצורת Cloudinary
└── App.js                        # קובץ ראשי
```

## פיצ'רים עיקריים

### ניהול הודעות
- ✅ יצירה ועריכה של הודעות
- ✅ סיווג לפי סוג (הודעה, הכרזה, דחוף, תחזוקה)
- ✅ הגדרת עדיפות וסטטוס
- ✅ תאריכי התחלה וסיום
- ✅ אייקונים מותאמים אישית

### ניהול תמונות
- ✅ העלאה באמצעות גרירה (Drag & Drop)
- ✅ תמיכה בפורמטים מרובים (JPG, PNG, GIF, WebP)
- ✅ אופטימיזציה אוטומטית
- ✅ קטגוריות (קרוסלה, גלריה, מסמכים)
- ✅ סדר מותאם אישית

### ממשק משתמש
- ✅ עיצוב מודרני ורספונסיבי
- ✅ תמיכה מלאה ב-RTL
- ✅ התראות Toast
- ✅ ניווט אינטואיטיבי
- ✅ טעינה מהירה

## פתרון בעיות

### שגיאות Supabase
- ודא שה-URL וה-Anon Key נכונים
- בדוק שהטבלאות נוצרו כראוי
- ודא שה-RLS Policies מוגדרות

### שגיאות Cloudinary
- ודא שה-Upload Preset מוגדר כ-Unsigned
- בדוק שהתיקייה קיימת
- ודא שהפורמטים מותרים

### בעיות הרשאות
- ודא שהמשתמש מוגדר כמנהל
- בדוק את ה-RLS Policies
- ודא שה-API Keys נכונים

## אבטחה

- כל הנתונים מאוחסנים ב-Supabase עם הצפנה
- תמונות מאוחסנות ב-Cloudinary עם CDN
- הרשאות מבוססות על RLS
- אימות משתמשים מובנה

## תמיכה

לשאלות ותמיכה:
- בדוק את הלוגים ב-Console
- ודא שכל משתני הסביבה מוגדרים
- בדוק את התיעוד של Supabase ו-Cloudinary 