# לוח דיגיטלי לבניין - SDIG

מערכת לוח דיגיטלי מתקדמת לבניינים המאפשרת הצגת הודעות, תמונות, מזג אוויר, זמני שבת ושירותים מהירים.

## תכונות עיקריות

- 🏢 **ניהול בניין**: הרשמה והגדרת פרטי בניין
- 📝 **הודעות ועד**: הוספה, עריכה ומחיקה של הודעות
- 🖼️ **קרוסלת תמונות**: העלאת תמונות וצגתן בקרוסלה
- 🌤️ **מזג אוויר**: הצגת מידע מזג אוויר עדכני
- 🕯️ **זמני שבת**: הצגת זמני הדלקת נרות והבדלה
- ⚡ **עדכון בזמן אמת**: כל השינויים מתעדכנים מיד
- 📱 **עיצוב רספונסיבי**: מותאם לכל המכשירים
- 🔧 **פאנל ניהול**: ממשק ניהול מתקדם לאדמין

## התקנה והגדרה

### דרישות מקדימות

- Node.js (גרסה 14 ומעלה)
- npm או yarn
- חשבון Supabase

### שלב 1: הגדרת Supabase

1. צור פרויקט חדש ב-[Supabase](https://supabase.com)
2. צור את הטבלאות הבאות:

#### טבלת buildings
```sql
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  street TEXT,
  management_company TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  setup_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### טבלת messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### טבלת images
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. צור bucket חדש ב-Storage בשם `building-images`
4. הגדר הרשאות RLS (Row Level Security):

```sql
-- הרשאות לטבלת buildings
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own building" ON buildings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own building" ON buildings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own building" ON buildings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- הרשאות לטבלת messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their building" ON messages
  FOR SELECT USING (
    building_id IN (
      SELECT id FROM buildings WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their building" ON messages
  FOR INSERT WITH CHECK (
    building_id IN (
      SELECT id FROM buildings WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their building" ON messages
  FOR DELETE USING (
    building_id IN (
      SELECT id FROM buildings WHERE id = auth.uid()
    )
  );

-- הרשאות לטבלת images
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view images from their building" ON images
  FOR SELECT USING (
    building_id IN (
      SELECT id FROM buildings WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images to their building" ON images
  FOR INSERT WITH CHECK (
    building_id IN (
      SELECT id FROM buildings WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from their building" ON images
  FOR DELETE USING (
    building_id IN (
      SELECT id FROM buildings WHERE id = auth.uid()
    )
  );
```

### שלב 2: התקנת הפרויקט

1. שכפל את הפרויקט:
```bash
git clone <repository-url>
cd sdig
```

2. התקן תלויות:
```bash
npm install
```

3. הגדר משתני סביבה:
צור קובץ `.env` בתיקיית הפרויקט:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. עדכן את קובץ `src/config/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### שלב 3: הפעלת הפרויקט

```bash
npm start
```

הפרויקט ייפתח ב-http://localhost:3000

## שימוש במערכת

### הרשמה ראשונית
1. גש לכתובת http://localhost:3000
2. לחץ על "הרשמה" והזן אימייל וסיסמה
3. השלם את פרטי הבניין (רחוב, חברת ניהול, אנשי קשר)
4. המערכת תעבור אוטומטית ללוח הדיגיטלי

### ניהול תוכן
1. לחץ על כפתור "🔧 ניהול מערכת" בפינה הימנית התחתונה
2. הוסף הודעות חדשות
3. העלה תמונות לקרוסלה
4. מחק תוכן ישן לפי הצורך

### איפוס מערכת
בדף הניהול, לחץ על "אפס מערכת" כדי למחוק את כל ההודעות והתמונות.

## מבנה הפרויקט

```
sdig/
├── public/
├── src/
│   ├── components/
│   │   ├── Registration.js          # דף הרשמה
│   │   ├── CompleteProfile.js       # השלמת פרטי בניין
│   │   ├── MainApp.js              # לוח דיגיטלי ראשי
│   │   ├── MainApp.css             # עיצוב לוח דיגיטלי
│   │   ├── AdminPanel.js           # פאנל ניהול
│   │   └── AdminPanel.css          # עיצוב פאנל ניהול
│   ├── config/
│   │   └── supabase.js             # הגדרות Supabase
│   ├── App.js                      # קומפוננטה ראשית
│   └── index.js                    # נקודת כניסה
├── package.json
└── README.md
```

## תכונות מתקדמות

### עדכון בזמן אמת
המערכת משתמשת ב-Supabase Realtime כדי לעדכן את התוכן מיד כשמתבצעים שינויים.

### אבטחה
- אימות משתמשים באמצעות Supabase Auth
- הרשאות RLS לכל הטבלאות
- הפרדה בין בניינים שונים

### עיצוב רספונסיבי
המערכת מותאמת לכל גדלי המסך - ממובייל ועד מסכים גדולים.

## פתרון בעיות

### בעיות נפוצות

1. **שגיאת חיבור ל-Supabase**
   - ודא שמשתני הסביבה מוגדרים נכון
   - בדוק שהמפתחות ב-Supabase נכונים

2. **תמונות לא נטענות**
   - ודא שה-bucket `building-images` קיים
   - בדוק הרשאות RLS לטבלת images

3. **עדכונים בזמן אמת לא עובדים**
   - ודא שה-Realtime מופעל ב-Supabase
   - בדוק הרשאות RLS

## תמיכה

לשאלות ותמיכה, פנה אל:
- אימייל: support@example.com
- טלפון: 03-1234567

## רישיון

פרויקט זה מוגן תחת רישיון MIT. 