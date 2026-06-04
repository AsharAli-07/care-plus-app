const blockedAt = require('blocked-at');
blockedAt((details) => {
  console.log('BLOCKED BY:', details.stack);
}, { threshold: 100 }); // Logs anything that blocks for more than 100ms
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cron = require("node-cron");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());
app.use(cors());

// serve static assets folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

let db;

async function initDB() {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "care-plus-app",
    });
    console.log("MYSQL CONNECTED");
  } catch (err) {
    console.error("DB CONNECTION ERROR:", err);
  }
}
initDB();

// =====================
// MULTER STORAGE
// =====================
if (!fs.existsSync("./assets/uploads")) {
  fs.mkdirSync("./assets/uploads", { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =====================
// AUTH MIDDLEWARE
// =====================
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

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
    const checkSql = "SELECT * FROM users WHERE email = ?";
    const [existingUsers] = await db.execute(checkSql, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (name, email, password, phone_number, profile_image)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute(insertSql, [name, email, hashedPassword, phone_number, defaultProfile]);
    res.json({ message: "User registered" });
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
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.execute(sql, [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, "secret123", { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        profile_image: user.profile_image,
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
  const sql = `
    SELECT id, name, email, phone_number, created_at, profile_image, privacy_mode
    FROM users
    WHERE id = ?
  `;

  try {
    const [result] = await db.execute(sql, [req.userId]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

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

        fs.unlink(oldPath, (err) => {
          if (err) console.log("Old image delete error:", err.message);
        });
      }
    }

    const sql = `
      UPDATE users
      SET name = ?, email = ?, phone_number = ?, profile_image = ?
      WHERE id = ?
    `;
    await db.execute(sql, [name, email, phone_number, newImage, req.userId]);

    res.json({
      message: "Profile updated successfully",
      profile_image: newImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// =====================
// Change Password
// =====================
app.put("/change-password", authMiddleware, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Fields required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

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

  const sql = `
    INSERT INTO moods (user_id, mood_emoji, mood_text)
    VALUES (?, ?, ?)
  `;

  try {
    await db.execute(sql, [req.userId, mood_emoji, mood_text]);
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
  const limit = parseInt(req.query.limit) || 7;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT id, mood_emoji, mood_text, created_at
    FROM moods
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const [result] = await db.execute(sql, [req.userId, limit, offset]);
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
  const sql = "DELETE FROM moods WHERE id = ? AND user_id = ?";
  try {
    await db.execute(sql, [req.params.id, req.userId]);
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
  const sql = "UPDATE users SET privacy_mode = ? WHERE id = ?";
  try {
    await db.execute(sql, [privacy_mode, req.userId]);
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
  try {
    await db.execute("DELETE FROM moods WHERE user_id = ?", [userId]);
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "Your account has been deleted successfully" });
  } catch (moodErr) {
    console.error(moodErr);
    res.status(500).json({ message: "Failed deleting account info" });
  }
});

// =========================
// GET NOTIFICATION SETTINGS
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

// =========================
// UPDATE NOTIFICATION SETTINGS
// =========================
app.put("/notification-settings", authMiddleware, async (req, res) => {
  let {
    mood_reminder,
    sleep_reminder,
    water_reminder,
    meal_reminder,
    notification_sound,
    notification_preview,
    quiet_mode,
  } = req.body;

  let finalQuietMode = quiet_mode;

  if (req.body.quiet_mode === undefined) {
    if (mood_reminder || sleep_reminder || water_reminder || meal_reminder) {
      finalQuietMode = false;
    }
  }

  let finalMood = mood_reminder;
  let finalSleep = sleep_reminder;
  let finalWater = water_reminder;
  let finalMeal = meal_reminder;
  let finalSound = notification_sound;
  let finalPreview = notification_preview;

  if (finalQuietMode) {
    finalMood = false;
    finalSleep = false;
    finalWater = false;
    finalMeal = false;
    finalSound = false;
    finalPreview = false;
  }

  const sql = `UPDATE notification_settings 
       SET mood_reminder = ?, sleep_reminder = ?, water_reminder = ?, meal_reminder = ?, 
           notification_sound = ?, notification_preview = ?, quiet_mode = ?
       WHERE user_id = ?`;

  try {
    await db.execute(sql, [
      finalMood, finalSleep, finalWater, finalMeal,
      finalSound, finalPreview, finalQuietMode, req.userId
    ]);

    res.json({
      message: "Notification settings updated",
      data: {
        mood_reminder: finalMood,
        sleep_reminder: finalSleep,
        water_reminder: finalWater,
        meal_reminder: finalMeal,
        notification_sound: finalSound,
        notification_preview: finalPreview,
        quiet_mode: finalQuietMode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

app.post("/save-token", authMiddleware, async (req, res) => {
  const { expo_token } = req.body;
  try {
    await db.execute("UPDATE users SET expo_token = ? WHERE id = ?", [expo_token, req.userId]);
    res.json({ message: "Token saved" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC", [req.userId]);
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

// =====================
// PUSH & ENGINE HELPERS
// =====================
async function sendPush(token, title, body, userId, sound = "default") {
  try {
    const checkSql = `
      SELECT id FROM notifications
      WHERE user_id = ? AND title = ? AND created_at >= NOW() - INTERVAL 55 MINUTE
      LIMIT 1
    `;
    const [result] = await db.execute(checkSql, [userId, title]);

    if (result.length > 0) return;

    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: token,
      sound: sound,
      title,
      body,
    });

    await db.execute(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [userId, title, body]
    );
  } catch (err) {
    console.log("sendPush error:", err.message);
  }
}

function isNightMode(user, hour) {
  const isNight = hour >= 22 || hour <= 6;
  return user.night_mode && isNight;
}

function canSend(user, type, currentHour) {
  if (user.quiet_mode) return false;
  if (isNightMode(user, currentHour)) return false;
  return user[type] === 1;
}

function pickQuote() {
  const quotes = [
    "You are stronger than you think 💪",
    "Small progress is still progress 🌱",
    "Stay consistent, not perfect ✨",
    "Take care of your mind today 🧠"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// =====================
// CRON SCHEDULES
// =====================
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  try {
    const sql = `
      SELECT users.id, users.expo_token, notification_settings.*, wellness_preferences.*
      FROM users
      LEFT JOIN notification_settings ON users.id = notification_settings.user_id
      LEFT JOIN wellness_preferences ON users.id = wellness_preferences.user_id
    `;
    const [users] = await db.execute(sql);

    if (!Array.isArray(users)) return;

    for (const user of users) {
      if (!user.expo_token) continue;

      // Sleep Engine
      if (hour === 22 && canSend(user, "sleep_reminder", hour)) {
        const msg = user.sleep_tracking ? `Track your sleep goal (${user.sleep_goal})` : `Sleep goal: ${user.sleep_goal || "8h"} — time to rest`;
        await sendPush(user.expo_token, "🌙 Sleep Insight", msg, user.id);
      }
      // Water Engine
      if (hour % 3 === 0 && minute === 0 && canSend(user, "water_reminder", hour)) {
        const msg = user.water_tracking ? `Log your water intake (${user.water_goal})` : `Hydration goal: ${user.water_goal || "2L"}`;
        await sendPush(user.expo_token, "💧 Hydration Insight", msg, user.id);
      }
      // Mood Engine
      if (hour === 9 && canSend(user, "mood_reminder", hour)) {
        const msg = user.mood_tracking ? "Log your mood to improve your wellness score 📊" : "How are you feeling today?";
        await sendPush(user.expo_token, "😊 Mood Check", msg, user.id);
      }
      // Meal Engine
      if (hour === 14 && canSend(user, "meal_reminder", hour)) {
        const msg = user.meal_tracking ? "Log your meal for better wellness score 🍽" : "Don’t skip your meal today";
        await sendPush(user.expo_token, "🍽 Meal Reminder", msg, user.id);
      }
      // Meditation Engine
      if (hour === 18 && canSend(user, "meditation_reminder", hour)) {
        await sendPush(user.expo_token, "🧘 Mind Reset", "Take 5 minutes for breathing & calmness", user.id);
      }
      // Journal Engine
      if (hour === 21 && canSend(user, "journal_reminder", hour)) {
        await sendPush(user.expo_token, "📔 Journal Time", "Write your thoughts — reflect your day", user.id);
      }
      // Motivation Engine
      if (hour === 10 && canSend(user, "motivation_quotes", hour)) {
        await sendPush(user.expo_token, "✨ Daily Motivation", pickQuote(), user.id);
      }
    }
  } catch (err) {
    console.log("CRON ERROR:", err);
  }
});

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
  let {
    sleep_goal, water_goal, mood_tracking, meal_tracking,
    meditation_reminder, journal_reminder, motivation_quotes, night_mode,
  } = req.body;

  if (night_mode === true) {
    meditation_reminder = false;
    journal_reminder = false;
    motivation_quotes = false;
  }

  if (meditation_reminder === true || journal_reminder === true || motivation_quotes === true) {
    night_mode = false;
  }

  const sql = `
    UPDATE wellness_preferences
    SET sleep_goal = ?, water_goal = ?, mood_tracking = ?, meal_tracking = ?,
        meditation_reminder = ?, journal_reminder = ?, motivation_quotes = ?, night_mode = ?
    WHERE user_id = ?
  `;

  try {
    await db.execute(sql, [
      sleep_goal, water_goal, mood_tracking, meal_tracking,
      meditation_reminder, journal_reminder, motivation_quotes, night_mode, req.userId
    ]);
    res.json({ message: "Preferences updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

async function checkAchievements(userId, data) {
  console.log("DEBUG: Engine started for user", userId, "with data", data);
  try {
    const [streakResult] = await db.execute("SELECT current_streak FROM wellness_streaks WHERE user_id = ?", [userId]);
    const streak = parseInt(streakResult[0]?.current_streak) || 0;
    
    const water = parseFloat(data.water) || 0;
    const sleep = parseFloat(data.sleep) || 0;
    const meditation = parseInt(data.meditation) || 0;

    console.log("DEBUG: Values - Streak:", streak, "Water:", water, "Sleep:", sleep, "Med:", meditation);

    const achievements = [
      { title: "7 Day Streak", condition: streak >= 7, desc: "Maintained wellness tracking for 7 days" },
      { title: "30 Day Master", condition: streak >= 30, desc: "Maintained wellness consistency for 30 days" },
      { title: "Hydration Hero", condition: water >= 3.0, desc: "Drank 3L of water in one day" },
      { title: "Deep Sleeper", condition: sleep >= 8, desc: "Achieved 8+ hours of sleep" },
      { title: "Zen Master", condition: meditation >= 20, desc: "Completed 20 mins of meditation" }
    ];

    for (const ach of achievements) {
      console.log("DEBUG: Checking condition for", ach.title, ":", ach.condition);
      if (ach.condition) {
        await unlockAchievement(userId, ach.title, ach.desc);
      }
    }
  } catch (err) {
    console.error("DEBUG: CRITICAL ERROR in checkAchievements:", err);
  }
}

async function unlockAchievement(userId, title, description) {
  console.log("DEBUG: Attempting to insert into DB:", title);
  try {
    // Force a simpler check
    const [existing] = await db.execute("SELECT id FROM achievements WHERE user_id = ? AND title = ?", [userId, title]);
    
    if (existing.length > 0) {
      console.log("DEBUG: Achievement already exists, skipping:", title);
      return;
    }

    await db.execute(
      "INSERT INTO achievements (user_id, title, description) VALUES (?, ?, ?)",
      [userId, title, description]
    );
    console.log("DEBUG: SQL INSERT successful for:", title);
  } catch (err) {
    console.error("DEBUG: SQL INSERT FAILED for", title, ":", err);
  }
}

// ==========================================
// DAILY QUOTE ENDPOINT (INTEGRATED FOR MYSQL)
// ==========================================
app.get('/wellness/daily-quote', authMiddleware, async (req, res) => {
  try {
    // 1. Fetch user wellness preferences from MySQL table
    const [prefsResult] = await db.execute(
      "SELECT motivation_quotes FROM wellness_preferences WHERE user_id = ?", 
      [req.userId]
    );
    
    const prefs = prefsResult[0];

    // 2. Clear out early if the setting is explicitly set to off (0)
    if (prefs && prefs.motivation_quotes === 0) {
      return res.json({ showQuote: false, text: "" });
    }

    // 3. Array of rotating quotes directly (No Author Names)
    const quotesPool = [
      "You are stronger than you think 💪",
      "Small progress is still progress 🌱",
      "Stay consistent, not perfect ✨",
      "Take care of your mind today 🧠",
      "Do the best you can until you know better 🌟",
      "Believe you can and you're halfway there 🎯",
      "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity. 🧘"
    ];

    // 4. Compute calendar day-of-year index (1 - 366) to pick the day's text cleanly
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // 5. Select quote using remainder arithmetic to roll over safely
    const selectedQuote = quotesPool[dayOfYear % quotesPool.length];

    return res.json({
      showQuote: true,
      text: selectedQuote
    });
  } catch (err) {
    console.error("Server Quote API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =====================
// WELLNESS LOGGING & PROCESSING
app.post("/wellness-log", authMiddleware, async (req, res) => {
  const {
    sleep_hours,
    water_intake,
    meals_count,
    meditation_minutes,
    stress_level,
    anxiety_level,
    energy_level,
  } = req.body;

  const user_id = req.userId;
  const log_date = new Date().toISOString().split("T")[0];

  // 1. Calculate Score Logic (Your original logic)
  let calculatedScore = 0;

  const sleep = parseFloat(sleep_hours) || 0;
  if (sleep >= 7) calculatedScore += 25;
  else if (sleep >= 5) calculatedScore += 15;

  const waterLiters = parseFloat(water_intake) || 0;
  if (waterLiters >= 2.0) calculatedScore += 25;      
  else if (waterLiters >= 1.0) calculatedScore += 15; 

  const meals = parseInt(meals_count) || 0;
  calculatedScore += meals * 10;

  const meditation = parseInt(meditation_minutes) || 0;
  if (meditation >= 10) calculatedScore += 15;
  else if (meditation > 0) calculatedScore += 8;

  const stress = parseInt(stress_level) || 0;
  if (stress <= 3) calculatedScore += 10;
  else if (stress <= 6) calculatedScore += 5;

  const anxiety = parseInt(anxiety_level) || 0;
  if (anxiety <= 3) calculatedScore += 10;
  else if (anxiety <= 6) calculatedScore += 5;

  const energy = parseInt(energy_level) || 0;
  if (energy >= 7) calculatedScore += 10;
  else if (energy >= 5) calculatedScore += 5;

  if (calculatedScore > 100) calculatedScore = 100;

  // 2. SQL Query
  const sql = `
    INSERT INTO wellness_logs (
      user_id, log_date, sleep_hours, water_intake, meals_count,
      meditation_minutes, stress_level, anxiety_level, energy_level, score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      sleep_hours = VALUES(sleep_hours),
      water_intake = VALUES(water_intake),
      meals_count = VALUES(meals_count),
      meditation_minutes = VALUES(meditation_minutes),
      stress_level = VALUES(stress_level),
      anxiety_level = VALUES(anxiety_level),
      energy_level = VALUES(energy_level),
      score = VALUES(score)
  `;

  const params = [
    user_id, log_date, sleep, waterLiters, meals,
    meditation, stress, anxiety, energy, calculatedScore
  ];

  // 3. Execution & Achievement Trigger
  try {
    await db.execute(sql, params);

    await updateUserStreak(req.userId);
    await saveWellnessHistory(req.userId, calculatedScore);
    
    // Pass the raw data object here so the engine doesn't need to re-query the DB
    await checkAchievements(req.userId, { 
        sleep: sleep, 
        water: waterLiters, 
        meditation: meditation 
    });

    res.json({ message: "Saved successfully", score: calculatedScore });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

async function saveWellnessHistory(userId, score) {
  try {
    const [result] = await db.execute(
      "SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", 
      [userId]
    );
    if (result.length === 0) return;

    const data = result[0];

    const sql = `
      INSERT INTO wellness_history (user_id, wellness_score, sleep_hours, water_intake, meditation_minutes)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(sql, [userId, score, data.sleep_hours, data.water_intake, data.meditation_minutes]);
  } catch (err) {
    console.error("History updates failure:", err);
  }
}

async function updateUserStreak(userId) {
  try {
    const [result] = await db.execute("SELECT * FROM wellness_streaks WHERE user_id = ?", [userId]);
    const todayString = new Date().toISOString().split("T")[0];

    if (result.length === 0) {
      const insSql = "INSERT INTO wellness_streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (?, 1, 1, ?)";
      await db.execute(insSql, [userId, todayString]);
      return;
    }

    const streak = result[0];
    const lastDate = new Date(streak.last_active_date);
    const today = new Date(todayString);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    let current = streak.current_streak;

    if (diffDays === 0) return;
    if (diffDays === 1) current += 1;
    if (diffDays > 1) current = 1;

    const longest = Math.max(current, streak.longest_streak);

    const updSql = "UPDATE wellness_streaks SET current_streak = ?, longest_streak = ?, last_active_date = ? WHERE user_id = ?";
    await db.execute(updSql, [current, longest, todayString, userId]);
  } catch (err) {
    console.error(err);
  }
}

function generateRecommendations(data) {
  const rec = [];
  if ((data.sleep_hours || 0) < 7) rec.push("Try to sleep at least 7–8 hours for better recovery.");
  if ((data.water_intake || 0) < 2) rec.push("Increase water intake to 2–3 liters daily.");
  if ((data.stress_level || 0) > 6) rec.push("Try breathing exercises or short walks to reduce stress.");
  if ((data.energy_level || 0) < 5) rec.push("Low energy detected — improve sleep and nutrition.");
  if (rec.length === 0) rec.push("Great job! Keep maintaining your healthy routine.");
  return rec;
}

// =====================
// DASHBOARD & GETTERS
// =====================
app.get("/wellness-log/today", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute("SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE()", [req.userId]);
    res.json(result[0] || {
      sleep_hours: null, water_intake: 0, meals_count: 0, meditation_minutes: 0,
      stress_level: null, anxiety_level: null, energy_level: null,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/wellness-dashboard", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const [logs] = await db.execute(
      `SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1`,
      [userId]
    );

    const [mood] = await db.execute(
      `SELECT mood_emoji, mood_text FROM moods WHERE user_id = ? AND DATE(created_at) = CURDATE() ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const [streak] = await db.execute(
      `SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    const [achievements] = await db.execute(
      `SELECT id, title, description, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC`,
      [userId]
    );

    const log = logs[0] || {
      score: 0, sleep_hours: 0, water_intake: 0, meals_count: 0, meditation_minutes: 0,
      stress_level: 0, anxiety_level: 0, energy_level: 0,
    };

    res.json({
      ...log,
      mood: mood.length > 0 ? {
        emoji: mood[0].mood_emoji,
        text: mood[0].mood_text,
      } : null,
      streaks: {
        current: streak[0]?.current_streak || 0,
        longest: streak[0]?.longest_streak || 0,
      },
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
    SELECT w.id, w.user_id, w.log_date, w.sleep_hours, w.water_intake, w.meals_count,
           w.meditation_minutes, w.stress_level, w.anxiety_level, w.energy_level, w.score,
           COALESCE(m.mood_emoji, '😐') AS mood_emoji, COALESCE(m.mood_text, 'Neutral') AS mood_text,
           ws.current_streak, ws.longest_streak, ws.last_active_date
    FROM wellness_logs w
    LEFT JOIN moods m ON m.user_id = w.user_id AND DATE(m.created_at) = DATE(w.log_date)
    LEFT JOIN wellness_streaks ws ON  ws.user_id = w.user_id WHERE w.user_id = ? AND w.log_date = CURDATE() LIMIT 1
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
    const sql = "SELECT * FROM wellness_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 7";
    const [rows] = await db.execute(sql, [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Logs fetching error" });
  }
});

// GET all contacts
// POST: Add contact (with 5 limit)
app.post("/favourite-contact", authMiddleware, (req, res) => {
  const { name, phone, relationship } = req.body;
  db.query("SELECT COUNT(*) AS total FROM favourite_contacts WHERE user_id = ?", [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result[0].total >= 5) return res.status(400).json({ message: "Maximum 5 emergency contacts allowed" });
    db.query("INSERT INTO favourite_contacts (user_id, name, phone, relationship) VALUES (?, ?, ?, ?)", 
    [req.userId, name, phone, relationship], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Contact saved successfully" });
    });
  });
});

// GET: Fetch all contacts
app.get("/favourite-contact", authMiddleware, (req, res) => {
  db.query("SELECT * FROM favourite_contacts WHERE user_id = ? ORDER BY created_at DESC", [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// PUT: Update contact
app.put("/favourite-contact/:id", authMiddleware, (req, res) => {
  const { name, phone, relationship } = req.body;
  db.query("UPDATE favourite_contacts SET name=?, phone=?, relationship=? WHERE id=? AND user_id=?", 
  [name, phone, relationship, req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Contact updated successfully" });
  });
});

// DELETE: Remove contact
app.delete("/favourite-contact/:id", authMiddleware, (req, res) => {
  db.query("DELETE FROM favourite_contacts WHERE id=? AND user_id=?", [req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Contact deleted successfully" });
  });
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});