import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import AdminDashboard from './components/admin/AdminDashboard';

const IMAGE_BASE = 'https://gofile-34524c694a.cz5.quickconnect.to/fsdownload/hhlFH856v/sheleg/';
const DEMO_IMAGES = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
];

const NEWS_GROUPS = [
  [
    { name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss2.xml' },
    { name: 'Walla', url: 'https://rss.walla.co.il/feed/22?type=main' },
  ],
  [
    { name: 'Sport5', url: 'https://www.sport5.co.il/rss.aspx?FolderID=252' },
    { name: 'ONE', url: 'https://www.one.co.il/rss' },
  ],
  [
    { name: 'Calcalist', url: 'https://www.calcalist.co.il/home/0,7340,L-8,00.xml' },
    { name: 'TheMarker', url: 'https://www.themarker.com/cmlink/1.641' },
  ],
];

const DEFAULT_MESSAGES = [
  {
    icon: '🧹',
    title: 'שמירה על ניקיון',
    text: 'אנא הקפידו לא להשאיר אשפה, קרטונים או חפצים אישיים בשטחים הציבוריים – שמירה על ניקיון מתחילה בנו.'
  },
  {
    icon: '🔇',
    title: 'שקט בשעות מנוחה',
    text: 'בבקשה הימנעו מרעש אחרי השעה 22:00 ובשבתות וחגים, מתוך התחשבות בשכנים.'
  },
  {
    icon: '🐶',
    title: 'אחריות על בעלי חיים',
    text: 'הובלת בעלי חיים תעשה ברצועה בלבד. יש לאסוף את הצרכים ולמנוע מטרדים לרווחת כלל הדיירים.'
  },
  {
    icon: '🚪',
    title: 'רכוש ציבורי ומעברים',
    text: 'נא לא להציב חפצים או ציוד אישי במעברים, חדרי מדרגות ובקרבת דלתות כניסה – זהו שטח משותף וצריך להישאר פנוי.'
  },
  {
    icon: '🔐',
    title: 'בטיחות וביטחון',
    text: 'יש להקפיד לסגור היטב את דלת הכניסה הראשית. דלת פתוחה עלולה לסכן את בטיחות כולנו.'
  },
  {
    icon: '📝',
    title: 'עדכון פרטים',
    text: 'עברתם דירה? שיניתם מספר טלפון? נא לעדכן את ועד הבית – חשוב לשמירה על קשר שוטף במקרה הצורך.'
  },
  {
    icon: '❤️',
    title: 'קהילה מכבדת',
    text: 'אנחנו קהילה אחת – בואו נשמור על כבוד הדדי, סבלנות, ואווירה נעימה לכולנו.'
  },
];

const SERVICES = [
  { name: 'Ynet', url: 'https://www.ynet.co.il', icon: '📰' },
  { name: 'Walla', url: 'https://www.walla.co.il', icon: '📰' },
  { name: 'ספורט 5', url: 'https://www.sport5.co.il', icon: '🏟️' },
  { name: 'ONE', url: 'https://www.one.co.il', icon: '🏟️' },
  { name: 'גלובס', url: 'https://www.globes.co.il', icon: '💹' },
  { name: 'כלכליסט', url: 'https://www.calcalist.co.il', icon: '💹' },
  { name: 'Google News', url: 'https://news.google.com', icon: '🌐' },
  { name: 'חב"ד', url: 'https://www.chabad.org', icon: '🕯️' },
  { name: 'met.no', url: 'https://www.met.no', icon: '☁️' },
];

function getGregorianAndTime() {
  const now = new Date();
  // תאריך לועזי
  const gregorian = now.toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  // שעה
  const time = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  return { gregorian, time, now };
}

function Login({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>התחברות</h2>
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">התחבר</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
}

function ImageCarousel({ images, interval = 15000 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!images.length) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval]);
  if (!images.length) return <div>לא נמצאו תמונות</div>;
  return (
    <div className="carousel">
      <img src={images[index]} alt="תמונה" className="carousel-img" />
    </div>
  );
}

function NewsMultiSourceCarousel({ sources, title, interval = 15000 }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      setError('');
      let allItemsBySource = [];
      for (let s of sources) {
        try {
          const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(s.url)}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            allItemsBySource.push(data.items.map(item => ({...item, source: s.name})));
          } else {
            allItemsBySource.push([]);
          }
        } catch {
          allItemsBySource.push([]);
        }
      }
      // interleave
      let interleaved = [];
      let maxLen = Math.max(...allItemsBySource.map(arr => arr.length));
      for (let i = 0; i < maxLen; i++) {
        for (let arr of allItemsBySource) {
          if (arr[i]) interleaved.push(arr[i]);
        }
      }
      if (isMounted) {
        if (interleaved.length === 0) setError('שגיאה בטעינת חדשות');
        setItems(interleaved);
        setIndex(0);
      }
    }
    fetchAll();
    return () => { isMounted = false; };
  }, [sources]);

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items, interval]);

  if (error) return (
    <div className="news-card no-frame news-error-card">
      <div className="news-error-icon" aria-label="שגיאה בטעינת חדשות">📰</div>
      <div className="news-error-title">לא ניתן לטעון חדשות כעת</div>
      <div className="news-error-desc">ייתכן שהמקור חסום או לא זמין. נסו לרענן את הדף או לנסות מאוחר יותר.</div>
    </div>
  );
  if (!items.length) return <div className="news-card no-frame"><div className="news-error">טוען חדשות...</div></div>;
  const item = items[index];
  return (
    <div className="news-card no-frame">
      <h3>{item.source}</h3>
      <ul className="news-list">
        <li>
          <span>{item.title}</span>
        </li>
      </ul>
    </div>
  );
}

function NewsSourceCarousel({ source, interval = 15000 }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      setError('');
      try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          if (isMounted) setItems(data.items);
        } else {
          if (isMounted) setError('שגיאה בטעינת חדשות');
        }
      } catch {
        if (isMounted) setError('שגיאה בטעינת חדשות');
      }
    }
    fetchNews();
    return () => { isMounted = false; };
  }, [source.url]);

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items, interval]);

  if (error) return (
    <div className="news-card no-frame news-error-card">
      <div className="news-error-icon" aria-label="שגיאה בטעינת חדשות">📰</div>
      <div className="news-error-title">לא ניתן לטעון חדשות כעת</div>
      <div className="news-error-desc">ייתכן שהמקור חסום או לא זמין. נסו לרענן את הדף או לנסות מאוחר יותר.</div>
    </div>
  );
  if (!items.length) return <div className="news-card no-frame"><div className="news-error">טוען חדשות...</div></div>;
  const item = items[index];
  return (
    <div className="news-card no-frame">
      <h3>{source.name}</h3>
      <ul className="news-list">
        <li>
          <span>{item.title}</span>
        </li>
      </ul>
    </div>
  );
}

function WeatherForecast() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=32.0853&lon=34.7818',
          {
            headers: {
              'User-Agent': 'sheleg-digital/1.0 user@email.com',
            },
          }
        );
        if (!res.ok) throw new Error('שגיאה בטעינת תחזית');
        const data = await res.json();
        // שליפת תחזית ל-3 ימים (כל יום בצהריים)
        const times = data.properties.timeseries;
        const daily = [];
        let lastDay = '';
        for (let i = 0; i < times.length && daily.length < 3; i++) {
          const t = times[i];
          const date = t.time.split('T')[0];
          const hour = t.time.split('T')[1].split(':')[0];
          // מצא את כל הטמפרטורות של אותו יום
          if (hour === '12' && lastDay !== date) {
            // חפש את המינימום לאותו יום
            const tempsOfDay = times.filter(ts => ts.time.startsWith(date)).map(ts => ts.data.instant.details.air_temperature);
            const minTemp = Math.round(Math.min(...tempsOfDay));
            daily.push({
              date,
              temp: Math.round(t.data.instant.details.air_temperature),
              minTemp,
              symbol: t.data.next_12_hours?.summary?.symbol_code || '',
            });
            lastDay = date;
          }
        }
        setDays(daily);
      } catch (e) {
        setError('שגיאה בטעינת תחזית');
      }
      setLoading(false);
    }
    fetchWeather();
  }, []);

  const iconUrl = (symbol) =>
    symbol
      ? `https://api.met.no/images/weathericons/png/${symbol}.png`
      : '';

  const symbolToText = (symbol) => {
    if (!symbol) return '';
    // הסר סיומות
    const clean = symbol.replace(/_(day|night|polarday|polarnight)$/,'');
    const map = {
      clearsky: 'בהיר',
      partlycloudy: 'מעונן חלקית',
      cloudy: 'מעונן',
      lightrain: 'גשם קל',
      rain: 'גשם',
      heavyrain: 'גשם כבד',
      fog: 'ערפל',
      snow: 'שלג',
      lightsnow: 'שלג קל',
      sleet: 'שלג/גשם',
      fair: 'נאה',
      rainshowers: 'ממטרים',
      snowshowers: 'ממטרי שלג',
      thunderstorm: 'סופת רעמים',
    };
    return map[clean] || symbol;
  };

  if (loading) return <div>טוען תחזית...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="weather-forecast">
      {days.slice().reverse().map((d, i) => {
        // הפקת סוג מזג האוויר הבסיסי (ללא סיומות)
        const weatherType = d.symbol ? d.symbol.replace(/_(day|night|polarday|polarnight)$/,'') : '';
        return (
          <div className={`weather-day ${weatherType}`} key={i}>
            <div>{new Date(d.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
            <div className="weather-desc">{symbolToText(d.symbol)}</div>
            <div className="weather-row">
              <span className="weather-temp" style={{ color: d.temp >= 30 ? '#e53935' : d.temp <= 18 ? '#1976d2' : '#333' }}>{d.temp}°C</span>
              <img src={iconUrl(d.symbol)} alt={d.symbol} className="weather-icon" />
              <span className="weather-min">{d.minTemp}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ShabbatCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchShabbat() {
      setError('');
      try {
        const res = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=293397&lg=he');
        if (!res.ok) throw new Error();
        const d = await res.json();
        setData(d);
      } catch {
        setError('שגיאה בטעינת זמני שבת');
      }
    }
    fetchShabbat();
  }, []);

  if (error) return (
    <div className="news-card no-frame news-error-card">
      <div className="news-error-icon" aria-label="שגיאה">🕯️</div>
      <div className="news-error-title">{error}</div>
    </div>
  );
  if (!data) return <div className="news-card no-frame"><div className="news-error">טוען פרטי שבת...</div></div>;

  const parasha = data.items.find(i => i.category === 'parashat');
  const candle = data.items.find(i => i.category === 'candles');
  const havdalah = data.items.find(i => i.category === 'havdalah');

  return (
    <div className="news-card no-frame shabbat-card-animated">
      <h3>פרשת השבוע וזמני שבת (ת"א)</h3>
      <ul className="news-list">
        {parasha && <li><span className="shabbat-emoji torah">📖</span> פרשה: <span className="parasha-name">{parasha.hebrew}</span></li>}
        {candle && <li><span className="shabbat-emoji candle">🕯️</span> כניסת שבת: <span className="shabbat-time sunset-anim">{candle.title.replace('Candle lighting: ', '').replace('הדלקת נרות: ', '')}</span></li>}
        {havdalah && <li><span className="shabbat-emoji stars"><span className="shabbat-stars">⋆⋆⋆</span></span> צאת שבת: <span className="shabbat-time sunrise-anim">{havdalah.title.replace('Havdalah: ', '').replace('צאת שבת: ', '')}</span></li>}
      </ul>
    </div>
  );
}

function ManagementCompaniesCard({ user }) {
  const [company, setCompany] = React.useState('');
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    fetch('https://opensheet.elk.sh/13m2YPYP8KjmdkJws-1JtqU96km_DhoqKNKia2r3f6p4/1')
      .then(res => res.json())
      .then(data => {
        const found = data.find(row => row['משתמש'] === user['משתמש'] && row['סיסמה'] === user['סיסמה']);
        if (found) {
          console.log('שמות עמודות:', Object.keys(found));
          console.log('ערך אנשי קשר:', found['אנשי קשר']);
        }
        setCompany(found ? found['חברת ניהול'] : '');
        if (found && found['אנשי קשר']) {
          const raw = found['אנשי קשר'];
          const parts = raw.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
          const contacts = parts.map(str => {
            const match = str.match(/(.+?)(\d{2,3}-?\d{6,7}|05\d-?\d{7})/);
            if (match) {
              return { name: match[1].replace(/[-:,]+$/, '').trim(), phone: match[2] };
            } else {
              return { name: str, phone: '' };
            }
          });
          setContacts(contacts);
        } else {
          setContacts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="news-card no-frame">טוען נתונים...</div>;
  if (error) return <div className="news-card no-frame">שגיאה בטעינת נתונים</div>;
  if (!company) return null;

  return (
    <div className="news-card no-frame mgmt-news-card">
      <div className="mgmt-title">חברת ניהול</div>
      <div className="mgmt-company">{company}</div>
      <div className="mgmt-contacts-title">אנשי קשר</div>
      {contacts.length === 0 ? (
        <div className="mgmt-no-contacts">לא הוזנו אנשי קשר</div>
      ) : (
        <ul className="mgmt-contacts-list">
          {contacts.map((c, i) => (
            <li key={i} className="mgmt-contact-row">
              <span className="mgmt-contact-name">{c.name}</span>
              {c.phone && <span className="mgmt-contact-phone">📞 {c.phone}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoticesCarousel({ messages = DEFAULT_MESSAGES, interval = 15000 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!messages.length) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % messages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [messages, interval]);
  if (!messages.length) return null;
  const msg = messages[index];
  return (
    <div className="notices-panel">
      <div className="notice-card">
        <h2 className="notices-title">הודעות לדיירים</h2>
        <div className="notice-content">
          <div className="notice-title">
            <span className="notice-icon">{msg.icon}</span>
            {msg.title}
          </div>
          <div className="notice-text">{msg.text}</div>
        </div>
      </div>
    </div>
  );
}

function ServicesBar() {
  return (
    <footer className="services-bar">
    </footer>
  );
}

function WelcomeCard({ street, gregorian, hebrew, time }) {
  return (
    <div className="welcome-card">
      <div className="welcome-title">{street}</div>
      <div className="welcome-dates">
        <span>{gregorian}</span> | <span>{hebrew}</span> | <span>{time}</span>
      </div>
    </div>
  );
}

function DailyQuote() {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // שליפת הציטוט היומי מוויקיציטוט
        const response = await fetch('https://he.wikiquote.org/wiki/ויקיציטוט:מיזם_ציטוט_היום?action=raw');
        const text = await response.text();
        
        // חילוץ הציטוט מהטקסט
        const quoteMatch = text.match(/==\s*ציטוט היום\s*==\s*\n\*\s*(.+?)(?:\n|$)/);
        if (quoteMatch) {
          setQuote(quoteMatch[1].trim());
        } else {
          // אם לא מצאנו ציטוט, נציג ציטוט ברירת מחדל
          setQuote('כל יום הוא הזדמנות להתחלה חדשה');
        }
      } catch (err) {
        console.error('שגיאה בשליפת הציטוט:', err);
        setError(true);
        setQuote('הדרך היחידה לעשות עבודה נהדרת היא לאהוב את מה שאתה עושה');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="daily-quote-card">
        <div className="quote-loading">טוען ציטוט יומי...</div>
      </div>
    );
  }

  return (
    <div className="daily-quote-card">
      <div className="quote-icon">💭</div>
      <div className="quote-text">{quote}</div>
      <div className="quote-source">ציטוט יומי</div>
    </div>
  );
}

function MainApp({ street, user }) {
  const { gregorian, time, now } = getGregorianAndTime();
  const [hebrew, setHebrew] = useState('...');
  // --- Music Player State ---
  const [muted, setMuted] = useState(false);
  const audioRef = React.useRef(null);

  const toggleMute = () => {
    setMuted((m) => {
      if (audioRef.current) {
        audioRef.current.muted = !m;
      }
      return !m;
    });
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);
  // --- End Music Player State ---

  useEffect(() => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    fetch(`https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.hebrew) {
          setHebrew(data.hebrew);
        } else {
          setHebrew('שגיאה בתאריך העברי');
        }
      })
      .catch(() => setHebrew('שגיאה בתאריך העברי'));
  }, [now]);

  return (
    <div className="layout">
      {/* Music Player */}
      <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>
        <button onClick={toggleMute} style={{ fontSize: 18, padding: '4px 12px', borderRadius: 8 }}>
          {muted ? 'הפעל מוזיקה 🎵' : 'השתק מוזיקה 🔇'}
        </button>
        <audio ref={audioRef} src="/ניגוני הינוקא.mp3" autoPlay loop />
      </div>
      {/* End Music Player */}
      <div className="header-row"></div>
      <div className="main-grid">
        <div className="column left-column">
          <div className="left-cards-wrapper">
            <ManagementCompaniesCard user={user} />
            <NewsMultiSourceCarousel sources={[
              {name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss2.xml'},
              {name: 'Walla', url: 'https://rss.walla.co.il/feed/22?type=main'},
              {name: 'ספורט 5', url: 'https://news.google.com/rss/search?q=ספורט+5&hl=he&gl=IL&ceid=IL:he'},
              {name: 'ONE', url: 'https://www.one.co.il/rss'},
              {name: 'גלובס', url: 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585'},
              {name: 'כלכליסט', url: 'https://news.google.com/rss/search?q=כלכליסט+site:calcalist.co.il&hl=he&gl=IL&ceid=IL:he'}
            ]} title="חדשות" interval={15000} />
            <DailyQuote />
            <ShabbatCard />
          </div>
        </div>
        <div className="column middle-column">
          <ImageCarousel images={DEMO_IMAGES} />
        </div>
        <div className="column right-column">
          <WelcomeCard street={street} gregorian={gregorian} hebrew={hebrew} time={time} />
          <NoticesCarousel />
          <div className="weather-bottom-wrapper">
            <WeatherForecast />
          </div>
        </div>
        <div className="empty-cell"></div>
      </div>
      <ServicesBar />
    </div>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('https://opensheet.elk.sh/13m2YPYP8KjmdkJws-1JtqU96km_DhoqKNKia2r3f6p4/1')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleLogin = (username, password) => {
    const found = users.find(
      (u) => u['משתמש'] === username && u['סיסמה'] === password
    );
    if (found) {
      setUser(found);
      setError('');
      
      // בדיקה אם המשתמש הוא מנהל
      if (found['תפקיד'] === 'מנהל' || username === 'admin') {
        setIsAdmin(true);
      }
    } else {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} error={error} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <MainApp street={user['רחוב']} user={user} />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
