require('dotenv').config();

const express    = require("express");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const cors       = require("cors");
const fs         = require("fs");
const path       = require("path");
const axios      = require("axios");
const cron       = require("node-cron");
const mysql      = require("mysql2/promise");
const multer     = require("multer");
const FormData   = require("form-data");
const { predictRisk } = require("./ml/predictRisk");


const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;

const app = express();

app.use(express.json());
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "assets")));

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "care-plus-app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, 
});

async function initDB() {
  try {
    const tempConn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: ""
    });
    await tempConn.query("CREATE DATABASE IF NOT EXISTS `care-plus-app`");
    await tempConn.end();

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        phone_number VARCHAR(255),
        profile_image VARCHAR(255),
        privacy_mode TINYINT(1) DEFAULT 0,
        expo_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS moods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        mood_emoji VARCHAR(255),
        mood_text VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        mood_reminder TINYINT(1) DEFAULT 1,
        sleep_reminder TINYINT(1) DEFAULT 1,
        water_reminder TINYINT(1) DEFAULT 1,
        meal_reminder TINYINT(1) DEFAULT 1,
        notification_sound TINYINT(1) DEFAULT 1,
        notification_preview TINYINT(1) DEFAULT 1,
        quiet_mode TINYINT(1) DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS wellness_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        sleep_goal VARCHAR(255) DEFAULT '8h',
        water_goal VARCHAR(255) DEFAULT '2L',
        mood_tracking TINYINT(1) DEFAULT 1,
        meal_tracking TINYINT(1) DEFAULT 1,
        meditation_reminder TINYINT(1) DEFAULT 1,
        journal_reminder TINYINT(1) DEFAULT 1,
        motivation_quotes TINYINT(1) DEFAULT 1,
        night_mode TINYINT(1) DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(255) DEFAULT 'general',
        read_status TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS wellness_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        log_date DATE,
        sleep_hours FLOAT,
        water_intake FLOAT,
        meals_count INT,
        meditation_minutes INT,
        stress_level INT,
        anxiety_level INT,
        energy_level INT,
        score INT,
        UNIQUE KEY unique_user_date (user_id, log_date)
      )`,
      `CREATE TABLE IF NOT EXISTS wellness_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE,
        UNIQUE KEY unique_user_date (user_id, date)
      )`,
      `CREATE TABLE IF NOT EXISTS wellness_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        wellness_score INT,
        sleep_hours FLOAT,
        water_intake FLOAT,
        meditation_minutes INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS wellness_streaks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_active_date DATE
      )`,
      `CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        description TEXT,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS favourite_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255),
        phone VARCHAR(255),
        relationship VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS game_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        log_date DATE,
        memory INT,
        stroop INT,
        sequence INT,
        tapstar INT,
        reverse INT,
        gratitude INT,
        UNIQUE KEY unique_user_date (user_id, log_date)
      )`,
      `CREATE TABLE IF NOT EXISTS therapy_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        therapist_id INT,
        therapist_name VARCHAR(255),
        title VARCHAR(255),
        session_type VARCHAR(255),
        session_date DATE,
        session_time VARCHAR(255),
        status VARCHAR(255),
        notes TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS therapy_chat_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        session_id INT,
        message_count INT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS therapy_voice_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        session_id INT,
        exchange_count INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS health_monitoring (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  heart_rate_bpm INT NOT NULL,
  temperature_fahrenheit DECIMAL(4,2) NOT NULL,
  blood_oxygen_percent INT NOT NULL,
  movement ENUM('still','moving','fall') NOT NULL DEFAULT 'still',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS health_monitoring_live (
  user_id INT PRIMARY KEY,
  heart_rate_bpm INT NOT NULL,
  temperature_fahrenheit DECIMAL(4,2) NOT NULL,
  blood_oxygen_percent INT NOT NULL,
  movement ENUM('still','moving','fall') NOT NULL DEFAULT 'still',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`,
    ];

    for (let sql of tables) {
      await db.query(sql);
    }
    console.log("Database and tables auto-created / verified");
  } catch (err) {
    console.error("DB INIT ERROR:", err);
  }
}

initDB();

// =====================
// MULTER STORAGE
// =====================
if (!fs.existsSync("./assets/uploads")) {
  fs.mkdirSync("./assets/uploads", { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "./assets/uploads"); },
  filename:    (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); },
});

const upload       = multer({ storage: diskStorage });
const uploadMemory = multer({ storage: multer.memoryStorage() });

// =====================
// AUTH MIDDLEWARE
// =====================
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });
  if (token.startsWith("Bearer ")) token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secret123");
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// =====================
// REGISTER
// =====================
app.post("/register", async (req, res) => {
  const defaultProfile = "assets/images/profile.png";
  const { name, email, password, phone_number } = req.body;
  try {
    const [existingUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, phone_number, profile_image) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone_number, defaultProfile]
    );

    const token = jwt.sign({ id: result.insertId }, "secret123", { expiresIn: "7d" });

    res.json({
      message: "User registered",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone_number,
        profile_image: defaultProfile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server registry error" });
  }
});

// =====================
// LOGIN
// =====================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) return res.status(400).json({ message: "User not found" });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign({ id: user.id }, "secret123", { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        phone_number: user.phone_number, profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// GET USER
// =====================
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT id, name, email, phone_number, created_at, profile_image, privacy_mode FROM users WHERE id = ?",
      [req.userId]
    );
    if (!result || result.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// UPDATE PROFILE
// =====================
app.put("/update-profile", authMiddleware, upload.single("profile_image"), async (req, res) => {
  const { name, email, phone_number } = req.body;
  try {
    const [result] = await db.execute("SELECT profile_image FROM users WHERE id = ?", [req.userId]);
    const oldImage = result[0]?.profile_image;
    let newImage = oldImage;
    if (req.file) {
      newImage = `assets/uploads/${req.file.filename}`;
      if (oldImage && oldImage.includes("/uploads/")) {
        const filename = oldImage.split("/uploads/")[1];
        const oldPath = path.join(__dirname, "assets", "uploads", filename);
        fs.unlink(oldPath, (err) => { if (err) console.log("Old image delete error:", err.message); });
      }
    }
    await db.execute(
      "UPDATE users SET name = ?, email = ?, phone_number = ?, profile_image = ? WHERE id = ?",
      [name, email, phone_number, newImage, req.userId]
    );
    res.json({ message: "Profile updated successfully", profile_image: newImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// =====================
// CHANGE PASSWORD
// =====================
app.put("/change-password", authMiddleware, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) return res.status(400).json({ message: "Fields required" });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, req.userId]);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// SAVE MOOD
// =====================
app.post("/mood", authMiddleware, async (req, res) => {
  const { mood_emoji } = req.body;
  const moodMap = { "😄": "Happy", "🙂": "Good", "😐": "Neutral", "😕": "Sad", "😔": "Very Sad" };
  const mood_text = moodMap[mood_emoji] || "Unknown";
  try {
    await db.execute("INSERT INTO moods (user_id, mood_emoji, mood_text) VALUES (?, ?, ?)", [req.userId, mood_emoji, mood_text]);
    res.json({ message: "Mood saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving mood" });
  }
});

// =====================
// GET MOOD HISTORY
// =====================
app.get("/mood-history", authMiddleware, async (req, res) => {
  const limit  = parseInt(req.query.limit)  || 7;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const [result] = await db.execute(
      "SELECT id, mood_emoji, mood_text, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [req.userId, limit, offset]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching moods" });
  }
});

// =====================
// DELETE MOOD
// =====================
app.delete("/delete-mood/:id", authMiddleware, async (req, res) => {
  try {
    await db.execute("DELETE FROM moods WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
    res.json({ message: "Mood deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// =====================
// TOGGLE PRIVACY
// =====================
app.put("/toggle-privacy", authMiddleware, async (req, res) => {
  const { privacy_mode } = req.body;
  try {
    await db.execute("UPDATE users SET privacy_mode = ? WHERE id = ?", [privacy_mode, req.userId]);
    res.json({ message: "Privacy mode updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update privacy mode" });
  }
});

// =====================
// DELETE ACCOUNT
// =====================
app.delete("/delete-account", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const childTables = [
    "moods", "notifications", "notification_settings", "wellness_preferences",
    "wellness_logs", "wellness_streaks", "wellness_history", "wellness_activity",
    "health_monitoring", "favourite_contacts", "achievements", "game_scores",
    "therapy_chat_logs", "therapy_voice_logs", "therapy_sessions", "password_resets",
    "journal_entries",
  ];

  try {
    for (const table of childTables) {
      try {
        await db.execute(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
      } catch (tableErr) {
        console.log(`delete-account: skipped/failed on table "${table}":`, tableErr.code || tableErr.message);
      }
    }

    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    res.json({ message: "Your account has been deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Failed deleting account info" });
  }
});

// =========================
// NOTIFICATION SETTINGS
// =========================
app.get("/notification-settings", authMiddleware, async (req, res) => {
  try {
    let [result] = await db.execute("SELECT * FROM notification_settings WHERE user_id = ?", [req.userId]);
    if (result.length === 0) {
      await db.execute("INSERT INTO notification_settings (user_id) VALUES (?)", [req.userId]);
      [result] = await db.execute("SELECT * FROM notification_settings WHERE user_id = ?", [req.userId]);
    }
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/notification-settings", authMiddleware, async (req, res) => {
  let { mood_reminder, sleep_reminder, water_reminder, meal_reminder,
        notification_sound, notification_preview, quiet_mode } = req.body;

  let finalQuietMode = quiet_mode;
  if (req.body.quiet_mode === undefined) {
    if (mood_reminder || sleep_reminder || water_reminder || meal_reminder) finalQuietMode = false;
  }

  let finalMood  = mood_reminder,  finalSleep = sleep_reminder;
  let finalWater = water_reminder, finalMeal  = meal_reminder;
  let finalSound = notification_sound, finalPreview = notification_preview;

  if (finalQuietMode) {
    finalMood = finalSleep = finalWater = finalMeal = finalSound = finalPreview = false;
  }

  try {
    await db.execute(
      `UPDATE notification_settings
       SET mood_reminder=?, sleep_reminder=?, water_reminder=?, meal_reminder=?,
           notification_sound=?, notification_preview=?, quiet_mode=?
       WHERE user_id=?`,
      [finalMood, finalSleep, finalWater, finalMeal, finalSound, finalPreview, finalQuietMode, req.userId]
    );
    res.json({
      message: "Notification settings updated",
      data: { mood_reminder: finalMood, sleep_reminder: finalSleep, water_reminder: finalWater,
              meal_reminder: finalMeal, notification_sound: finalSound, notification_preview: finalPreview,
              quiet_mode: finalQuietMode },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// =====================
// EXPO TOKEN
// =====================
app.post("/save-token", authMiddleware, async (req, res) => {
  const { expo_token } = req.body;
  try {
    await db.execute("UPDATE users SET expo_token = ? WHERE id = ?", [expo_token, req.userId]);
    res.json({ message: "Token saved" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// IN-APP NOTIFICATIONS
// =====================
app.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50",
      [req.userId]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    await db.execute("UPDATE notifications SET read_status = 1 WHERE user_id = ?", [req.userId]);
    res.json({ message: "All marked read" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    await db.execute("UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
    res.json({ message: "Marked read" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/notifications/unread-count", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0",
      [req.userId]
    );
    res.json({ count: result[0].count });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// IN-APP NOTIFICATION HELPER
// =====================
async function createInAppNotification(userId, title, body, type = "general") {
  try {
    const [existing] = await db.execute(
      "SELECT id FROM notifications WHERE user_id = ? AND title = ? AND created_at >= NOW() - INTERVAL 55 MINUTE LIMIT 1",
      [userId, title]
    );
    if (existing.length > 0) return;

    await db.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId, title, body, type]
    );
  } catch (err) {
    console.log("createInAppNotification error:", err.message);
  }
}

function pickQuote() {
  const quotes = [
    "You are stronger than you think.",
    "Small progress is still progress.",
    "Stay consistent, not perfect.",
    "Take care of your mind today.",
    "Healing is not linear — be patient with yourself.",
    "One step at a time is still moving forward.",
    "Your feelings are valid. You matter.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// =====================
// CRON — in-app notifications
// =====================
cron.schedule("* * * * *", async () => {
  const now    = new Date();
  const hour   = now.getHours();
  const minute = now.getMinutes();

  try {
    const [users] = await db.execute(`
      SELECT 
        users.id AS user_id,
        notification_settings.mood_reminder,
        notification_settings.sleep_reminder,
        notification_settings.water_reminder,
        notification_settings.meal_reminder,
        notification_settings.quiet_mode,
        wellness_preferences.meditation_reminder,
        wellness_preferences.journal_reminder,
        wellness_preferences.motivation_quotes,
        wellness_preferences.sleep_goal,
        wellness_preferences.water_goal
      FROM users
      LEFT JOIN notification_settings ON users.id = notification_settings.user_id
      LEFT JOIN wellness_preferences  ON users.id = wellness_preferences.user_id
    `);

    if (!Array.isArray(users)) return;

    for (const user of users) {
      if (user.quiet_mode) continue;
      const userId = user.user_id;

      if (hour === 22 && minute === 0 && user.sleep_reminder) {
        await createInAppNotification(userId, "🌙 Sleep Insight",
          `Sleep goal: ${user.sleep_goal || "8h"} — time to wind down and rest`, "wellness");
      }
      if (hour % 3 === 0 && minute === 0 && user.water_reminder) {
        await createInAppNotification(userId, "💧 Hydration Insight",
          `Hydration goal: ${user.water_goal || "2L"} — log your water intake`, "wellness");
      }
      if (hour === 9 && minute === 0 && user.mood_reminder) {
        await createInAppNotification(userId, "😊 Mood Check",
          "How are you feeling today? Log your mood to track your wellness", "wellness");
      }
      if (hour === 14 && minute === 0 && user.meal_reminder) {
        await createInAppNotification(userId, "🍽 Meal Reminder",
          "Don't skip your afternoon meal — log it for your wellness score", "wellness");
      }
      if (hour === 18 && minute === 0 && user.meditation_reminder) {
        await createInAppNotification(userId, "🧘 Mind Reset",
          "Take 5 minutes for breathing and calmness", "wellness");
      }
      if (hour === 21 && minute === 0 && user.journal_reminder) {
        await createInAppNotification(userId, "📔 Journal Time",
          "Write your thoughts — reflect on your day", "wellness");
      }
      if (hour === 10 && minute === 0 && user.motivation_quotes) {
        await createInAppNotification(userId, "✨ Daily Motivation", pickQuote(), "wellness");
      }

      if (hour === 20 && minute === 0) {
        const [logs] = await db.execute(
          "SELECT id FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1",
          [userId]
        );
        if (logs.length === 0) {
          await createInAppNotification(userId, "📊 Wellness Log Pending",
            "You haven't logged your wellness today. Take 2 minutes to track your health!", "wellness");
        }
      }

      if (hour === 19 && minute === 0) {
        const [logs] = await db.execute(
          "SELECT score FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1",
          [userId]
        );
        if (logs.length > 0 && logs[0].score < 40) {
          await createInAppNotification(userId, "💙 Wellness Support",
            "Your wellness score is low today. Sera is here — start a chat session for support.", "therapy");
        }
      }
    }
  } catch (err) {
    console.log("CRON ERROR:", err);
  }
});

// Midnight streak sync
cron.schedule("0 0 * * *", async () => {
  try {
    const [users] = await db.execute("SELECT id FROM users");
    for (const user of users) {
      await db.execute(
        "INSERT INTO wellness_activity (user_id, date) VALUES (?, CURDATE()) ON DUPLICATE KEY UPDATE id=id",
        [user.id]
      );
    }
  } catch (err) {
    console.error("Midnight Sync Error:", err);
  }
});

// =====================
// THERAPY SESSION REMINDERS
// =====================
function parseSessionDateTime(session_date, session_time) {
  if (!session_date || !session_time) return null;

  // session_date is now a plain "YYYY-MM-DD" string thanks to dateStrings:true.
  const dateOnly = String(session_date).split(" ")[0].split("T")[0];
  const [yearStr, monthStr, dayStr] = dateOnly.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (!year || !month || !day) return null;

  const match = String(session_time).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let [, hourStr, minuteStr, meridiem] = match;
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (meridiem) {
    meridiem = meridiem.toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
  }

  // Built entirely in local time — no UTC round-trip, so no day-shift bug.
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

cron.schedule("* * * * *", async () => {
  try {
    const [sessions] = await db.execute(
      "SELECT id, user_id, title, session_type, session_date, session_time FROM therapy_sessions WHERE status = 'upcoming'"
    );

    const now = new Date();
    for (const s of sessions) {
      const sessionDt = parseSessionDateTime(s.session_date, s.session_time);
      if (!sessionDt) continue;

      const minutesUntil = (sessionDt.getTime() - now.getTime()) / 60000;

      if (minutesUntil > 25 && minutesUntil <= 30) {
        const kind = s.session_type === "voice" ? "Voice" : "Chat";
        await createInAppNotification(
          s.user_id,
          "🔔 Session Starting Soon",
          `Your ${kind} session with Sera "${s.title}" starts in about ${Math.round(minutesUntil)} minutes. Get ready!`,
          "therapy"
        );
      }

      if (minutesUntil > 0 && minutesUntil <= 5) {
        const kind = s.session_type === "voice" ? "Voice" : "Chat";
        await createInAppNotification(
          s.user_id,
          "⏰ Session Starting Now",
          `Your ${kind} session "${s.title}" with Sera is about to begin. Tap to open.`,
          "therapy"
        );
      }
    }
  } catch (err) {
    console.log("SESSION REMINDER CRON ERROR:", err);
  }
});

// ─── SESSION EXPIRY CHECK ───────────────────────────────────────────────────
// Runs every minute. Marks any 'upcoming' session as 'expired' once its
// actual date+time has passed, and notifies the user to reschedule.
cron.schedule("* * * * *", async () => {
  try {
    const [sessions] = await db.execute(
      "SELECT id, user_id, title, session_type, session_date, session_time FROM therapy_sessions WHERE status = 'upcoming'"
    );

    const now = new Date();
    for (const s of sessions) {
      const sessionDt = parseSessionDateTime(s.session_date, s.session_time);
      if (!sessionDt) continue;

      if (sessionDt.getTime() < now.getTime()) {
        await db.execute(
          "UPDATE therapy_sessions SET status = 'expired' WHERE id = ?",
          [s.id]
        );

        const kind = s.session_type === "voice" ? "voice" : "chat";
        await createInAppNotification(
          s.user_id,
          "⏳ Session Expired",
          `Your ${kind} session "${s.title}" has expired because it wasn't started in time. Tap to reschedule.`,
          "therapy"
        );
      }
    }
  } catch (err) {
    console.log("SESSION EXPIRY CRON ERROR:", err);
  }
});

// =====================
// WELLNESS PREFERENCES
// =====================
app.get("/wellness-preferences", authMiddleware, async (req, res) => {
  try {
    let [result] = await db.execute("SELECT * FROM wellness_preferences WHERE user_id = ?", [req.userId]);
    if (result.length === 0) {
      await db.execute("INSERT INTO wellness_preferences (user_id) VALUES (?)", [req.userId]);
      [result] = await db.execute("SELECT * FROM wellness_preferences WHERE user_id = ?", [req.userId]);
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/wellness-preferences", authMiddleware, async (req, res) => {
  let { sleep_goal, water_goal, mood_tracking, meal_tracking,
        meditation_reminder, journal_reminder, motivation_quotes, night_mode } = req.body;

  if (night_mode === true) { meditation_reminder = false; journal_reminder = false; motivation_quotes = false; }
  if (meditation_reminder === true || journal_reminder === true || motivation_quotes === true) night_mode = false;

  try {
    await db.execute(
      `UPDATE wellness_preferences
       SET sleep_goal=?, water_goal=?, mood_tracking=?, meal_tracking=?,
           meditation_reminder=?, journal_reminder=?, motivation_quotes=?, night_mode=?
       WHERE user_id=?`,
      [sleep_goal, water_goal, mood_tracking, meal_tracking,
       meditation_reminder, journal_reminder, motivation_quotes, night_mode, req.userId]
    );
    res.json({ message: "Preferences updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// ACHIEVEMENTS
// =====================
async function checkAchievements(userId, data) {
  try {
    const [streakResult] = await db.execute(
      "SELECT current_streak FROM wellness_streaks WHERE user_id = ?", [userId]
    );
    const streak     = parseInt(streakResult[0]?.current_streak) || 0;
    const water      = parseFloat(data.water) || 0;
    const sleep      = parseFloat(data.sleep) || 0;
    const meditation = parseInt(data.meditation) || 0;

    const achievements = [
      { title: "7 Day Streak",    condition: streak >= 7,     desc: "Maintained wellness tracking for 7 days" },
      { title: "30 Day Master",   condition: streak >= 30,    desc: "Maintained wellness consistency for 30 days" },
      { title: "Hydration Hero",  condition: water >= 3.0,    desc: "Drank 3L of water in one day" },
      { title: "Deep Sleeper",    condition: sleep >= 8,      desc: "Achieved 8+ hours of sleep" },
      { title: "Zen Master",      condition: meditation >= 20, desc: "Completed 20 mins of meditation" },
    ];

    for (const ach of achievements) {
      if (ach.condition) await unlockAchievement(userId, ach.title, ach.desc);
    }
  } catch (err) {
    console.error("checkAchievements error:", err);
  }
}

async function unlockAchievement(userId, title, description) {
  try {
    const [existing] = await db.execute(
      "SELECT id FROM achievements WHERE user_id = ? AND title = ?", [userId, title]
    );
    if (existing.length > 0) return;

    await db.execute(
      "INSERT INTO achievements (user_id, title, description) VALUES (?, ?, ?)",
      [userId, title, description]
    );

    await createInAppNotification(
      userId,
      `🏆 Achievement Unlocked`,
      `You earned "${title}" — ${description}`,
      "achievement"
    );
  } catch (err) {
    console.error("unlockAchievement SQL error:", err);
  }
}

app.get("/achievements/daily", authMiddleware, async (req, res) => {
  try {
    const [log] = await db.execute(
      "SELECT * FROM wellness_logs WHERE user_id=? AND log_date=CURDATE() LIMIT 1", [req.userId]
    );
    const [streak] = await db.execute(
      "SELECT current_streak FROM wellness_streaks WHERE user_id=?", [req.userId]
    );

    const data = log[0] || {};
    const currentStreak = streak[0]?.current_streak || 0;

    const daily = [
      { id: "sleep",      emoji: "💤", title: "Deep Sleeper",   desc: "Sleep 8+ hours",        done: (data.sleep_hours || 0) >= 8 },
      { id: "water",      emoji: "💧", title: "Hydration Hero", desc: "Drink 2L+ water",        done: (data.water_intake || 0) >= 2 },
      { id: "meals",      emoji: "🍽", title: "Meal Master",    desc: "Log 3 meals",            done: (data.meals_count || 0) >= 3 },
      { id: "meditation", emoji: "🧘", title: "Zen Warrior",    desc: "Meditate 10+ mins",      done: (data.meditation_minutes || 0) >= 10 },
      { id: "stress",     emoji: "😌", title: "Calm Mind",      desc: "Stress level ≤ 3",       done: (data.stress_level || 10) <= 3 },
      { id: "energy",     emoji: "⚡", title: "Full Power",     desc: "Energy level 7+",        done: (data.energy_level || 0) >= 7 },
      { id: "streak7",    emoji: "🔥", title: "7-Day Streak",   desc: "7 day streak",           done: currentStreak >= 7 },
      { id: "perfect",    emoji: "🏆", title: "Perfect Day",    desc: "Score 90+",              done: (data.score || 0) >= 90 },
    ];

    res.json({ date: new Date().toISOString().split("T")[0], achievements: daily });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/achievements", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

// =====================
// DAILY QUOTE
// =====================
app.get("/wellness/daily-quote", authMiddleware, async (req, res) => {
  try {
    const [prefsResult] = await db.execute(
      "SELECT motivation_quotes FROM wellness_preferences WHERE user_id = ?",
      [req.userId]
    );

    const prefs = prefsResult[0];
    if (prefs && prefs.motivation_quotes === 0) {
      return res.json({ showQuote: false, text: "" });
    }

    const quotesPool = [
      "You are stronger than you think.",
      "Small progress is still progress.",
      "Stay consistent, not perfect.",
      "Take care of your mind today.",
      "Do the best you can until you know better.",
      "Believe you can and you're halfway there.",
      "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
      "Rest is not a reward — it's a requirement.",
      "Be patient with yourself; growth takes time.",
      "One mindful breath can change your whole day.",
    ];

    const now   = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    return res.json({
      showQuote: true,
      text: quotesPool[dayOfYear % quotesPool.length],
    });
  } catch (err) {
    console.error("Quote API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =====================
// WELLNESS LOGGING
// =====================
app.post("/wellness-log", authMiddleware, async (req, res) => {
  const { sleep_hours, water_intake, meals_count, meditation_minutes,
          stress_level, anxiety_level, energy_level } = req.body;

  const user_id  = req.userId;
  const log_date = new Date().toISOString().split("T")[0];

  let calculatedScore = 0;
  const sleep      = parseFloat(sleep_hours)       || 0;
  const waterLiters= parseFloat(water_intake)      || 0;
  const meals      = parseInt(meals_count)          || 0;
  const meditation = parseInt(meditation_minutes)   || 0;
  const stress     = parseInt(stress_level)         || 0;
  const anxiety    = parseInt(anxiety_level)        || 0;
  const energy     = parseInt(energy_level)         || 0;

  if (sleep >= 7)        calculatedScore += 25; else if (sleep >= 5) calculatedScore += 15;
  if (waterLiters >= 2)  calculatedScore += 25; else if (waterLiters >= 1) calculatedScore += 15;
  calculatedScore += meals * 10;
  if (meditation >= 10)  calculatedScore += 15; else if (meditation > 0) calculatedScore += 8;
  if (stress <= 3)       calculatedScore += 10; else if (stress <= 6) calculatedScore += 5;
  if (anxiety <= 3)      calculatedScore += 10; else if (anxiety <= 6) calculatedScore += 5;
  if (energy >= 7)       calculatedScore += 10; else if (energy >= 5) calculatedScore += 5;
  if (calculatedScore > 100) calculatedScore = 100;

  const sql = `
    INSERT INTO wellness_logs (user_id, log_date, sleep_hours, water_intake, meals_count,
      meditation_minutes, stress_level, anxiety_level, energy_level, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      sleep_hours=VALUES(sleep_hours), water_intake=VALUES(water_intake),
      meals_count=VALUES(meals_count), meditation_minutes=VALUES(meditation_minutes),
      stress_level=VALUES(stress_level), anxiety_level=VALUES(anxiety_level),
      energy_level=VALUES(energy_level), score=VALUES(score)
  `;

  try {
    await db.execute(sql, [user_id, log_date, sleep, waterLiters, meals,
                           meditation, stress, anxiety, energy, calculatedScore]);
    await updateUserStreak(req.userId);
    // await saveWellnessHistory(req.userId, calculatedScore);
    await checkAchievements(req.userId, { sleep, water: waterLiters, meditation });

    if (stress >= 7) {
      await createInAppNotification(user_id, "🆘 High Stress Detected",
        "Your stress level is very high. Sera is here — open a chat session for immediate support.", "therapy");
    }
    if (anxiety >= 7) {
      await createInAppNotification(user_id, "💙 Anxiety Alert",
        "High anxiety detected. Try the breathing exercise or talk to Sera right now.", "therapy");
    }
    if (sleep < 5 && sleep > 0) {
      await createInAppNotification(user_id, "😴 Sleep Concern",
        "Less than 5 hours of sleep can impact your mental health. Sera can help you with sleep techniques.", "wellness");
    }

    res.json({ message: "Saved successfully", score: calculatedScore });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

// async function saveWellnessHistory(userId, score) {
//   try {
//     const [result] = await db.execute(
//       "SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]
//     );
//     if (result.length === 0) return;
//     const data = result[0];
//     await db.execute(
//       "INSERT INTO wellness_history (user_id, wellness_score, sleep_hours, water_intake, meditation_minutes) VALUES (?, ?, ?, ?, ?)",
//       [userId, score, data.sleep_hours, data.water_intake, data.meditation_minutes]
//     );
//   } catch (err) {
//     console.error("History update failure:", err);
//   }
// }

async function updateUserStreak(userId) {
  try {
    const [result] = await db.execute("SELECT * FROM wellness_streaks WHERE user_id = ?", [userId]);
    const todayString = new Date().toISOString().split("T")[0];

    if (result.length === 0) {
      await db.execute(
        "INSERT INTO wellness_streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (?, 1, 1, ?)",
        [userId, todayString]
      );
      return;
    }

    const streak  = result[0];
    const lastDate= new Date(streak.last_active_date);
    const today   = new Date(todayString);
    const diffDays= Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    let current   = streak.current_streak;

    if (diffDays === 0) return;
    if (diffDays === 1) current += 1;
    if (diffDays > 1)  current = 1;

    const longest = Math.max(current, streak.longest_streak);
    await db.execute(
      "UPDATE wellness_streaks SET current_streak=?, longest_streak=?, last_active_date=? WHERE user_id=?",
      [current, longest, todayString, userId]
    );
  } catch (err) {
    console.error(err);
  }
}

function generateRecommendations(data) {
  const rec = [];
  if ((data.sleep_hours || 0) < 7)   rec.push("Try to sleep at least 7–8 hours for better recovery.");
  if ((data.water_intake || 0) < 2)  rec.push("Increase water intake to 2–3 liters daily.");
  if ((data.stress_level || 0) > 6)  rec.push("Try breathing exercises or short walks to reduce stress.");
  if ((data.energy_level || 0) < 5)  rec.push("Low energy detected — improve sleep and nutrition.");
  if ((data.anxiety_level || 0) > 6) rec.push("High anxiety — consider a session with Sera for grounding techniques.");
  if (rec.length === 0) rec.push("Great job! Keep maintaining your healthy routine.");
  return rec;
}

// =====================
// DASHBOARD & GETTERS
// =====================
app.get("/wellness-log/today", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE()", [req.userId]
    );
    res.json(result[0] || {
      sleep_hours: null, water_intake: 0, meals_count: 0, meditation_minutes: 0,
      stress_level: null, anxiety_level: null, energy_level: null,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/wellness/today", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE()", [req.userId]
    );
    res.json(result[0] || {
      sleep_hours: null, water_intake: 0, meals_count: 0, meditation_minutes: 0,
      stress_level: null, anxiety_level: null, energy_level: null, score: 0,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/moods/latest", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT mood_emoji, mood_text, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [req.userId]
    );
    res.json(result[0] || null);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/wellness-dashboard", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const [logs]         = await db.execute("SELECT * FROM wellness_logs WHERE user_id=? AND log_date=CURDATE() LIMIT 1", [userId]);
    const [mood]         = await db.execute("SELECT mood_emoji, mood_text FROM moods WHERE user_id=? AND DATE(created_at)=CURDATE() ORDER BY created_at DESC LIMIT 1", [userId]);
    const [streak]       = await db.execute("SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id=? LIMIT 1", [userId]);
    const [achievements] = await db.execute("SELECT id, title, description, unlocked_at FROM achievements WHERE user_id=? ORDER BY unlocked_at DESC", [userId]);

    const log = logs[0] || { score:0, sleep_hours:0, water_intake:0, meals_count:0,
                             meditation_minutes:0, stress_level:0, anxiety_level:0, energy_level:0 };

    res.json({
      ...log,
      mood: mood.length > 0 ? { emoji: mood[0].mood_emoji, text: mood[0].mood_text } : null,
      streaks: { current: streak[0]?.current_streak || 0, longest: streak[0]?.longest_streak || 0 },
      achievements: achievements || [],
      recommendations: generateRecommendations(log),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Dashboard error" });
  }
});

app.get("/dashboard/:userId", async (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT w.*, COALESCE(m.mood_emoji,'😐') AS mood_emoji, COALESCE(m.mood_text,'Neutral') AS mood_text,
           ws.current_streak, ws.longest_streak, ws.last_active_date
    FROM wellness_logs w
    LEFT JOIN moods m ON m.user_id=w.user_id AND DATE(m.created_at)=DATE(w.log_date)
    LEFT JOIN wellness_streaks ws ON ws.user_id=w.user_id
    WHERE w.user_id=? AND w.log_date=CURDATE() LIMIT 1
  `;
  try {
    const [rows] = await db.execute(sql, [userId]);
    res.json(rows[0] || null);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Dashboard error" });
  }
});

app.get("/logs/:userId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM wellness_logs WHERE user_id=? ORDER BY log_date DESC LIMIT 7", [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Logs fetching error" });
  }
});

// app.get("/wellness-history", authMiddleware, async (req, res) => {
//   try {
//     const [rows] = await db.execute(
//       "SELECT * FROM wellness_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
//       [req.userId]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch history" });
//   }
// });

// app.get("/health-monitoring-live", authMiddleware, async (req, res) => {
//   try {
//     const [rows] = await db.execute(
//       "SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, updated_at FROM health_monitoring_live WHERE user_id = ?",
//       [req.userId]
//     );
//     res.json(rows[0] || null);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching live vitals" });
//   }
// });

// app.post("/health-monitoring", authMiddleware, async (req, res) => {
//   const { heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement } = req.body;
//   const validMovements = ["still", "moving", "fall"];
//   const safeMovement = validMovements.includes(movement) ? movement : "still";

//   try {
//     // Every ~10s call REPLACES this user's single live row
//     await db.execute(
//       `INSERT INTO health_monitoring_live
//         (user_id, heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement)
//        VALUES (?, ?, ?, ?, ?)
//        ON DUPLICATE KEY UPDATE
//          heart_rate_bpm = VALUES(heart_rate_bpm),
//          temperature_fahrenheit = VALUES(temperature_fahrenheit),
//          blood_oxygen_percent = VALUES(blood_oxygen_percent),
//          movement = VALUES(movement)`,
//       [req.userId, heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, safeMovement]
//     );

//     if (heart_rate_bpm > 120) {
//       await createInAppNotification(req.userId, "❤️ High Heart Rate Alert",
//         `Your heart rate is ${heart_rate_bpm} bpm. Please rest and talk to Sera if needed.`, "health");
//     }
//     if (blood_oxygen_percent < 96) {
//       await createInAppNotification(req.userId, "🩺 Low SpO₂ Alert",
//         `Blood oxygen at ${blood_oxygen_percent}%. Please seek medical attention if this persists.`, "health");
//     }
//     if (temperature_fahrenheit > 101) {
//       await createInAppNotification(req.userId, "🌡️ High Temperature Alert",
//         `Temperature ${temperature_fahrenheit}°F detected. Rest and stay hydrated.`, "health");
//     }

//     res.json({ message: "Vitals saved" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save vitals" });
//   }
// });

app.get("/health-monitoring-live", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, updated_at FROM health_monitoring_live WHERE user_id = ?",
      [req.userId]
    );
    const latest = rows[0] || null;

    if (latest) {
      latest.risk = predictRisk(latest.heart_rate_bpm, latest.blood_oxygen_percent, latest.temperature_fahrenheit);
    }

    res.json(latest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching live vitals" });
  }
});

app.post("/health-monitoring", authMiddleware, async (req, res) => {
  const { heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement } = req.body;
  const validMovements = ["still", "moving", "fall"];
  const safeMovement = validMovements.includes(movement) ? movement : "still";

  try {
    // Every ~10s call REPLACES this user's single live row
    await db.execute(
      `INSERT INTO health_monitoring_live
        (user_id, heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         heart_rate_bpm = VALUES(heart_rate_bpm),
         temperature_fahrenheit = VALUES(temperature_fahrenheit),
         blood_oxygen_percent = VALUES(blood_oxygen_percent),
         movement = VALUES(movement)`,
      [req.userId, heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, safeMovement]
    );

    // ── ML risk prediction ──
    const risk = predictRisk(heart_rate_bpm, blood_oxygen_percent, temperature_fahrenheit);

    if (risk.category === "High Risk" && risk.probability >= 0.7) {
      await createInAppNotification(
        req.userId,
        "⚠️ Elevated Risk Detected",
        `Your vitals suggest elevated risk (${Math.round(risk.probability * 100)}% confidence). Consider resting and checking in with Sera if you feel unwell.`,
        "health"
      );
    }

    if (heart_rate_bpm > 120) {
      await createInAppNotification(req.userId, "❤️ High Heart Rate Alert",
        `Your heart rate is ${heart_rate_bpm} bpm. Please rest and talk to Sera if needed.`, "health");
    }
    if (blood_oxygen_percent < 96) {
      await createInAppNotification(req.userId, "🩺 Low SpO₂ Alert",
        `Blood oxygen at ${blood_oxygen_percent}%. Please seek medical attention if this persists.`, "health");
    }
    if (temperature_fahrenheit > 101) {
      await createInAppNotification(req.userId, "🌡️ High Temperature Alert",
        `Temperature ${temperature_fahrenheit}°F detected. Rest and stay hydrated.`, "health");
    }

    res.json({ message: "Vitals saved", risk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save vitals" });
  }
});

// =====================
// FAVOURITE CONTACTS
// =====================
app.post("/favourite-contact", authMiddleware, async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    const [countResult] = await db.execute(
      "SELECT COUNT(*) AS total FROM favourite_contacts WHERE user_id = ?",
      [req.userId]
    );
    if (countResult[0].total >= 5) {
      return res.status(400).json({ message: "Maximum 5 emergency contacts allowed" });
    }
    await db.execute(
      "INSERT INTO favourite_contacts (user_id, name, phone, email) VALUES (?, ?, ?, ?)",
      [req.userId, name, phone, email || null]
    );
    res.json({ message: "Contact saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save contact" });
  }
});

app.get("/favourite-contact", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM favourite_contacts WHERE user_id = ? ORDER BY created_at ASC",
      [req.userId]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

app.put("/favourite-contact/:id", authMiddleware, async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    await db.execute(
      "UPDATE favourite_contacts SET name=?, phone=?, email=? WHERE id=? AND user_id=?",
      [name, phone, email || null, req.params.id, req.userId]
    );
    res.json({ message: "Contact updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update contact" });
  }
});

app.delete("/favourite-contact/:id", authMiddleware, async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM favourite_contacts WHERE id=? AND user_id=?",
      [req.params.id, req.userId]
    );
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

// =====================
// MEDITATION UPDATE
// =====================
app.post("/api/meditation/update-minutes", authMiddleware, async (req, res) => {
  const { log_date, meditation_minutes } = req.body;
  if (!log_date || meditation_minutes == null)
    return res.status(400).json({ message: "log_date and meditation_minutes are required" });
  try {
    await db.execute(
      `INSERT INTO wellness_logs (user_id, log_date, meditation_minutes)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE meditation_minutes = meditation_minutes + VALUES(meditation_minutes)`,
      [req.userId, log_date, meditation_minutes]
    );
    res.json({ message: "Meditation updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// GAME SCORES
// =====================
app.get("/api/game-scores", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const [todayRows] = await db.execute(
      "SELECT memory, stroop, sequence, tapstar, reverse, gratitude FROM game_scores WHERE user_id=? AND log_date=?",
      [req.userId, today]
    );
    const [prevRows] = await db.execute(
      `SELECT MAX(memory) AS memory, MAX(stroop) AS stroop, MAX(sequence) AS sequence,
              MAX(tapstar) AS tapstar, MAX(reverse) AS reverse, MAX(gratitude) AS gratitude
       FROM game_scores WHERE user_id=? AND log_date<?`,
      [req.userId, today]
    );
    res.json({ today: todayRows[0] ?? {}, previous: prevRows[0] ?? {} });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/game-scores", authMiddleware, async (req, res) => {
  const { game, score, log_date } = req.body;
  const VALID_GAMES = ["memory", "stroop", "sequence", "tapstar", "reverse", "gratitude"];
  if (!game || !VALID_GAMES.includes(game)) return res.status(400).json({ message: "Invalid or missing game key" });
  if (score == null || !log_date) return res.status(400).json({ message: "score and log_date are required" });
  try {
    await db.execute(
      `INSERT INTO game_scores (user_id, log_date, ${game}) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ${game} = GREATEST(${game}, VALUES(${game}))`,
      [req.userId, log_date, score]
    );
    const [rows] = await db.execute(
      "SELECT memory, stroop, sequence, tapstar, reverse, gratitude FROM game_scores WHERE user_id=? AND log_date=?",
      [req.userId, log_date]
    );
    res.json({ message: "Score saved", today: rows[0] ?? {} });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// THERAPY — AI-only (Sera)
// =====================

app.get("/therapy/sessions", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM therapy_sessions WHERE user_id = ? AND status != 'expired' ORDER BY session_date ASC, session_time ASC",
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/therapy/book", authMiddleware, async (req, res) => {
  try {
    const { session_type, session_date, session_time, title, notes } = req.body;

    if (!session_type || !session_date || !session_time || !title) {
      return res.status(400).json({ message: "session_type, session_date, session_time and title are required" });
    }
    if (!["chat", "voice"].includes(session_type)) {
      return res.status(400).json({ message: "session_type must be 'chat' or 'voice'" });
    }

    const [result] = await db.execute(
      `INSERT INTO therapy_sessions
        (user_id, therapist_id, therapist_name, title, session_type, session_date, session_time, status, notes)
       VALUES (?, NULL, 'Sera (AI Companion)', ?, ?, ?, ?, 'upcoming', ?)`,
      [req.userId, title, session_type, session_date, session_time, notes || null]
    );

    await createInAppNotification(
      req.userId,
      "✅ Session Booked",
      `Your ${session_type === "voice" ? "Voice" : "Chat"} session "${title}" with Sera is confirmed for ${session_date} at ${session_time}.`,
      "therapy"
    );

    res.json({ success: true, sessionId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking Failed" });
  }
});

app.post("/therapy/chat-log", authMiddleware, async (req, res) => {
  const { session_id, message_count, summary } = req.body;
  try {
    await db.execute(
      "INSERT INTO therapy_chat_logs (user_id, session_id, message_count, summary) VALUES (?, ?, ?, ?)",
      [req.userId, session_id, message_count, summary]
    );

    if (session_id) {
      await db.execute(
        "UPDATE therapy_sessions SET status = 'completed' WHERE id = ? AND user_id = ?",
        [session_id, req.userId]
      );
      await createInAppNotification(req.userId, "✨ Session Complete",
        "Great job completing your chat session with Sera. Check your wellness dashboard for updates.", "therapy");
    }

    res.json({ success: true, message: "Chat Logged" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

app.post("/therapy/voice-log", authMiddleware, async (req, res) => {
  const { session_id, exchange_count } = req.body;
  try {
    await db.execute(
      "INSERT INTO therapy_voice_logs (user_id, session_id, exchange_count) VALUES (?, ?, ?)",
      [req.userId, session_id, exchange_count]
    );

    if (session_id) {
      await db.execute(
        "UPDATE therapy_sessions SET status = 'completed' WHERE id = ? AND user_id = ?",
        [session_id, req.userId]
      );
      await createInAppNotification(req.userId, "🎙️ Voice Session Complete",
        "Your voice session with Sera has ended. Well done for taking care of your mental health today.", "therapy");
    }

    res.json({ success: true, message: "Voice Log Saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

app.put("/therapy/session-status/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    await db.execute(
      "UPDATE therapy_sessions SET status = ? WHERE id = ? AND user_id = ?",
      [status, req.params.id, req.userId]
    );
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

app.delete("/therapy/session/:id", authMiddleware, async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM therapy_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    res.json({ success: true, message: "Session cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

// ─── Shared persona prompt (used by both chat and voice) ───────────────────
const BASE_PERSONA_PROMPT = `You are Sera, a compassionate AI mental wellness companion inside the Care Plus app. You are NOT a licensed psychiatrist, psychologist, or medical doctor, and you never claim to be one.

## LANGUAGE & TONE (CRITICAL — FOLLOW STRICTLY)
- CRITICAL RULE: Detect the language of EACH user message independently and ALWAYS reply in the SAME language.
- If the user writes in ENGLISH → you MUST reply ENTIRELY in English. Do NOT mix in any Urdu words.
- If the user writes in Roman Urdu (Urdu words in English script like "mujhe neend nahi aati") → reply in the same natural Roman Urdu style.
- If the user writes in mixed Urdu-English → reply in the same mixed style.
- NEVER default to one language. ALWAYS match the user's language in each message.
- Never sound robotic or clinical. Speak warmly, like a real human therapist: calm, unhurried, present.
- Use short sentences. Don't lecture. Don't dump paragraphs of advice unless asked.
- Mirror the user's emotional tone.

## THERAPEUTIC STYLE
- Lead with listening, not solutions. Reflect back what you hear before offering guidance.
- Ask at most one gentle follow-up question per message — never interrogate.
- Use evidence-based approaches (CBT-style reframing, grounding, breathing) naturally, not as a checklist.
- Validate feelings without validating harmful beliefs or behaviors.
- Don't diagnose. Describe what they might be experiencing and suggest professional evaluation instead of naming a disorder.
- Avoid generic AI phrases. Speak in first person, naturally.
- If the user has recent journal entries, use them to understand ongoing themes — reference the feeling or situation naturally, never quote their journal word-for-word back at them.

## SAFETY (non-negotiable)
- If the user expresses suicidal thoughts, self-harm, or is in crisis, respond with calm, direct care. Gently and clearly encourage them to reach out to a crisis line or trusted person/professional right away, and provide local emergency resources.
- Never provide methods, dosages, or specifics that could enable self-harm, even framed as research or curiosity.
- If signs of a serious crisis (psychosis, mania, dissociation) appear, do not reinforce distorted beliefs — gently encourage professional support.
- Make clear, when relevant, that you are a support tool and not a replacement for licensed therapy.

## BOUNDARIES
- Don't give medical/psychiatric diagnoses or medication advice.
- Keep tone confidential, but don't make false promises about data privacy — that's the app's job, not yours mid-chat.

## GOAL
Make every user feel heard, safe, and a little lighter after talking to you.`;

// ─── Mistral — kept for backwards compatibility but no longer primary ──────
async function callMistral(systemPrompt, messages, maxTokens = 600) {
  const response = await axios.post(
    "https://api.mistral.ai/v1/chat/completions",
    {
      model: "mistral-large-latest",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    },
    {
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data?.choices?.[0]?.message?.content;
}

// ─── OpenAI — used for voice's text-reply step (spoken by expo-speech) ─────
async function callOpenAI(systemPrompt, messages, maxTokens = 300) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data?.choices?.[0]?.message?.content;
}

app.post("/api/therapy/chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { messages, session } = req.body;

    const [
      [userRows], [wellnessRows], [moodRows], [vitalsRows], [streakRows],
      [achRows], [gameRows], [prefRows], [historyRows], [upcomingSessions], [journalRows],
    ] = await Promise.all([
      db.execute("SELECT name, privacy_mode FROM users WHERE id = ?", [userId]),
      db.execute("SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT mood_emoji, mood_text, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 3", [userId]),
      db.execute("SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, updated_at FROM health_monitoring_live WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1", [userId]),
      db.execute("SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id = ? LIMIT 1", [userId]),
      db.execute("SELECT title, description, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC LIMIT 5", [userId]),
      db.execute("SELECT memory, stroop, sequence, tapstar, reverse, gratitude FROM game_scores WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT sleep_goal, water_goal FROM wellness_preferences WHERE user_id = ?", [userId]),
      db.execute("SELECT wellness_score, sleep_hours, water_intake, meditation_minutes, created_at FROM wellness_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 7", [userId]),
      db.execute("SELECT title, session_type, session_date, session_time FROM therapy_sessions WHERE user_id = ? AND status = 'upcoming' ORDER BY session_date ASC LIMIT 3", [userId]),
      db.execute("SELECT entry_text, mood_emoji, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", [userId]),
    ]);

    const user = userRows[0] || null;
    const isPrivate = !!user?.privacy_mode;
    const name = isPrivate ? "friend" : (user?.name?.split(" ")[0] || "friend");

    const wellness = wellnessRows[0] || null;
    const vitals = vitalsRows[0] || null;
    const streak = streakRows[0] || null;
    const games = gameRows[0] || null;
    const prefs = prefRows[0] || null;

    let dataBlock;

    if (isPrivate) {
      dataBlock = `
PRIVACY MODE IS ON. Rules:
- Do NOT reveal any specific numbers, scores, vitals, mood labels, or personal health data even if directly asked.
- If asked about their data, kindly explain that Privacy Mode is currently on, so you cannot share those specific details. Tell them they can check the Dashboard directly or turn Privacy Mode off in Settings.
- You may still offer emotional support, general wellness advice, and coping techniques.
- You may acknowledge general themes without citing numbers.`;
    } else {
      const moodHistory = moodRows.length > 0
        ? moodRows.map(m => `${m.mood_emoji} ${m.mood_text} (${new Date(m.created_at).toLocaleDateString()})`).join(", ")
        : "No recent mood logs";

      const gameEntries = games
        ? Object.entries(games).filter(([, v]) => v !== null && v !== undefined && v !== 0)
        : [];
      const gamesSummary = gameEntries.length
        ? gameEntries.map(([k, v]) => `${k}: ${v}`).join(", ")
        : "No games played today";

      const achSummary = achRows.length
        ? achRows.map(a => `"${a.title}" - ${a.description}`).join("; ")
        : "None unlocked yet";

      const avgScore = historyRows.length > 0
        ? Math.round(historyRows.reduce((s, r) => s + (r.wellness_score || 0), 0) / historyRows.length)
        : null;

      const sessionsInfo = upcomingSessions.length > 0
        ? upcomingSessions.map(s => `"${s.title}" (${s.session_type}, ${s.session_date} at ${s.session_time})`).join(", ")
        : "No upcoming sessions";

      let vitalsAnalysis = "No recent vitals available";
      if (vitals) {
        const hr = vitals.heart_rate_bpm;
        const spo2 = vitals.blood_oxygen_percent;
        const temp = vitals.temperature_fahrenheit;
        const hrStatus = hr > 100 ? "elevated (concerning)" : hr < 60 ? "low" : "normal";
        const spo2Status = spo2 < 94 ? "dangerously low" : spo2 < 96 ? "slightly low" : "normal";
       const tempStatus = temp > 101 ? "fever detected" : temp > 99 ? "slightly elevated" : "normal";
        vitalsAnalysis = `HR: ${hr} bpm (${hrStatus}), SpO₂: ${spo2}% (${spo2Status}), Temp: ${temp}°F (${tempStatus}), Movement: ${vitals.movement || "unknown"}`;
      }

      // Journal entries — always included for non-private users, not gated behind heart rate.
      const journalSummary = journalRows.length > 0
        ? journalRows.map(j => `"${j.entry_text.slice(0, 120)}${j.entry_text.length > 120 ? "…" : ""}" (${new Date(j.created_at).toLocaleDateString()})`).join(" | ")
        : "No journal entries yet";

      dataBlock = `

REAL-TIME USER DATA (use this to answer questions directly and naturally):

MOOD HISTORY: ${moodHistory}

VITALS (from sensor): ${vitalsAnalysis}
Last recorded: ${vitals ? new Date(vitals.updated_at).toLocaleString() : "N/A"}

TODAY'S WELLNESS LOG:
- Sleep: ${wellness?.sleep_hours ?? "Not logged"}h (personal goal: ${prefs?.sleep_goal ?? "8h"})
- Water: ${wellness?.water_intake ?? "Not logged"}L (personal goal: ${prefs?.water_goal ?? "2L"})
- Meals logged: ${wellness?.meals_count ?? "Not logged"}
- Meditation: ${wellness?.meditation_minutes ?? "Not logged"} minutes
- Stress: ${wellness?.stress_level ?? "Not logged"}/10
- Anxiety: ${wellness?.anxiety_level ?? "Not logged"}/10
- Energy: ${wellness?.energy_level ?? "Not logged"}/10
- Wellness Score Today: ${wellness?.score ?? "Not logged"}/100
${wellness?.score ? `  → Score interpretation: ${wellness.score >= 80 ? "Excellent" : wellness.score >= 60 ? "Good" : wellness.score >= 40 ? "Fair — room to improve" : "Low — needs attention"}` : ""}

STREAKS:
- Current streak: ${streak?.current_streak ?? 0} days
- Longest ever: ${streak?.longest_streak ?? 0} days

BRAIN GAMES TODAY: ${gamesSummary}

RECENT ACHIEVEMENTS: ${achSummary}

7-DAY WELLNESS TREND: ${avgScore !== null ? `Average score ${avgScore}/100` : "Not enough data yet"}

UPCOMING SESSIONS: ${sessionsInfo}

RECENT JOURNAL ENTRIES (use for emotional continuity, don't quote verbatim):
${journalSummary}`;
    }

    let alertContext = "";
    if (!isPrivate && wellness) {
      if ((wellness.stress_level || 0) >= 7) alertContext += "\n⚠️ PRIORITY: High stress detected. Prioritize grounding/breathing.";
      if ((wellness.anxiety_level || 0) >= 7) alertContext += "\n⚠️ PRIORITY: High anxiety. Start with validation and calming.";
      if ((wellness.sleep_hours || 8) < 5) alertContext += "\n⚠️ PRIORITY: Very low sleep. Check in on their energy and mood.";
    }
    if (!isPrivate && vitals && vitals.heart_rate_bpm > 100) {
      alertContext += "\n⚠️ PRIORITY: Elevated heart rate. Guide breathing immediately.";
    }

    const systemPrompt = `${BASE_PERSONA_PROMPT}

USER: ${name}
${dataBlock}
${session ? `ACTIVE SESSION: "${session.title}" (${session.session_type} session)` : "CONTEXT: General wellness chat"}
${alertContext}

DATA RULES:
- When the user asks about their data, answer directly using the real data above. Never say "I don't have access to your data."
- If Privacy Mode is on, never reveal specific numbers even if asked persistently, but stay warm.
- If stress or anxiety >= 7, offer a grounding or breathing technique.
- If heart rate is elevated, guide a 4-7-8 breathing exercise.
- Reference upcoming sessions naturally if relevant.
- Keep responses concise: 2-4 sentences unless asked for more.`;

    const reply = await callOpenAI(systemPrompt, messages, 600);
    if (!reply) return res.status(500).json({ message: "Sera is unavailable right now. Please try again." });
    res.json({ reply });
  } catch (error) {
    console.log("Chat therapy error:", error?.message || error);
    if (!res.headersSent) res.status(500).json({ message: "Sera is unavailable right now. Please try again." });
  }
});

// =====================
// VOICE THERAPY CHAT (Sera) — text-reply step for expo-speech to voice aloud
// Uses OpenAI chat completions (not Groq — that crashed since groq was removed)
// =====================
app.post("/api/therapy/voice-chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { messages, session } = req.body;

    const [
      [userRows], [wellnessRows], [moodRows], [vitalsRows], [streakRows], [prefRows],
    ] = await Promise.all([
      db.execute("SELECT name, privacy_mode FROM users WHERE id = ?", [userId]),
      db.execute("SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT mood_emoji, mood_text FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]),
      db.execute("SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement FROM health_monitoring_live WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1", [userId]),
      db.execute("SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id = ? LIMIT 1", [userId]),
      db.execute("SELECT sleep_goal, water_goal FROM wellness_preferences WHERE user_id = ?", [userId]),
    ]);

    const user = userRows[0] || null;
    const isPrivate = !!user?.privacy_mode;
    const name = isPrivate ? "friend" : (user?.name?.split(" ")[0] || "friend");
    const wellness = wellnessRows[0] || null;
    const vitals = vitalsRows[0] || null;
    const mood = moodRows[0] || null;
    const streak = streakRows[0] || null;
    const prefs = prefRows[0] || null;

    let dataBlock = isPrivate
      ? "Privacy Mode is ON — do not reference any specific health numbers or labels."
      : `Mood: ${mood ? `${mood.mood_emoji} ${mood.mood_text}` : "Not logged"} | Sleep: ${wellness?.sleep_hours ?? "?"}h/${prefs?.sleep_goal ?? "8h"} goal | Water: ${wellness?.water_intake ?? "?"}L/${prefs?.water_goal ?? "2L"} goal | Stress: ${wellness?.stress_level ?? "?"}/10 | Anxiety: ${wellness?.anxiety_level ?? "?"}/10 | Energy: ${wellness?.energy_level ?? "?"}/10 | HR: ${vitals?.heart_rate_bpm ?? "?"}bpm | SpO₂: ${vitals?.blood_oxygen_percent ?? "?"}% | Temp: ${vitals?.temperature_fahrenheit ?? "?"}°F | Streak: ${streak?.current_streak ?? 0} days`;

    let alertContext = "";
    if (!isPrivate && wellness && (wellness.stress_level || 0) >= 7) {
      alertContext += "\n⚠️ PRIORITY: High stress. Use grounding immediately.";
    }
    if (!isPrivate && vitals && vitals.heart_rate_bpm > 100) {
      alertContext += "\n⚠️ PRIORITY: Elevated heart rate. Guide 4-7-8 breathing.";
    }

    const systemPrompt = `${BASE_PERSONA_PROMPT}

This is a VOICE conversation — spoken aloud by text-to-speech. Follow these voice-specific rules on top of everything above:
1. Speak in SHORT, calm sentences — max 2-3 sentences per response.
2. Use natural breathing cues when appropriate: "breathe in slowly... and out."
3. If HR is elevated, guide 4-7-8 breathing immediately.
4. If stress/anxiety is high, use grounding: "Name 5 things you can see right now."
5. NO markdown, NO bullet points, NO lists — pure natural spoken language only.
6. Speak as if sitting right beside the person.
7. End with one gentle question or short instruction.

USER: ${name}
DATA: ${dataBlock}
${session ? `SESSION: "${session.title}"` : "GENERAL voice session"}
${alertContext}`;

    const reply = await callOpenAI(systemPrompt, messages, 300);
    if (!reply) return res.status(500).json({ message: "Sera is unavailable." });
    res.json({ reply });
  } catch (error) {
    console.log("Voice chat error:", error?.message || error);
    if (!res.headersSent) res.status(500).json({ message: "Sera is unavailable right now." });
  }
});

// ─── Mint ephemeral token for OpenAI Realtime API WebRTC voice sessions ────
// Returns an ephemeral key with Sera persona + user wellness data baked in.
app.post("/api/therapy/realtime-session", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { session } = req.body || {};

    // Fetch user data for the realtime session context
    const [
      [userRows], [wellnessRows], [moodRows], [vitalsRows], [streakRows], [prefRows],
    ] = await Promise.all([
      db.execute("SELECT name, privacy_mode FROM users WHERE id = ?", [userId]),
      db.execute("SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT mood_emoji, mood_text FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]),
      db.execute("SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement FROM health_monitoring_live WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1", [userId]),
      db.execute("SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id = ? LIMIT 1", [userId]),
      db.execute("SELECT sleep_goal, water_goal FROM wellness_preferences WHERE user_id = ?", [userId]),
    ]);

    const user = userRows[0] || null;
    const isPrivate = !!user?.privacy_mode;
    const name = isPrivate ? "friend" : (user?.name?.split(" ")[0] || "friend");
    const wellness = wellnessRows[0] || null;
    const vitals = vitalsRows[0] || null;
    const mood = moodRows[0] || null;
    const streak = streakRows[0] || null;
    const prefs = prefRows[0] || null;

    let dataBlock = isPrivate
      ? "Privacy Mode is ON — do not reference any specific health numbers or labels."
      : `Mood: ${mood ? `${mood.mood_emoji} ${mood.mood_text}` : "Not logged"} | Sleep: ${wellness?.sleep_hours ?? "?"}h/${prefs?.sleep_goal ?? "8h"} goal | Water: ${wellness?.water_intake ?? "?"}L/${prefs?.water_goal ?? "2L"} goal | Stress: ${wellness?.stress_level ?? "?"}/10 | Anxiety: ${wellness?.anxiety_level ?? "?"}/10 | Energy: ${wellness?.energy_level ?? "?"}/10 | HR: ${vitals?.heart_rate_bpm ?? "?"}bpm | SpO₂: ${vitals?.blood_oxygen_percent ?? "?"}% | Temp: ${vitals?.temperature_fahrenheit ?? "?"}°F | Streak: ${streak?.current_streak ?? 0} days`;

    let alertContext = "";
    if (!isPrivate && wellness && (wellness.stress_level || 0) >= 7) {
      alertContext += "\n⚠️ PRIORITY: High stress. Use grounding immediately.";
    }
    if (!isPrivate && vitals && vitals.heart_rate_bpm > 100) {
      alertContext += "\n⚠️ PRIORITY: Elevated heart rate. Guide 4-7-8 breathing.";
    }

    const realtimeInstructions = `${BASE_PERSONA_PROMPT}

This is a REAL-TIME VOICE conversation. Follow these voice-specific rules on top of everything above:
1. Speak in SHORT, calm sentences — max 2-3 sentences per response.
2. LANGUAGE: Detect the user's spoken language automatically. If they speak Urdu, respond in Urdu. If they speak English, respond in English. Never mix languages unless the user does.
3. Use natural breathing cues when appropriate: "breathe in slowly... and out."
4. If HR is elevated, guide 4-7-8 breathing immediately.
5. If stress/anxiety is high, use grounding: "Name 5 things you can see right now."
6. NO markdown, NO bullet points, NO lists — pure natural spoken language only.
7. Speak as if sitting right beside the person.
8. End with one gentle question or short instruction.

USER: ${name}
DATA: ${dataBlock}
${session ? `SESSION: "${session.title}"` : "GENERAL voice session"}
${alertContext}`;

    // Request ephemeral key from OpenAI Realtime API
   // Request ephemeral key from OpenAI Realtime API (GA schema)
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-realtime", // was: gpt-4o-mini-realtime-preview (legacy preview name)
            instructions: realtimeInstructions,
            audio: {
              input: {
                format: { type: "audio/pcm", rate: 24000 },
                transcription: {
                  model: "gpt-4o-mini-transcribe",
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 500,
                },
              },
              output: {
                format: { type: "audio/pcm", rate: 24000 },
                voice: "verse",
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("Realtime session error:", errBody);
      return res.status(500).json({ message: "Failed to start voice session" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Realtime session error:", err?.response?.data || err?.message || err);
    res.status(500).json({ message: "Failed to start voice session" });
  }
});

// =====================
// MOOD TRENDS (for charts)
// =====================
app.get("/mood-trends", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT DATE(created_at) as date, mood_text, mood_emoji,
       COUNT(*) as count
       FROM moods WHERE user_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at), mood_text, mood_emoji
       ORDER BY date DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch mood trends" });
  }
});

// =====================
// CRISIS RESOURCES
// =====================
app.get("/crisis-resources", (req, res) => {
  res.json({
    resources: [
      { name: "Pakistan Crisis Helpline", number: "0311-7786264", available: "24/7" },
      { name: "Umang Helpline Pakistan", number: "0311-7786264", available: "24/7" },
      { name: "Rozan Counseling", number: "051-2890505", available: "Mon-Fri 9am-5pm" },
      { name: "Emergency Services Pakistan", number: "115", available: "24/7" },
      { name: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres/", available: "24/7" },
    ],
    message: "You are not alone. Help is available right now.",
  });
});

const nodemailer = require("nodemailer");
const crypto = require("crypto");

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOTPEmail(toEmail, otp, name = "there") {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#050f09; padding:32px; border-radius:16px; color:#fff; max-width:420px; margin:0 auto;">
      <h2 style="color:#4ade80; margin-bottom:4px;">Care Plus</h2>
      <p style="color:rgba(255,255,255,0.7); font-size:14px;">Password Reset Request</p>
      <p style="margin-top:24px; font-size:14px; color:rgba(255,255,255,0.85);">
        Hi ${name}, use the code below to reset your password. This code expires in 10 minutes.
      </p>
      <div style="background:#004927; border:1px solid rgba(74,222,128,0.3); border-radius:12px; padding:18px; text-align:center; margin:24px 0;">
        <span style="font-size:32px; font-weight:600; letter-spacing:8px; color:#4ade80;">${otp}</span>
      </div>
      <p style="font-size:12px; color:rgba(255,255,255,0.4);">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await mailer.sendMail({
    from: `"Care Plus" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your Care Plus password reset code",
    html,
  });
}

async function sendEmergencyEmail(
  toEmail,
  userName,
  latitude,
  phone,
  longitude,
  message = "I need your help. Please contact me as soon as possible."
) {
  let relationMessage = `${userName} needs your immediate help.`;
  const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#050f09; padding:32px; border-radius:16px; color:#fff; max-width:420px; margin:0 auto;">
      <h2 style="color:#4ade80; margin-bottom:4px;">Care Plus</h2>
      <p style="color:rgba(255,255,255,0.7); font-size:14px;">Emergency Alert</p>

      <div style="background:#7f1d1d;border:1px solid #ef4444;padding:18px;border-radius:12px;margin:24px 0;">
        <div style="font-size:20px;font-weight:bold;color:#ffffff;">
          ${relationMessage}
        </div>
        <p style="margin-top:10px;font-size:14px;color:#f3f4f6;line-height:1.6;">
          You are registered as <strong>favourite contact</strong> in
          <strong>${userName}'s</strong> Care Plus emergency contacts.
          They have activated <strong>Panic Mode</strong> and are requesting immediate assistance.
        </p>
      </div>

      <div style="background:#004927; border:1px solid rgba(74,222,128,0.3); border-radius:12px; padding:18px; text-align:center; margin:24px 0;">
        <span style="font-size:13px; color:rgba(255,255,255,0.6); display:block; margin-bottom:10px;">
          Call immediately
        </span>
        <a href="tel:${phone}" style="display:inline-block;color:#4ade80;font-size:26px;font-weight:600;text-decoration:none;">
          📞 ${phone}
        </a>
      </div>

      <p style="font-size:14px; color:rgba(255,255,255,0.85); margin-bottom:24px;">
        "${message}"
      </p>

      <div style="margin:25px 0;text-align:center;">
        <a href="${locationUrl}"
           style="display:inline-block;background:#4ade80;color:#050f09;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;">
          📍 View ${userName}'s Live Location
        </a>
      </div>

      <p style="font-size:12px; color:rgba(255,255,255,0.4);">
        Lat: ${latitude ?? "unavailable"} · Long: ${longitude ?? "unavailable"}
      </p>

      <p style="font-size:12px; color:rgba(255,255,255,0.4); margin-top:16px;">
        This alert was sent automatically by Care Plus. If this seems serious, please also consider contacting local emergency services.
      </p>
    </div>
  `;

  await mailer.sendMail({
    from: `"Care Plus" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `🚨 ${userName} needs your help!`,
    html,
  });
}

app.post("/send-emergency-email", authMiddleware, async (req, res) => {
  try {
    const { email, latitude, longitude } = req.body;
    const [rows] = await db.execute(
      "SELECT name, phone_number FROM users WHERE id=?",
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    const user = rows[0];
    await sendEmergencyEmail(email, user.name, latitude, user.phone_number, longitude);

    res.json({ message: "Emergency email sent." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send email." });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [users] = await db.execute("SELECT id, name FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute("DELETE FROM password_resets WHERE user_id = ?", [user.id]);
    await db.execute(
      "INSERT INTO password_resets (user_id, otp, expires_at, verified) VALUES (?, ?, ?, 0)",
      [user.id, otp, expiresAt]
    );

    await sendOTPEmail(email, otp, user.name);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const [users] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }
    const userId = users[0].id;

    const [resets] = await db.execute(
      "SELECT * FROM password_resets WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );

    if (resets.length === 0) {
      return res.status(400).json({ message: "No OTP request found. Please request a new one." });
    }

    const resetRow = resets[0];

    if (new Date(resetRow.expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (resetRow.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    await db.execute("UPDATE password_resets SET verified = 1 WHERE id = ?", [resetRow.id]);

    const resetToken = jwt.sign(
      { id: userId, purpose: "password_reset" },
      "secret123",
      { expiresIn: "15m" }
    );

    res.json({ message: "OTP verified successfully", resetToken });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
});

app.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(resetToken, "secret123");
    } catch {
      return res.status(401).json({ message: "Reset session expired. Please start again." });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(401).json({ message: "Invalid reset session" });
    }

    const userId = decoded.id;

    const [resets] = await db.execute(
      "SELECT * FROM password_resets WHERE user_id = ? AND verified = 1 ORDER BY id DESC LIMIT 1",
      [userId]
    );
    if (resets.length === 0) {
      return res.status(401).json({ message: "OTP verification required before resetting password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    await db.execute("DELETE FROM password_resets WHERE user_id = ?", [userId]);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
});

const PDFDocument = require("pdfkit");

// ─── Date formatting helpers ────────────────────────────────────────────────
// MySQL DATE/TIMESTAMP columns come back as JS Date objects. Dropping them
// straight into a template literal calls .toString() implicitly, producing
// "Thu Jul 09 2026 00:00:00 GMT+0500 (Pakistan Standard Time)". These format
// them properly instead.
function formatDate(d) {
  if (!d) return "N/A";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "N/A";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Data fetch — every table, in priority order ────────────────────────────
async function getFullUserData(userId) {
  const [
    [userRows],
    [vitalsLiveRows],      // health_monitoring_live — Latest
    [wellnessLogRows],     // wellness_logs
    [moodRows],            // moods
    [vitalsHistoryRows],   // health_monitoring — Every Hour
    [streakRows],          // wellness_streaks
    [achRows],             // achievements
    [journalRows],         // journal_entries
    [chatLogRows],         // therapy_chat_logs — Summary
    [gameRows],            // game_scores — Highest
  ] = await Promise.all([
    db.execute("SELECT name, email, phone_number, created_at FROM users WHERE id = ?", [userId]),
    db.execute("SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, updated_at FROM health_monitoring_live WHERE user_id = ?", [userId]),
    db.execute("SELECT log_date, sleep_hours, water_intake, meals_count, meditation_minutes, stress_level, anxiety_level, energy_level, score FROM wellness_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 60", [userId]),
    db.execute("SELECT mood_emoji, mood_text, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 90", [userId]),
    db.execute("SELECT heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, recorded_at FROM health_monitoring WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 150", [userId]),
    db.execute("SELECT current_streak, longest_streak, last_active_date FROM wellness_streaks WHERE user_id = ?", [userId]),
    db.execute("SELECT title, description, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC", [userId]),
    db.execute("SELECT entry_text, mood_emoji, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 60", [userId]),
    db.execute("SELECT session_id, message_count, summary, logged_at FROM therapy_chat_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 40", [userId]),
    db.execute("SELECT memory, stroop, sequence, tapstar, reverse, gratitude, log_date FROM game_scores WHERE user_id = ? ORDER BY log_date DESC LIMIT 30", [userId]),
  ]);

  return {
    user: userRows[0] || { name: "User", email: "", phone_number: "" },
    vitalsLive: vitalsLiveRows[0] || null,
    wellnessLogs: wellnessLogRows,
    moods: moodRows,
    vitalsHistory: vitalsHistoryRows,
    streaks: streakRows[0] || { current_streak: 0, longest_streak: 0, last_active_date: null },
    achievements: achRows,
    journal: journalRows,
    chatLogs: chatLogRows,
    games: gameRows,
  };
}

// ─── PDF builder ─────────────────────────────────────────────────────────────
const CATEGORY_ORDER = [
  "vitals_latest", "wellness", "mood", "vitals_history",
  "streaks", "achievements", "journal", "therapy_chat", "games"
];

// App theme greens — every section header cycles through these instead of
// the previous red/blue/yellow/purple scheme.
const THEME_GREENS = ["#050f09", "#050f09", "#050f09", "#050f09", "#050f09", "#050f09"];

function buildHealthReportPDF(data, categories) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const PAGE_BOTTOM = doc.page.height - doc.page.margins.bottom;
    const checkPageBreak = (needed) => {
      if (doc.y + needed > PAGE_BOTTOM) doc.addPage();
    };

    let colorIdx = 0;
    const nextThemeColor = () => THEME_GREENS[colorIdx++ % THEME_GREENS.length];

    const sectionHeader = (title, color) => {
      checkPageBreak(46);
      doc.moveDown(1);
      const y = doc.y;
      doc.rect(40, y, 3, 14).fill(color);
      doc.fillColor(color).fontSize(13).font("Helvetica-Bold").text(title, 50, y - 1);
      doc.y = y + 18;
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#d7ecdf").lineWidth(1).stroke();
      doc.moveDown(0.5);
      doc.fillColor("#111111").font("Helvetica").fontSize(9);
    };

    const emptyNote = (text) => {
      doc.fillColor("#999999").fontSize(9).font("Helvetica-Oblique").text(text);
      doc.fillColor("#111111").font("Helvetica");
      doc.moveDown(0.3);
    };

    const drawTable = (headers, rows, colWidths, rowHeight = 20) => {
      const totalWidth = colWidths.reduce((a, b) => a + b, 0);
      const startX = 40;

      checkPageBreak(rowHeight + 4);
      let y = doc.y;
      doc.rect(startX, y, totalWidth, rowHeight).fill("#004927");
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
      let x = startX;
      headers.forEach((h, i) => {
        doc.text(h, x + 6, y + 6, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });
      doc.y = y + rowHeight;

      doc.font("Helvetica").fontSize(8.5);
      rows.forEach((row, ri) => {
        checkPageBreak(rowHeight);
        y = doc.y;
        if (ri % 2 === 0) doc.rect(startX, y, totalWidth, rowHeight).fill("#eefbf3");
        doc.rect(startX, y, totalWidth, rowHeight).strokeColor("#d7ecdf").lineWidth(0.5).stroke();
        doc.fillColor("#111111");
        let cx = startX;
        row.forEach((cell, ci) => {
          doc.text(String(cell ?? "-"), cx + 6, y + 6, { width: colWidths[ci] - 8 });
          cx += colWidths[ci];
        });
        doc.y = y + rowHeight;
      });
      doc.moveDown(0.6);
    };

    const drawStatCards = (stats) => {
      checkPageBreak(72);
      const startX = 40;
      const gap = 10;
      const cardWidth = (515 - gap * (stats.length - 1)) / stats.length;
      const y = doc.y;
      stats.forEach((s, i) => {
        const x = startX + i * (cardWidth + gap);
        doc.roundedRect(x, y, cardWidth, 62, 6).fillAndStroke("#0d2718", "#1f4d34");
        doc.fillColor(s.color || "#4ade80").font("Helvetica-Bold").fontSize(15)
          .text(s.value, x, y + 12, { width: cardWidth, align: "center" });
        doc.fillColor("#cfcfcf").font("Helvetica").fontSize(7.5)
          .text(s.label, x, y + 34, { width: cardWidth, align: "center" });
        if (s.sub) {
          doc.fillColor("#888888").fontSize(6.5)
            .text(s.sub, x, y + 46, { width: cardWidth, align: "center" });
        }
      });
      doc.y = y + 74;
    };

    // ── Header banner — matches app's dark green + #4ade80 accent ──
    doc.rect(0, 0, doc.page.width, 90).fill("#050f09");
    doc.fillColor("#4ade80").fontSize(24).font("Helvetica-Bold").text("Care Plus", 40, 25);
    doc.fillColor("#ffffff").fontSize(11).font("Helvetica").text("Personal Health Report", 40, 55);
    doc.fillColor("#000000");
    doc.y = 110;

    doc.fontSize(10).fillColor("#333333").font("Helvetica");
    doc.text(`Name: ${data.user.name || "N/A"}`);
    doc.text(`Email: ${data.user.email || "N/A"}`);
    doc.text(`Phone: ${data.user.phone_number || "N/A"}`);
    doc.text(`Report generated: ${formatDateTime(new Date())}`);
    doc.moveDown(1);

    for (const key of CATEGORY_ORDER) {
      if (!categories.includes(key)) continue;

      switch (key) {
        case "vitals_latest": {
          sectionHeader("Vital Signs — Latest Reading", nextThemeColor());
          if (!data.vitalsLive) {
            emptyNote("No live vitals recorded yet.");
            break;
          }
          const v = data.vitalsLive;
          drawStatCards([
            { label: "Heart Rate", value: `${v.heart_rate_bpm ?? "-"}`, sub: "bpm", color: "#4ade80" },
            { label: "SpO2", value: `${v.blood_oxygen_percent ?? "-"}%`, sub: "oxygen", color: "#34d399" },
            { label: "Temperature", value: `${v.temperature_fahrenheit ?? "-"}°F`, sub: "body temp", color: "#6ee7b7" },
            { label: "Movement", value: `${v.movement ?? "-"}`, sub: "status", color: "#4ade80" },
          ]);
          doc.fillColor("#666666").fontSize(8).font("Helvetica-Oblique")
            .text(`Last updated: ${formatDateTime(v.updated_at)}`);
          doc.fillColor("#111111").font("Helvetica");
          doc.moveDown(0.5);
          break;
        }

        case "wellness": {
          sectionHeader("Wellness Logs (Daily)", nextThemeColor());
          if (!data.wellnessLogs.length) { emptyNote("No wellness logs recorded yet."); break; }
          drawTable(
            ["Date", "Sleep", "Water", "Meals", "Meditation", "Stress", "Anxiety", "Energy", "Score"],
            data.wellnessLogs.map(r => [
              formatDate(r.log_date),
              r.sleep_hours != null ? `${r.sleep_hours}h` : "-",
              r.water_intake != null ? `${r.water_intake}L` : "-",
              r.meals_count ?? "-",
              r.meditation_minutes != null ? `${r.meditation_minutes}m` : "-",
              r.stress_level ?? "-",
              r.anxiety_level ?? "-",
              r.energy_level ?? "-",
              r.score != null ? `${r.score}/100` : "-",
            ]),
            [65, 45, 45, 40, 65, 45, 50, 45, 55]
          );
          break;
        }

        case "mood": {
          sectionHeader("Mood History", nextThemeColor());
          if (!data.moods.length) { emptyNote("No mood entries recorded yet."); break; }
          drawTable(
            ["Date & Time", "Mood"],
            data.moods.map(m => [formatDateTime(m.created_at), m.mood_emoji ?? "-"]),
            [200, 315]
          );
          break;
        }

        case "vitals_history": {
          sectionHeader("Vitals History (Hourly)", nextThemeColor());
          if (!data.vitalsHistory.length) { emptyNote("No hourly vitals history yet."); break; }
          drawTable(
            ["Date & Time", "HR (bpm)", "SpO2 (%)", "Temp (°F)", "Movement"],
            data.vitalsHistory.map(v => [
              formatDateTime(v.recorded_at),
              v.heart_rate_bpm ?? "-",
              v.blood_oxygen_percent ?? "-",
              v.temperature_fahrenheit ?? "-",
              v.movement ?? "-",
            ]),
            [155, 85, 85, 85, 105]
          );
          break;
        }

        case "streaks": {
          sectionHeader("Wellness Streaks", nextThemeColor());
          drawStatCards([
            { label: "Current Streak", value: `${data.streaks.current_streak ?? 0}`, sub: "days", color: "#4ade80" },
            { label: "Longest Streak", value: `${data.streaks.longest_streak ?? 0}`, sub: "days", color: "#34d399" },
            { label: "Last Active", value: formatDate(data.streaks.last_active_date), sub: "", color: "#6ee7b7" },
          ]);
          break;
        }

        case "achievements": {
          sectionHeader("Achievements", nextThemeColor());
          if (!data.achievements.length) { emptyNote("No achievements unlocked yet."); break; }
          drawTable(
            ["Unlocked", "Title", "Description"],
            data.achievements.map(a => [formatDate(a.unlocked_at), a.title, a.description]),
            [90, 130, 295]
          );
          break;
        }

        case "journal": {
          sectionHeader("Journal Entries", nextThemeColor());
          if (!data.journal.length) { emptyNote("No journal entries yet."); break; }
          data.journal.forEach((j) => {
            checkPageBreak(50);
            doc.fillColor("#555555").fontSize(8).font("Helvetica-Bold")
              .text(`${formatDateTime(j.created_at)}${j.mood_emoji ? "  " + j.mood_emoji : ""}`);
            doc.fillColor("#111111").fontSize(9).font("Helvetica")
              .text(j.entry_text, { width: 515 });
            doc.moveDown(0.6);
          });
          break;
        }

        case "therapy_chat": {
          sectionHeader("Therapy Chat Summaries", nextThemeColor());
          if (!data.chatLogs.length) { emptyNote("No chat sessions recorded yet."); break; }
          data.chatLogs.forEach((c) => {
            checkPageBreak(50);
            doc.fillColor("#555555").fontSize(8).font("Helvetica-Bold")
              .text(`${formatDateTime(c.created_at)}  ·  ${c.message_count ?? 0} messages`);
            doc.fillColor("#111111").fontSize(9).font("Helvetica")
              .text(c.summary || "No summary available.", { width: 515 });
            doc.moveDown(0.6);
          });
          break;
        }

        case "games": {
          sectionHeader("Brain Games — Highest Scores", nextThemeColor());
          if (!data.games.length) { emptyNote("No games played yet."); break; }
          drawTable(
            ["Date", "Memory", "Stroop", "Sequence", "TapStar", "Reverse", "Gratitude"],
            data.games.map(g => [
              formatDate(g.log_date),
              g.memory ?? "-", g.stroop ?? "-", g.sequence ?? "-",
              g.tapstar ?? "-", g.reverse ?? "-", g.gratitude ?? "-",
            ]),
            [90, 70, 70, 75, 70, 70, 70]
          );
          break;
        }
      }
    }

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor("#aaa").text(
      "This report was generated automatically by Care Plus and is intended for personal use or to be shared with a healthcare provider.",
      { align: "center" }
    );

    doc.end();
  });
}

app.post("/health-report/pdf-base64", authMiddleware, async (req, res) => {
  try {
    const categories = req.body.categories && req.body.categories.length
      ? req.body.categories
      : ["vitals_latest", "wellness", "mood", "vitals_history", "streaks", "achievements", "journal", "therapy_chat", "games"];

    const data = await getFullUserData(req.userId);
    const pdfBuffer = await buildHealthReportPDF(data, categories);

    res.json({ base64: pdfBuffer.toString("base64") });
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

app.post("/health-report/email", authMiddleware, async (req, res) => {
  try {
    const categories = req.body.categories && req.body.categories.length
      ? req.body.categories
      : ["vitals_latest", "wellness", "mood", "vitals_history", "streaks", "achievements", "journal", "therapy_chat", "games"];

    const data = await getFullUserData(req.userId);
    const pdfBuffer = await buildHealthReportPDF(data, categories);
    const recipient = req.body.toEmail || data.user.email;

    if (!recipient) return res.status(400).json({ message: "No recipient email available" });

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#050f09; padding:32px; border-radius:16px; color:#fff; max-width:420px; margin:0 auto;">
        <h2 style="color:#4ade80; margin-bottom:4px;">Care Plus</h2>
        <p style="color:rgba(255,255,255,0.7); font-size:14px;">Your Health Report</p>
        <p style="margin-top:24px; font-size:14px; color:rgba(255,255,255,0.85);">
          Hi ${data.user.name || "there"}, your requested health report is attached as a PDF. You can share it with a doctor or keep it for your own records.
        </p>
      </div>
    `;

    await mailer.sendMail({
      from: `"Care Plus" <${process.env.GMAIL_USER}>`,
      to: recipient,
      subject: "Your Care Plus Health Report",
      html,
      attachments: [{ filename: "care-plus-health-report.pdf", content: pdfBuffer }],
    });

    res.json({ message: "Report emailed successfully" });
  } catch (err) {
    console.error("Email report error:", err);
    res.status(500).json({ message: "Failed to email report" });
  }
});

app.get("/peace/likes", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT item_id FROM likes WHERE user_id = ?",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get likes error:", err);
    res.status(500).json({ message: "Failed to fetch likes" });
  }
});

app.post("/peace/likes", authMiddleware, async (req, res) => {
  const { item_id } = req.body;
  if (!item_id) return res.status(400).json({ message: "item_id required" });
  try {
    await db.execute(
      "INSERT IGNORE INTO likes (user_id, item_id) VALUES (?, ?)",
      [req.userId, item_id]
    );
    res.json({ message: "Liked successfully" });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Failed to like" });
  }
});

app.delete("/peace/likes/:item_id", authMiddleware, async (req, res) => {
  const item_id = decodeURIComponent(req.params.item_id);
  try {
    await db.execute(
      "DELETE FROM likes WHERE user_id = ? AND item_id = ?",
      [req.userId, item_id]
    );
    res.json({ message: "Unliked successfully" });
  } catch (err) {
    console.error("Unlike error:", err);
    res.status(500).json({ message: "Failed to unlike" });
  }
});

// =====================
// JOURNAL
// =====================
app.post("/journal", authMiddleware, async (req, res) => {
  const { entry_text, mood_emoji } = req.body;
  if (!entry_text || !entry_text.trim()) {
    return res.status(400).json({ message: "entry_text is required" });
  }
  try {
    await db.execute(
      "INSERT INTO journal_entries (user_id, entry_text, mood_emoji) VALUES (?, ?, ?)",
      [req.userId, entry_text.trim(), mood_emoji || null]
    );
    res.json({ message: "Journal entry saved" });
  } catch (err) {
    console.error("Journal save error:", err);
    res.status(500).json({ message: "Failed to save journal entry" });
  }
});

app.get("/journal", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, entry_text, mood_emoji, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Journal fetch error:", err);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
});

app.delete("/journal/:id", authMiddleware, async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM journal_entries WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    res.json({ message: "Journal entry deleted" });
  } catch (err) {
    console.error("Journal delete error:", err);
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
});


// Runs at the top of every hour: freezes each user's current live reading
// into a permanent history row. Does NOT touch health_monitoring_live.
cron.schedule("0 * * * *", async () => {
  try {
    await db.execute(`
      INSERT INTO health_monitoring
        (user_id, heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, recorded_at)
      SELECT user_id, heart_rate_bpm, temperature_fahrenheit, blood_oxygen_percent, movement, NOW()
      FROM health_monitoring_live
    `);
    console.log("Hourly health snapshot saved");
  } catch (err) {
    console.error("Hourly health snapshot error:", err);
  }
});


app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});