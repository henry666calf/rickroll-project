const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// 中間件
app.use(cors());
app.use(express.json());

// 連接到 SQLite 資料庫
const db = new sqlite3.Database('./user_data.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// 創建資料表
db.run(`
  CREATE TABLE IF NOT EXISTS user_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    postal TEXT,
    latitude REAL,
    longitude REAL,
    timezone TEXT,
    userAgent TEXT,
    timestamp TEXT
  )
`);

// 代理 API 獲取 IP 資訊
app.get('/get-ip-info', async (req, res) => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching IP info:', error);
    res.status(500).json({ error: 'Failed to fetch IP info' });
  }
});

// 儲存資料的 API
app.post('/save', (req, res) => {
  const {
    ip, city, region, country, postal,
    latitude, longitude, timezone, userAgent, timestamp
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO user_info (
      ip, city, region, country, postal,
      latitude, longitude, timezone, userAgent, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    ip, city, region, country, postal,
    latitude, longitude, timezone, userAgent, timestamp,
    (err) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Failed to save data' });
      } else {
        res.json({ message: 'Data saved successfully' });
      }
    }
  );
  stmt.finalize();
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});