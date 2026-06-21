// require('dotenv').config();

// const express    = require("express");
// const bcrypt     = require("bcryptjs");
// const jwt        = require("jsonwebtoken");
// const cors       = require("cors");
// const fs         = require("fs");
// const path       = require("path");
// const axios      = require("axios");
// const cron       = require("node-cron");
// const mysql      = require("mysql2/promise");
// const multer     = require("multer");
// const FormData   = require("form-data");
// const Groq       = require("groq-sdk");
// const groq       = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const app = express();

// app.use(express.json());
// app.use(cors());
// app.use("/assets", express.static(path.join(__dirname, "assets")));

// // AFTER — pool that stays alive
// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "care-plus-app",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// db.getConnection()
//   .then(conn => { console.log("MYSQL CONNECTED"); conn.release(); })
//   .catch(err => console.error("DB CONNECTION ERROR:", err));

// // =====================
// // MULTER STORAGE
// // =====================
// if (!fs.existsSync("./assets/uploads")) {
//   fs.mkdirSync("./assets/uploads", { recursive: true });
// }

// const diskStorage = multer.diskStorage({
//   destination: (req, file, cb) => { cb(null, "./assets/uploads"); },
//   filename:    (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); },
// });

// const upload       = multer({ storage: diskStorage });
// const uploadMemory = multer({ storage: multer.memoryStorage() });

// // =====================
// // AUTH MIDDLEWARE
// // =====================
// const authMiddleware = (req, res, next) => {
//   let token = req.headers.authorization;
//   if (!token) return res.status(401).json({ message: "No token" });
//   if (token.startsWith("Bearer ")) token = token.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, "secret123");
//     req.userId = decoded.id;
//     next();
//   } catch {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// // =====================
// // REGISTER
// // =====================
// app.post("/register", async (req, res) => {
//   const defaultProfile = "assets/images/profile.png";
//   const { name, email, password, phone_number } = req.body;
//   try {
//     const [existingUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
//     if (existingUsers.length > 0) return res.status(400).json({ message: "User already exists" });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await db.execute(
//       "INSERT INTO users (name, email, password, phone_number, profile_image) VALUES (?, ?, ?, ?, ?)",
//       [name, email, hashedPassword, phone_number, defaultProfile]
//     );
//     res.json({ message: "User registered" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server registry error" });
//   }
// });

// // =====================
// // LOGIN
// // =====================
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const [results] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
//     if (results.length === 0) return res.status(400).json({ message: "User not found" });
//     const user = results[0];
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ message: "Wrong password" });
//     const token = jwt.sign({ id: user.id }, "secret123", { expiresIn: "7d" });
//     res.json({
//       token,
//       user: {
//         id: user.id, name: user.name, email: user.email,
//         phone_number: user.phone_number, profile_image: user.profile_image,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // =====================
// // GET USER
// // =====================
// app.get("/me", authMiddleware, async (req, res) => {
//   try {
//     const [result] = await db.execute(
//       "SELECT id, name, email, phone_number, created_at, profile_image, privacy_mode FROM users WHERE id = ?",
//       [req.userId]
//     );
//     if (!result || result.length === 0) return res.status(404).json({ message: "User not found" });
//     res.json(result[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // =====================
// // UPDATE PROFILE
// // =====================
// app.put("/update-profile", authMiddleware, upload.single("profile_image"), async (req, res) => {
//   const { name, email, phone_number } = req.body;
//   try {
//     const [result] = await db.execute("SELECT profile_image FROM users WHERE id = ?", [req.userId]);
//     const oldImage = result[0]?.profile_image;
//     let newImage = oldImage;
//     if (req.file) {
//       newImage = `assets/uploads/${req.file.filename}`;
//       if (oldImage && oldImage.includes("/uploads/")) {
//         const filename = oldImage.split("/uploads/")[1];
//         const oldPath = path.join(__dirname, "assets", "uploads", filename);
//         fs.unlink(oldPath, (err) => { if (err) console.log("Old image delete error:", err.message); });
//       }
//     }
//     await db.execute(
//       "UPDATE users SET name = ?, email = ?, phone_number = ?, profile_image = ? WHERE id = ?",
//       [name, email, phone_number, newImage, req.userId]
//     );
//     res.json({ message: "Profile updated successfully", profile_image: newImage });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Update failed" });
//   }
// });

// // =====================
// // CHANGE PASSWORD
// // =====================
// app.put("/change-password", authMiddleware, async (req, res) => {
//   const { newPassword, confirmPassword } = req.body;
//   if (!newPassword || !confirmPassword) return res.status(400).json({ message: "Fields required" });
//   if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
//   try {
//     const hashed = await bcrypt.hash(newPassword, 10);
//     await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, req.userId]);
//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // =====================
// // SAVE MOOD
// // =====================
// app.post("/mood", authMiddleware, async (req, res) => {
//   const { mood_emoji } = req.body;
//   const moodMap = { "😄": "Happy", "🙂": "Good", "😐": "Neutral", "😕": "Sad", "😔": "Very Sad" };
//   const mood_text = moodMap[mood_emoji] || "Unknown";
//   try {
//     await db.execute("INSERT INTO moods (user_id, mood_emoji, mood_text) VALUES (?, ?, ?)", [req.userId, mood_emoji, mood_text]);
//     res.json({ message: "Mood saved successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error saving mood" });
//   }
// });

// // =====================
// // GET MOOD HISTORY
// // =====================
// app.get("/mood-history", authMiddleware, async (req, res) => {
//   const limit  = parseInt(req.query.limit)  || 7;
//   const offset = parseInt(req.query.offset) || 0;
//   try {
//     const [result] = await db.execute(
//       "SELECT id, mood_emoji, mood_text, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
//       [req.userId, limit, offset]
//     );
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching moods" });
//   }
// });

// // =====================
// // DELETE MOOD
// // =====================
// app.delete("/delete-mood/:id", authMiddleware, async (req, res) => {
//   try {
//     await db.execute("DELETE FROM moods WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
//     res.json({ message: "Mood deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// // =====================
// // TOGGLE PRIVACY
// // =====================
// app.put("/toggle-privacy", authMiddleware, async (req, res) => {
//   const { privacy_mode } = req.body;
//   try {
//     await db.execute("UPDATE users SET privacy_mode = ? WHERE id = ?", [privacy_mode, req.userId]);
//     res.json({ message: "Privacy mode updated" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update privacy mode" });
//   }
// });

// // =====================
// // DELETE ACCOUNT
// // =====================
// app.delete("/delete-account", authMiddleware, async (req, res) => {
//   const userId = req.userId;
//   try {
//     await db.execute("DELETE FROM moods WHERE user_id = ?", [userId]);
//     await db.execute("DELETE FROM users WHERE id = ?", [userId]);
//     res.json({ message: "Your account has been deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed deleting account info" });
//   }
// });

// // =========================
// // NOTIFICATION SETTINGS
// // =========================
// app.get("/notification-settings", authMiddleware, async (req, res) => {
//   try {
//     let [result] = await db.execute("SELECT * FROM notification_settings WHERE user_id = ?", [req.userId]);
//     if (result.length === 0) {
//       await db.execute("INSERT INTO notification_settings (user_id) VALUES (?)", [req.userId]);
//       [result] = await db.execute("SELECT * FROM notification_settings WHERE user_id = ?", [req.userId]);
//     }
//     res.json(result[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.put("/notification-settings", authMiddleware, async (req, res) => {
//   let { mood_reminder, sleep_reminder, water_reminder, meal_reminder,
//         notification_sound, notification_preview, quiet_mode } = req.body;

//   let finalQuietMode = quiet_mode;
//   if (req.body.quiet_mode === undefined) {
//     if (mood_reminder || sleep_reminder || water_reminder || meal_reminder) finalQuietMode = false;
//   }

//   let finalMood  = mood_reminder,  finalSleep = sleep_reminder;
//   let finalWater = water_reminder, finalMeal  = meal_reminder;
//   let finalSound = notification_sound, finalPreview = notification_preview;

//   if (finalQuietMode) {
//     finalMood = finalSleep = finalWater = finalMeal = finalSound = finalPreview = false;
//   }

//   try {
//     await db.execute(
//       `UPDATE notification_settings
//        SET mood_reminder=?, sleep_reminder=?, water_reminder=?, meal_reminder=?,
//            notification_sound=?, notification_preview=?, quiet_mode=?
//        WHERE user_id=?`,
//       [finalMood, finalSleep, finalWater, finalMeal, finalSound, finalPreview, finalQuietMode, req.userId]
//     );
//     res.json({
//       message: "Notification settings updated",
//       data: { mood_reminder: finalMood, sleep_reminder: finalSleep, water_reminder: finalWater,
//               meal_reminder: finalMeal, notification_sound: finalSound, notification_preview: finalPreview,
//               quiet_mode: finalQuietMode },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Update failed" });
//   }
// });

// // =====================
// // EXPO TOKEN (kept for future use, won't break existing clients)
// // =====================
// app.post("/save-token", authMiddleware, async (req, res) => {
//   const { expo_token } = req.body;
//   try {
//     await db.execute("UPDATE users SET expo_token = ? WHERE id = ?", [expo_token, req.userId]);
//     res.json({ message: "Token saved" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // =====================
// // IN-APP NOTIFICATIONS
// // =====================
// app.get("/notifications", authMiddleware, async (req, res) => {
//   try {
//     const [result] = await db.execute(
//       "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50",
//       [req.userId]
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// app.put("/notifications/read-all", authMiddleware, async (req, res) => {
//   try {
//     await db.execute("UPDATE notifications SET read_status = 1 WHERE user_id = ?", [req.userId]);
//     res.json({ message: "All marked read" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // =====================
// // IN-APP NOTIFICATION HELPER
// // Writes to DB only — no Expo push
// // =====================
// async function createInAppNotification(userId, title, body) {
//   try {
//     // Deduplicate: don't insert the same title within the last 55 minutes
//     const [existing] = await db.execute(
//       "SELECT id FROM notifications WHERE user_id = ? AND title = ? AND created_at >= NOW() - INTERVAL 55 MINUTE LIMIT 1",
//       [userId, title]
//     );
//     if (existing.length > 0) return;

//     await db.execute(
//       "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
//       [userId, title, body]
//     );
//   } catch (err) {
//     console.log("createInAppNotification error:", err.message);
//   }
// }

// function pickQuote() {
//   const quotes = [
//     "You are stronger than you think 💪",
//     "Small progress is still progress 🌱",
//     "Stay consistent, not perfect ✨",
//     "Take care of your mind today 🧠",
//   ];
//   return quotes[Math.floor(Math.random() * quotes.length)];
// }

// // =====================
// // CRON — in-app notifications only (no push)
// // =====================
// cron.schedule("* * * * *", async () => {
//   const now    = new Date();
//   const hour   = now.getHours();
//   const minute = now.getMinutes();

//   try {
//     const [users] = await db.execute(`
//       SELECT users.id, notification_settings.*, wellness_preferences.*
//       FROM users
//       LEFT JOIN notification_settings ON users.id = notification_settings.user_id
//       LEFT JOIN wellness_preferences  ON users.id = wellness_preferences.user_id
//     `);

//     if (!Array.isArray(users)) return;

//     for (const user of users) {
//       if (user.quiet_mode) continue;

//       // Sleep — 22:00
//       if (hour === 22 && minute === 0 && user.sleep_reminder) {
//         await createInAppNotification(user.id, "🌙 Sleep Insight",
//           `Sleep goal: ${user.sleep_goal || "8h"} — time to wind down and rest`);
//       }
//       // Water — every 3 hours on the hour
//       if (hour % 3 === 0 && minute === 0 && user.water_reminder) {
//         await createInAppNotification(user.id, "💧 Hydration Insight",
//           `Hydration goal: ${user.water_goal || "2L"} — log your water intake`);
//       }
//       // Mood — 09:00
//       if (hour === 9 && minute === 0 && user.mood_reminder) {
//         await createInAppNotification(user.id, "😊 Mood Check",
//           "How are you feeling today? Log your mood to track your wellness");
//       }
//       // Meal — 14:00
//       if (hour === 14 && minute === 0 && user.meal_reminder) {
//         await createInAppNotification(user.id, "🍽 Meal Reminder",
//           "Don't skip your afternoon meal — log it for your wellness score");
//       }
//       // Meditation — 18:00
//       if (hour === 18 && minute === 0 && user.meditation_reminder) {
//         await createInAppNotification(user.id, "🧘 Mind Reset",
//           "Take 5 minutes for breathing and calmness");
//       }
//       // Journal — 21:00
//       if (hour === 21 && minute === 0 && user.journal_reminder) {
//         await createInAppNotification(user.id, "📔 Journal Time",
//           "Write your thoughts — reflect on your day");
//       }
//       // Motivation — 10:00
//       if (hour === 10 && minute === 0 && user.motivation_quotes) {
//         await createInAppNotification(user.id, "✨ Daily Motivation", pickQuote());
//       }
//     }
//   } catch (err) {
//     console.log("CRON ERROR:", err);
//   }
// });

// // Midnight streak sync
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const [users] = await db.execute("SELECT id FROM users");
//     for (const user of users) {
//       await db.execute(
//         "INSERT INTO wellness_activity (user_id, date) VALUES (?, CURDATE()) ON DUPLICATE KEY UPDATE id=id",
//         [user.id]
//       );
//     }
//   } catch (err) {
//     console.error("Midnight Sync Error:", err);
//   }
// });

// // =====================
// // WELLNESS PREFERENCES
// // =====================
// app.get("/wellness-preferences", authMiddleware, async (req, res) => {
//   try {
//     let [result] = await db.execute("SELECT * FROM wellness_preferences WHERE user_id = ?", [req.userId]);
//     if (result.length === 0) {
//       await db.execute("INSERT INTO wellness_preferences (user_id) VALUES (?)", [req.userId]);
//       [result] = await db.execute("SELECT * FROM wellness_preferences WHERE user_id = ?", [req.userId]);
//     }
//     res.json(result[0]);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// app.put("/wellness-preferences", authMiddleware, async (req, res) => {
//   let { sleep_goal, water_goal, mood_tracking, meal_tracking,
//         meditation_reminder, journal_reminder, motivation_quotes, night_mode } = req.body;

//   if (night_mode === true) { meditation_reminder = false; journal_reminder = false; motivation_quotes = false; }
//   if (meditation_reminder === true || journal_reminder === true || motivation_quotes === true) night_mode = false;

//   try {
//     await db.execute(
//       `UPDATE wellness_preferences
//        SET sleep_goal=?, water_goal=?, mood_tracking=?, meal_tracking=?,
//            meditation_reminder=?, journal_reminder=?, motivation_quotes=?, night_mode=?
//        WHERE user_id=?`,
//       [sleep_goal, water_goal, mood_tracking, meal_tracking,
//        meditation_reminder, journal_reminder, motivation_quotes, night_mode, req.userId]
//     );
//     res.json({ message: "Preferences updated successfully" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // =====================
// // ACHIEVEMENTS
// // =====================
// async function checkAchievements(userId, data) {
//   try {
//     const [streakResult] = await db.execute(
//       "SELECT current_streak FROM wellness_streaks WHERE user_id = ?", [userId]
//     );
//     const streak     = parseInt(streakResult[0]?.current_streak) || 0;
//     const water      = parseFloat(data.water) || 0;
//     const sleep      = parseFloat(data.sleep) || 0;
//     const meditation = parseInt(data.meditation) || 0;

//     const achievements = [
//       { title: "7 Day Streak",    condition: streak >= 7,     desc: "Maintained wellness tracking for 7 days" },
//       { title: "30 Day Master",   condition: streak >= 30,    desc: "Maintained wellness consistency for 30 days" },
//       { title: "Hydration Hero",  condition: water >= 3.0,    desc: "Drank 3L of water in one day" },
//       { title: "Deep Sleeper",    condition: sleep >= 8,      desc: "Achieved 8+ hours of sleep" },
//       { title: "Zen Master",      condition: meditation >= 20, desc: "Completed 20 mins of meditation" },
//     ];

//     for (const ach of achievements) {
//       if (ach.condition) await unlockAchievement(userId, ach.title, ach.desc);
//     }
//   } catch (err) {
//     console.error("checkAchievements error:", err);
//   }
// }

// async function unlockAchievement(userId, title, description) {
//   try {
//     const [existing] = await db.execute(
//       "SELECT id FROM achievements WHERE user_id = ? AND title = ?", [userId, title]
//     );
//     if (existing.length > 0) return;

//     await db.execute(
//       "INSERT INTO achievements (user_id, title, description) VALUES (?, ?, ?)",
//       [userId, title, description]
//     );

//     // Also surface as an in-app notification
//     await createInAppNotification(
//       userId,
//       `🏆 Achievement Unlocked`,
//       `You earned "${title}" — ${description}`
//     );
//   } catch (err) {
//     console.error("unlockAchievement SQL error:", err);
//   }
// }
// // Add this to server.js
// app.get("/achievements/daily", authMiddleware, async (req, res) => {
//   try {
//     const [log] = await db.execute(
//       "SELECT * FROM wellness_logs WHERE user_id=? AND log_date=CURDATE() LIMIT 1", [req.userId]
//     );
//     const [streak] = await db.execute(
//       "SELECT current_streak FROM wellness_streaks WHERE user_id=?", [req.userId]
//     );

//     const data = log[0] || {};
//     const currentStreak = streak[0]?.current_streak || 0;

//     const daily = [
//       { id: "sleep",      emoji: "💤", title: "Deep Sleeper",   desc: "Sleep 8+ hours",        done: (data.sleep_hours || 0) >= 8 },
//       { id: "water",      emoji: "💧", title: "Hydration Hero", desc: "Drink 2L+ water",        done: (data.water_intake || 0) >= 2 },
//       { id: "meals",      emoji: "🍽", title: "Meal Master",    desc: "Log 3 meals",            done: (data.meals_count || 0) >= 3 },
//       { id: "meditation", emoji: "🧘", title: "Zen Warrior",    desc: "Meditate 10+ mins",      done: (data.meditation_minutes || 0) >= 10 },
//       { id: "stress",     emoji: "😌", title: "Calm Mind",      desc: "Stress level ≤ 3",       done: (data.stress_level || 10) <= 3 },
//       { id: "energy",     emoji: "⚡", title: "Full Power",     desc: "Energy level 7+",        done: (data.energy_level || 0) >= 7 },
//       { id: "streak7",    emoji: "🔥", title: "7-Day Streak",   desc: "7 day streak",           done: currentStreak >= 7 },
//       { id: "perfect",    emoji: "🏆", title: "Perfect Day",    desc: "Score 90+",              done: (data.score || 0) >= 90 },
//     ];

//     res.json({ date: new Date().toISOString().split("T")[0], achievements: daily });
//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// });
// // =====================
// // DAILY QUOTE
// // =====================
// app.get("/wellness/daily-quote", authMiddleware, async (req, res) => {
//   try {
//     const [prefsResult] = await db.execute(
//       "SELECT motivation_quotes FROM wellness_preferences WHERE user_id = ?",
//       [req.userId]
//     );

//     const prefs = prefsResult[0];
//     // If the row exists AND is explicitly off, return empty
//     if (prefs && prefs.motivation_quotes === 0) {
//       return res.json({ showQuote: false, text: "" });
//     }

//     const quotesPool = [
//       "You are stronger than you think 💪",
//       "Small progress is still progress 🌱",
//       "Stay consistent, not perfect ✨",
//       "Take care of your mind today 🧠",
//       "Do the best you can until you know better 🌟",
//       "Believe you can and you're halfway there 🎯",
//       "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity. 🧘",
//       "Rest is not a reward — it's a requirement 🛌",
//       "Be patient with yourself; growth takes time 🌿",
//       "One mindful breath can change your whole day 🍃",
//     ];

//     // Pick by day-of-year so it changes daily but stays consistent within the day
//     const now   = new Date();
//     const start = new Date(now.getFullYear(), 0, 0);
//     const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));

//     return res.json({
//       showQuote: true,
//       text: quotesPool[dayOfYear % quotesPool.length],
//     });
//   } catch (err) {
//     console.error("Quote API Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // =====================
// // WELLNESS LOGGING
// // =====================
// app.post("/wellness-log", authMiddleware, async (req, res) => {
//   const { sleep_hours, water_intake, meals_count, meditation_minutes,
//           stress_level, anxiety_level, energy_level } = req.body;

//   const user_id  = req.userId;
//   const log_date = new Date().toISOString().split("T")[0];

//   let calculatedScore = 0;
//   const sleep      = parseFloat(sleep_hours)       || 0;
//   const waterLiters= parseFloat(water_intake)      || 0;
//   const meals      = parseInt(meals_count)          || 0;
//   const meditation = parseInt(meditation_minutes)   || 0;
//   const stress     = parseInt(stress_level)         || 0;
//   const anxiety    = parseInt(anxiety_level)        || 0;
//   const energy     = parseInt(energy_level)         || 0;

//   if (sleep >= 7)        calculatedScore += 25; else if (sleep >= 5) calculatedScore += 15;
//   if (waterLiters >= 2)  calculatedScore += 25; else if (waterLiters >= 1) calculatedScore += 15;
//   calculatedScore += meals * 10;
//   if (meditation >= 10)  calculatedScore += 15; else if (meditation > 0) calculatedScore += 8;
//   if (stress <= 3)       calculatedScore += 10; else if (stress <= 6) calculatedScore += 5;
//   if (anxiety <= 3)      calculatedScore += 10; else if (anxiety <= 6) calculatedScore += 5;
//   if (energy >= 7)       calculatedScore += 10; else if (energy >= 5) calculatedScore += 5;
//   if (calculatedScore > 100) calculatedScore = 100;

//   const sql = `
//     INSERT INTO wellness_logs (user_id, log_date, sleep_hours, water_intake, meals_count,
//       meditation_minutes, stress_level, anxiety_level, energy_level, score)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE
//       sleep_hours=VALUES(sleep_hours), water_intake=VALUES(water_intake),
//       meals_count=VALUES(meals_count), meditation_minutes=VALUES(meditation_minutes),
//       stress_level=VALUES(stress_level), anxiety_level=VALUES(anxiety_level),
//       energy_level=VALUES(energy_level), score=VALUES(score)
//   `;

//   try {
//     await db.execute(sql, [user_id, log_date, sleep, waterLiters, meals,
//                            meditation, stress, anxiety, energy, calculatedScore]);
//     await updateUserStreak(req.userId);
//     await saveWellnessHistory(req.userId, calculatedScore);
//     await checkAchievements(req.userId, { sleep, water: waterLiters, meditation });

//     res.json({ message: "Saved successfully", score: calculatedScore });
//   } catch (err) {
//     console.error("SAVE ERROR:", err);
//     res.status(500).json({ message: "Save failed" });
//   }
// });

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

// async function updateUserStreak(userId) {
//   try {
//     const [result] = await db.execute("SELECT * FROM wellness_streaks WHERE user_id = ?", [userId]);
//     const todayString = new Date().toISOString().split("T")[0];

//     if (result.length === 0) {
//       await db.execute(
//         "INSERT INTO wellness_streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (?, 1, 1, ?)",
//         [userId, todayString]
//       );
//       return;
//     }

//     const streak  = result[0];
//     const lastDate= new Date(streak.last_active_date);
//     const today   = new Date(todayString);
//     const diffDays= Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
//     let current   = streak.current_streak;

//     if (diffDays === 0) return;
//     if (diffDays === 1) current += 1;
//     if (diffDays > 1)  current = 1;

//     const longest = Math.max(current, streak.longest_streak);
//     await db.execute(
//       "UPDATE wellness_streaks SET current_streak=?, longest_streak=?, last_active_date=? WHERE user_id=?",
//       [current, longest, todayString, userId]
//     );
//   } catch (err) {
//     console.error(err);
//   }
// }

// function generateRecommendations(data) {
//   const rec = [];
//   if ((data.sleep_hours || 0) < 7)   rec.push("Try to sleep at least 7–8 hours for better recovery.");
//   if ((data.water_intake || 0) < 2)  rec.push("Increase water intake to 2–3 liters daily.");
//   if ((data.stress_level || 0) > 6)  rec.push("Try breathing exercises or short walks to reduce stress.");
//   if ((data.energy_level || 0) < 5)  rec.push("Low energy detected — improve sleep and nutrition.");
//   if (rec.length === 0) rec.push("Great job! Keep maintaining your healthy routine.");
//   return rec;
// }

// // =====================
// // DASHBOARD & GETTERS
// // =====================
// app.get("/wellness-log/today", authMiddleware, async (req, res) => {
//   try {
//     const [result] = await db.execute(
//       "SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE()", [req.userId]
//     );
//     res.json(result[0] || {
//       sleep_hours: null, water_intake: 0, meals_count: 0, meditation_minutes: 0,
//       stress_level: null, anxiety_level: null, energy_level: null,
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// app.get("/wellness-dashboard", authMiddleware, async (req, res) => {
//   const userId = req.userId;
//   try {
//     const [logs]         = await db.execute("SELECT * FROM wellness_logs WHERE user_id=? AND log_date=CURDATE() LIMIT 1", [userId]);
//     const [mood]         = await db.execute("SELECT mood_emoji, mood_text FROM moods WHERE user_id=? AND DATE(created_at)=CURDATE() ORDER BY created_at DESC LIMIT 1", [userId]);
//     const [streak]       = await db.execute("SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id=? LIMIT 1", [userId]);
//     const [achievements] = await db.execute("SELECT id, title, description, unlocked_at FROM achievements WHERE user_id=? ORDER BY unlocked_at DESC", [userId]);

//     const log = logs[0] || { score:0, sleep_hours:0, water_intake:0, meals_count:0,
//                              meditation_minutes:0, stress_level:0, anxiety_level:0, energy_level:0 };

//     res.json({
//       ...log,
//       mood: mood.length > 0 ? { emoji: mood[0].mood_emoji, text: mood[0].mood_text } : null,
//       streaks: { current: streak[0]?.current_streak || 0, longest: streak[0]?.longest_streak || 0 },
//       achievements: achievements || [],
//       recommendations: generateRecommendations(log),
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Dashboard error" });
//   }
// });

// app.get("/dashboard/:userId", async (req, res) => {
//   const userId = req.params.userId;
//   const sql = `
//     SELECT w.*, COALESCE(m.mood_emoji,'😐') AS mood_emoji, COALESCE(m.mood_text,'Neutral') AS mood_text,
//            ws.current_streak, ws.longest_streak, ws.last_active_date
//     FROM wellness_logs w
//     LEFT JOIN moods m ON m.user_id=w.user_id AND DATE(m.created_at)=DATE(w.log_date)
//     LEFT JOIN wellness_streaks ws ON ws.user_id=w.user_id
//     WHERE w.user_id=? AND w.log_date=CURDATE() LIMIT 1
//   `;
//   try {
//     const [rows] = await db.execute(sql, [userId]);
//     res.json(rows[0] || null);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Dashboard error" });
//   }
// });

// app.get("/logs/:userId", async (req, res) => {
//   try {
//     const [rows] = await db.execute(
//       "SELECT * FROM wellness_logs WHERE user_id=? ORDER BY log_date DESC LIMIT 7", [req.params.userId]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Logs fetching error" });
//   }
// });

// // =====================
// // FAVOURITE CONTACTS
// // =====================
// app.post("/favourite-contact", authMiddleware, (req, res) => {
//   const { name, phone, relationship } = req.body;
//   db.query("SELECT COUNT(*) AS total FROM favourite_contacts WHERE user_id=?", [req.userId], (err, result) => {
//     if (err) return res.status(500).json(err);
//     if (result[0].total >= 5) return res.status(400).json({ message: "Maximum 5 emergency contacts allowed" });
//     db.query(
//       "INSERT INTO favourite_contacts (user_id, name, phone, relationship) VALUES (?, ?, ?, ?)",
//       [req.userId, name, phone, relationship], (err) => {
//         if (err) return res.status(500).json(err);
//         res.json({ message: "Contact saved successfully" });
//       }
//     );
//   });
// });

// app.get("/favourite-contact", authMiddleware, (req, res) => {
//   db.query("SELECT * FROM favourite_contacts WHERE user_id=? ORDER BY created_at DESC", [req.userId], (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json(result);
//   });
// });

// app.put("/favourite-contact/:id", authMiddleware, (req, res) => {
//   const { name, phone, relationship } = req.body;
//   db.query(
//     "UPDATE favourite_contacts SET name=?, phone=?, relationship=? WHERE id=? AND user_id=?",
//     [name, phone, relationship, req.params.id, req.userId], (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Contact updated successfully" });
//     }
//   );
// });

// app.delete("/favourite-contact/:id", authMiddleware, (req, res) => {
//   db.query("DELETE FROM favourite_contacts WHERE id=? AND user_id=?", [req.params.id, req.userId], (err) => {
//     if (err) return res.status(500).json(err);
//     res.json({ message: "Contact deleted successfully" });
//   });
// });

// // =====================
// // MEDITATION UPDATE
// // =====================
// app.post("/api/meditation/update-minutes", authMiddleware, async (req, res) => {
//   const { log_date, meditation_minutes } = req.body;
//   if (!log_date || meditation_minutes == null)
//     return res.status(400).json({ message: "log_date and meditation_minutes are required" });
//   try {
//     await db.execute(
//       `INSERT INTO wellness_logs (user_id, log_date, meditation_minutes)
//        VALUES (?, ?, ?)
//        ON DUPLICATE KEY UPDATE meditation_minutes = meditation_minutes + VALUES(meditation_minutes)`,
//       [req.userId, log_date, meditation_minutes]
//     );
//     res.json({ message: "Meditation updated successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // =====================
// // GAME SCORES
// // =====================
// app.get("/api/game-scores", authMiddleware, async (req, res) => {
//   try {
//     const today = new Date().toISOString().split("T")[0];
//     const [todayRows] = await db.execute(
//       "SELECT memory, stroop, sequence, tapstar, reverse, gratitude FROM game_scores WHERE user_id=? AND log_date=?",
//       [req.userId, today]
//     );
//     const [prevRows] = await db.execute(
//       `SELECT MAX(memory) AS memory, MAX(stroop) AS stroop, MAX(sequence) AS sequence,
//               MAX(tapstar) AS tapstar, MAX(reverse) AS reverse, MAX(gratitude) AS gratitude
//        FROM game_scores WHERE user_id=? AND log_date<?`,
//       [req.userId, today]
//     );
//     res.json({ today: todayRows[0] ?? {}, previous: prevRows[0] ?? {} });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.post("/api/game-scores", authMiddleware, async (req, res) => {
//   const { game, score, log_date } = req.body;
//   const VALID_GAMES = ["memory", "stroop", "sequence", "tapstar", "reverse", "gratitude"];
//   if (!game || !VALID_GAMES.includes(game)) return res.status(400).json({ message: "Invalid or missing game key" });
//   if (score == null || !log_date) return res.status(400).json({ message: "score and log_date are required" });
//   try {
//     await db.execute(
//       `INSERT INTO game_scores (user_id, log_date, ${game}) VALUES (?, ?, ?)
//        ON DUPLICATE KEY UPDATE ${game} = GREATEST(${game}, VALUES(${game}))`,
//       [req.userId, log_date, score]
//     );
//     const [rows] = await db.execute(
//       "SELECT memory, stroop, sequence, tapstar, reverse, gratitude FROM game_scores WHERE user_id=? AND log_date=?",
//       [req.userId, log_date]
//     );
//     res.json({ message: "Score saved", today: rows[0] ?? {} });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // =====================
// // THERAPY
// // =====================
// app.get("/therapy/sessions/:userId", async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM therapy_sessions WHERE user_id=? ORDER BY session_date ASC",
//       [req.params.userId]
//     );
//     res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// app.post("/therapy/book", async (req, res) => {
//   const { user_id, therapist_id, therapist_name, title, session_type, session_date, session_time, notes } = req.body;
//   try {
//     const [result] = await db.query(
//       "INSERT INTO therapy_sessions (user_id,therapist_id,therapist_name,title,session_type,session_date,session_time,status,notes) VALUES (?,?,?,?,?,?,?,?,?)",
//       [user_id, therapist_id||null, therapist_name, title, session_type, session_date, session_time, "upcoming", notes||null]
//     );
//     res.json({ success: true, sessionId: result.insertId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Booking Failed" });
//   }
// });

// app.post("/therapy/chat-log", async (req, res) => {
//   const { user_id, session_id, message_count, summary } = req.body;
//   try {
//     await db.query(
//       "INSERT INTO therapy_chat_logs (user_id,session_id,message_count,summary) VALUES (?,?,?,?)",
//       [user_id, session_id, message_count, summary]
//     );
//     res.json({ success: true, message: "Chat Logged" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error" });
//   }
// });

// app.post("/therapy/voice-log", async (req, res) => {
//   const { user_id, session_id, exchange_count } = req.body;
//   try {
//     await db.query(
//       "INSERT INTO therapy_voice_logs (user_id,session_id,exchange_count) VALUES (?,?,?)",
//       [user_id, session_id, exchange_count]
//     );
//     res.json({ success: true, message: "Voice Log Saved" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error" });
//   }
// });

// app.put("/therapy/session-status/:id", async (req, res) => {
//   const { status } = req.body;
//   try {
//     await db.query("UPDATE therapy_sessions SET status=? WHERE id=?", [status, req.params.id]);
//     res.json({ success: true, message: "Status Updated" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error" });
//   }
// });

// // =====================
// // CHAT THERAPY (Sera)
// // =====================
// app.post("/api/therapy/chat", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { messages, session } = req.body;

//     const [wellnessRows] = await db.execute(
//       "SELECT * FROM wellness_logs WHERE user_id=? AND log_date=CURDATE() LIMIT 1", [userId]
//     );
//     const [moodRows] = await db.execute(
//       "SELECT * FROM moods WHERE user_id=? ORDER BY created_at DESC LIMIT 1", [userId]
//     );
//     const [userRows] = await db.execute("SELECT name, privacy_mode FROM users WHERE id=?", [userId]);

//     const wellness = wellnessRows[0] || null;
//     const mood     = moodRows[0]     || null;
//     const user     = userRows[0]     || null;
//     const name = user?.privacy_mode ? "the user" : user?.name?.split(" ")[0] || "the user";

//     const systemPrompt = `You are Sera, a compassionate AI therapy companion inside the Care Plus mental health app.

// USER CONTEXT:
// - Name: ${name}
// - Mood: ${mood ? `${mood.mood_emoji} ${mood.mood_text}` : "Not logged today"}
// - Sleep: ${wellness?.sleep_hours ?? "?"}h | Water: ${wellness?.water_intake ?? "?"}L | Meditation: ${wellness?.meditation_minutes ?? "?"}m
// - Stress: ${wellness?.stress_level ?? "?"}/5 | Anxiety: ${wellness?.anxiety_level ?? "?"}/5 | Energy: ${wellness?.energy_level ?? "?"}/5
// - Wellness score: ${wellness?.score ?? "?"}/100
// ${session ? `- Session context: "${session.title}" with ${session.therapist_name}` : ""}

// RULES:
// 1. Be warm, empathetic, non-judgmental. Never clinical or cold.
// 2. Use their data naturally — don't list it robotically.
// 3. If stress or anxiety > 3, prioritise grounding techniques.
// 4. If mood is Sad or Very Sad, validate emotionally before any advice.
// 5. Keep responses to 2–4 sentences unless user asks for more.
// 6. Never diagnose or prescribe. Recommend professional help for serious concerns.
// 7. If user seems in crisis: "Please contact a crisis helpline or emergency services immediately."
// 8. End with a gentle question or short grounding suggestion.`;

//     const response = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       max_tokens: 500,
//       messages: [{ role: "system", content: systemPrompt }, ...messages],
//     });

//     const reply = response?.choices?.[0]?.message?.content;
//     if (!reply) return res.status(500).json({ message: "Sera is unavailable right now. Please try again." });
//     res.json({ reply });
//   } catch (error) {
//     console.log("Chat therapy error:", error?.message || error);
//     if (!res.headersSent) res.status(500).json({ message: "Sera is unavailable right now. Please try again." });
//   }
// });

// // =====================
// // TRANSCRIBE
// // =====================
// app.post("/api/therapy/transcribe", authMiddleware, uploadMemory.single("audio"), async (req, res) => {
//   try {
//     const form = new FormData();
//     form.append("file", req.file.buffer, { filename: "audio.m4a", contentType: req.file.mimetype || "audio/m4a" });
//     form.append("model", "whisper-large-v3");
//     form.append("language", "en");

//     const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
//       method: "POST",
//       headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, ...form.getHeaders() },
//       body: form,
//     });
//     const data = await response.json();
//     res.json({ transcript: data.text || "" });
//   } catch (error) {
//     console.log("Transcription error:", error);
//     res.status(500).json({ message: "Transcription failed" });
//   }
// });

// app.listen(5000, "0.0.0.0", () => {
//   console.log("Server running on http://0.0.0.0:5000");
// });


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
const Groq       = require("groq-sdk");
const groq       = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
});

db.getConnection()
  .then(conn => { console.log("MYSQL CONNECTED"); conn.release(); })
  .catch(err => console.error("DB CONNECTION ERROR:", err));

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
    if (existingUsers.length > 0) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (name, email, password, phone_number, profile_image) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone_number, defaultProfile]
    );
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
  try {
    await db.execute("DELETE FROM moods WHERE user_id = ?", [userId]);
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "Your account has been deleted successfully" });
  } catch (err) {
    console.error(err);
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
    "You are stronger than you think 💪",
    "Small progress is still progress 🌱",
    "Stay consistent, not perfect ✨",
    "Take care of your mind today 🧠",
    "Healing is not linear — be patient with yourself 🌿",
    "One step at a time is still moving forward 🚶",
    "Your feelings are valid. You matter. 💚",
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
      SELECT users.id, notification_settings.*, wellness_preferences.*
      FROM users
      LEFT JOIN notification_settings ON users.id = notification_settings.user_id
      LEFT JOIN wellness_preferences  ON users.id = wellness_preferences.user_id
    `);

    if (!Array.isArray(users)) return;

    for (const user of users) {
      if (user.quiet_mode) continue;

      if (hour === 22 && minute === 0 && user.sleep_reminder) {
        await createInAppNotification(user.id, "🌙 Sleep Insight",
          `Sleep goal: ${user.sleep_goal || "8h"} — time to wind down and rest`, "wellness");
      }
      if (hour % 3 === 0 && minute === 0 && user.water_reminder) {
        await createInAppNotification(user.id, "💧 Hydration Insight",
          `Hydration goal: ${user.water_goal || "2L"} — log your water intake`, "wellness");
      }
      if (hour === 9 && minute === 0 && user.mood_reminder) {
        await createInAppNotification(user.id, "😊 Mood Check",
          "How are you feeling today? Log your mood to track your wellness", "wellness");
      }
      if (hour === 14 && minute === 0 && user.meal_reminder) {
        await createInAppNotification(user.id, "🍽 Meal Reminder",
          "Don't skip your afternoon meal — log it for your wellness score", "wellness");
      }
      if (hour === 18 && minute === 0 && user.meditation_reminder) {
        await createInAppNotification(user.id, "🧘 Mind Reset",
          "Take 5 minutes for breathing and calmness", "wellness");
      }
      if (hour === 21 && minute === 0 && user.journal_reminder) {
        await createInAppNotification(user.id, "📔 Journal Time",
          "Write your thoughts — reflect on your day", "wellness");
      }
      if (hour === 10 && minute === 0 && user.motivation_quotes) {
        await createInAppNotification(user.id, "✨ Daily Motivation", pickQuote(), "wellness");
      }

      // Daily wellness check — remind to log if not done
      if (hour === 20 && minute === 0) {
        const [logs] = await db.execute(
          "SELECT id FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1",
          [user.id]
        );
        if (logs.length === 0) {
          await createInAppNotification(user.id, "📊 Wellness Log Pending",
            "You haven't logged your wellness today. Take 2 minutes to track your health!", "wellness");
        }
      }

      // Low wellness score alert
      if (hour === 19 && minute === 0) {
        const [logs] = await db.execute(
          "SELECT score FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1",
          [user.id]
        );
        if (logs.length > 0 && logs[0].score < 40) {
          await createInAppNotification(user.id, "💙 Wellness Support",
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

  const dt = new Date(session_date);
  if (isNaN(dt.getTime())) return null;
  dt.setHours(hours, minutes, 0, 0);
  return dt;
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

      // 30-minute reminder
      if (minutesUntil > 25 && minutesUntil <= 30) {
        const kind = s.session_type === "voice" ? "Voice" : "Chat";
        await createInAppNotification(
          s.user_id,
          "🔔 Session Starting Soon",
          `Your ${kind} session with Sera "${s.title}" starts in about ${Math.round(minutesUntil)} minutes. Get ready!`,
          "therapy"
        );
      }

      // 5-minute reminder
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
      "You are stronger than you think 💪",
      "Small progress is still progress 🌱",
      "Stay consistent, not perfect ✨",
      "Take care of your mind today 🧠",
      "Do the best you can until you know better 🌟",
      "Believe you can and you're halfway there 🎯",
      "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity. 🧘",
      "Rest is not a reward — it's a requirement 🛌",
      "Be patient with yourself; growth takes time 🌿",
      "One mindful breath can change your whole day 🍃",
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
    await saveWellnessHistory(req.userId, calculatedScore);
    await checkAchievements(req.userId, { sleep, water: waterLiters, meditation });

    // Send wellness-based notifications
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

async function saveWellnessHistory(userId, score) {
  try {
    const [result] = await db.execute(
      "SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]
    );
    if (result.length === 0) return;
    const data = result[0];
    await db.execute(
      "INSERT INTO wellness_history (user_id, wellness_score, sleep_hours, water_intake, meditation_minutes) VALUES (?, ?, ?, ?, ?)",
      [userId, score, data.sleep_hours, data.water_intake, data.meditation_minutes]
    );
  } catch (err) {
    console.error("History update failure:", err);
  }
}

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

// Also expose as /wellness/today for frontend compatibility
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

// Latest mood endpoint for frontend
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

// Wellness history
app.get("/wellness-history", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM wellness_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// =====================
// HEALTH MONITORING
// =====================
app.get("/health-monitoring/latest", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement, recorded_at FROM health_monitoring WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1",
      [req.userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching health monitoring data" });
  }
});

app.get("/health-monitoring/history", authMiddleware, async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  try {
    const [rows] = await db.execute(
      "SELECT heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement, recorded_at FROM health_monitoring WHERE user_id = ? ORDER BY recorded_at DESC LIMIT ?",
      [req.userId, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching health monitoring history" });
  }
});

// Post health vitals (for BLE/sensor integration)
app.post("/health-monitoring", authMiddleware, async (req, res) => {
  const { heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement } = req.body;
  try {
    await db.execute(
      "INSERT INTO health_monitoring (user_id, heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement) VALUES (?, ?, ?, ?, ?)",
      [req.userId, heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement]
    );

    // Alert notifications for abnormal vitals
    if (heart_rate_bpm > 120) {
      await createInAppNotification(req.userId, "❤️ High Heart Rate Alert",
        `Your heart rate is ${heart_rate_bpm} bpm. Please rest and talk to Sera if needed.`, "health");
    }
    if (blood_oxygen_percent < 94) {
      await createInAppNotification(req.userId, "🩺 Low SpO₂ Alert",
        `Blood oxygen at ${blood_oxygen_percent}%. Please seek medical attention if this persists.`, "health");
    }
    if (temperature_celsius > 38) {
      await createInAppNotification(req.userId, "🌡️ High Temperature Alert",
        `Temperature ${temperature_celsius}°C detected. Rest and stay hydrated.`, "health");
    }

    res.json({ message: "Vitals saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save vitals" });
  }
});

// =====================
// FAVOURITE CONTACTS
// =====================
app.post("/favourite-contact", authMiddleware, (req, res) => {
  const { name, phone, relationship } = req.body;
  db.query("SELECT COUNT(*) AS total FROM favourite_contacts WHERE user_id=?", [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result[0].total >= 5) return res.status(400).json({ message: "Maximum 5 emergency contacts allowed" });
    db.query(
      "INSERT INTO favourite_contacts (user_id, name, phone, relationship) VALUES (?, ?, ?, ?)",
      [req.userId, name, phone, relationship], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Contact saved successfully" });
      }
    );
  });
});

app.get("/favourite-contact", authMiddleware, (req, res) => {
  db.query("SELECT * FROM favourite_contacts WHERE user_id=? ORDER BY created_at DESC", [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.put("/favourite-contact/:id", authMiddleware, (req, res) => {
  const { name, phone, relationship } = req.body;
  db.query(
    "UPDATE favourite_contacts SET name=?, phone=?, relationship=? WHERE id=? AND user_id=?",
    [name, phone, relationship, req.params.id, req.userId], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Contact updated successfully" });
    }
  );
});

app.delete("/favourite-contact/:id", authMiddleware, (req, res) => {
  db.query("DELETE FROM favourite_contacts WHERE id=? AND user_id=?", [req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Contact deleted successfully" });
  });
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
      "SELECT * FROM therapy_sessions WHERE user_id = ? ORDER BY session_date ASC, session_time ASC",
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Book a session — ONLY with Sera AI, no human therapist names
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

    // Notify user of successful booking
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

    // Mark session completed if session_id given
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

// =====================
// CHAT THERAPY (Sera) — fully data-aware, privacy-mode respecting
// =====================
app.post("/api/therapy/chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { messages, session } = req.body;

    // Fetch all user data in parallel
    const [
      [userRows],
      [wellnessRows],
      [moodRows],
      [vitalsRows],
      [streakRows],
      [achRows],
      [gameRows],
      [prefRows],
      [historyRows],
      [upcomingSessions],
    ] = await Promise.all([
      db.execute("SELECT name, privacy_mode FROM users WHERE id = ?", [userId]),
      db.execute("SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT mood_emoji, mood_text, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 3", [userId]),
      db.execute("SELECT heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement, recorded_at FROM health_monitoring WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1", [userId]),
      db.execute("SELECT current_streak, longest_streak FROM wellness_streaks WHERE user_id = ? LIMIT 1", [userId]),
      db.execute("SELECT title, description, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC LIMIT 5", [userId]),
      db.execute("SELECT memory, stroop, sequence, tapstar, reverse, gratitude FROM game_scores WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT sleep_goal, water_goal FROM wellness_preferences WHERE user_id = ?", [userId]),
      db.execute("SELECT wellness_score, sleep_hours, water_intake, meditation_minutes, created_at FROM wellness_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 7", [userId]),
      db.execute("SELECT title, session_type, session_date, session_time FROM therapy_sessions WHERE user_id = ? AND status = 'upcoming' ORDER BY session_date ASC LIMIT 3", [userId]),
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
- If asked about their data (e.g. "what's my heart rate", "what's my score", "how did I sleep"), kindly explain that you can see their data but Privacy Mode is currently on, so you cannot share those specific details. Tell them they can check the Dashboard directly or turn Privacy Mode off in Settings.
- You may still offer emotional support, general wellness advice, and coping techniques.
- You may acknowledge general themes (e.g. "it sounds like you've been stressed") without citing numbers.`;
    } else {
      // Recent mood history
      const moodHistory = moodRows.length > 0
        ? moodRows.map(m => `${m.mood_emoji} ${m.mood_text} (${new Date(m.created_at).toLocaleDateString()})`).join(", ")
        : "No recent mood logs";

      // Game scores
      const gameEntries = games
        ? Object.entries(games).filter(([, v]) => v !== null && v !== undefined && v !== 0)
        : [];
      const gamesSummary = gameEntries.length
        ? gameEntries.map(([k, v]) => `${k}: ${v}`).join(", ")
        : "No games played today";

      // Achievements
      const achSummary = achRows.length
        ? achRows.map(a => `"${a.title}" - ${a.description}`).join("; ")
        : "None unlocked yet";

      // Wellness trend from history
      const avgScore = historyRows.length > 0
        ? Math.round(historyRows.reduce((s, r) => s + (r.wellness_score || 0), 0) / historyRows.length)
        : null;

      // Upcoming sessions
      const sessionsInfo = upcomingSessions.length > 0
        ? upcomingSessions.map(s => `"${s.title}" (${s.session_type}, ${s.session_date} at ${s.session_time})`).join(", ")
        : "No upcoming sessions";

      // Vitals interpretation
      let vitalsAnalysis = "No recent vitals available";
      if (vitals) {
        const hr = vitals.heart_rate_bpm;
        const spo2 = vitals.blood_oxygen_percent;
        const temp = vitals.temperature_celsius;
        const hrStatus = hr > 100 ? "elevated (concerning)" : hr < 60 ? "low" : "normal";
        const spo2Status = spo2 < 94 ? "dangerously low" : spo2 < 96 ? "slightly low" : "normal";
        const tempStatus = temp > 38 ? "fever detected" : temp > 37.5 ? "slightly elevated" : "normal";
        vitalsAnalysis = `HR: ${hr} bpm (${hrStatus}), SpO₂: ${spo2}% (${spo2Status}), Temp: ${temp}°C (${tempStatus}), Movement: ${vitals.movement || "unknown"}`;
      }

      dataBlock = `
REAL-TIME USER DATA (use this to answer questions directly and naturally):

MOOD HISTORY: ${moodHistory}

VITALS (from sensor): ${vitalsAnalysis}
Last recorded: ${vitals ? new Date(vitals.recorded_at).toLocaleString() : "N/A"}

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

UPCOMING SESSIONS: ${sessionsInfo}`;
    }

    // Wellness alert context for Sera's prioritization
    let alertContext = "";
    if (!isPrivate && wellness) {
      if ((wellness.stress_level || 0) >= 7) alertContext += "\n⚠️ PRIORITY: High stress detected. Prioritize grounding/breathing.";
      if ((wellness.anxiety_level || 0) >= 7) alertContext += "\n⚠️ PRIORITY: High anxiety. Start with validation and calming.";
      if ((wellness.sleep_hours || 8) < 5) alertContext += "\n⚠️ PRIORITY: Very low sleep. Check in on their energy and mood.";
    }
    if (!isPrivate && vitals && vitals.heart_rate_bpm > 100) {
      alertContext += "\n⚠️ PRIORITY: Elevated heart rate. Guide breathing immediately.";
    }

    const systemPrompt = `You are Sera, a warm, empathetic AI mental health companion inside the Care Plus app. You are the ONLY companion — there are no human therapists in this app.

USER: ${name}
${dataBlock}
${session ? `ACTIVE SESSION: "${session.title}" (${session.session_type} session)` : "CONTEXT: General wellness chat"}
${alertContext}

YOUR RULES:
1. Be warm, caring, non-judgmental. Never cold or clinical.
2. When the user asks about their data (heart rate, sleep, score, mood, water, stress, etc.), answer DIRECTLY and SPECIFICALLY using the real data above. Never say "I don't have access to your data."
3. If Privacy Mode is on, follow privacy rules strictly — never reveal specific numbers even if asked persistently, but stay warm and never make them feel bad for asking.
4. Interpret data intelligently — don't just recite numbers. E.g. "Your heart rate is 95 bpm which is slightly elevated, let's take a breath."
5. If stress or anxiety >= 7, immediately offer a grounding or breathing technique.
6. If mood is Sad or Very Sad, validate emotionally FIRST before any advice.
7. If heart rate > 100, guide a 4-7-8 breathing exercise.
8. If wellness score is low (<40), be extra supportive and ask what's been going on.
9. Celebrate achievements and streaks genuinely when relevant.
10. Keep responses concise: 2-4 sentences unless user asks for more.
11. NEVER diagnose, prescribe, or replace professional medical care.
12. For serious/escalating mental health concerns: recommend a licensed therapist or crisis helpline.
13. If user seems in crisis: "Please contact emergency services or a crisis line immediately — you matter and help is available."
14. End most responses with a gentle question or brief grounding suggestion.
15. Reference their upcoming sessions naturally if relevant (e.g. "You have a session coming up — would you like to prepare for it?").`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 600,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const reply = response?.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ message: "Sera is unavailable right now. Please try again." });
    res.json({ reply });
  } catch (error) {
    console.log("Chat therapy error:", error?.message || error);
    if (!res.headersSent) res.status(500).json({ message: "Sera is unavailable right now. Please try again." });
  }
});

// =====================
// VOICE THERAPY CHAT (Sera) — same data awareness via backend
// =====================
app.post("/api/therapy/voice-chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { messages, session } = req.body;

    const [
      [userRows],
      [wellnessRows],
      [moodRows],
      [vitalsRows],
      [streakRows],
      [prefRows],
    ] = await Promise.all([
      db.execute("SELECT name, privacy_mode FROM users WHERE id = ?", [userId]),
      db.execute("SELECT * FROM wellness_logs WHERE user_id = ? AND log_date = CURDATE() LIMIT 1", [userId]),
      db.execute("SELECT mood_emoji, mood_text FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]),
      db.execute("SELECT heart_rate_bpm, temperature_celsius, blood_oxygen_percent, movement FROM health_monitoring WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1", [userId]),
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
      : `Mood: ${mood ? `${mood.mood_emoji} ${mood.mood_text}` : "Not logged"} | Sleep: ${wellness?.sleep_hours ?? "?"}h/${prefs?.sleep_goal ?? "8h"} goal | Water: ${wellness?.water_intake ?? "?"}L/${prefs?.water_goal ?? "2L"} goal | Stress: ${wellness?.stress_level ?? "?"}/10 | Anxiety: ${wellness?.anxiety_level ?? "?"}/10 | Energy: ${wellness?.energy_level ?? "?"}/10 | HR: ${vitals?.heart_rate_bpm ?? "?"}bpm | SpO₂: ${vitals?.blood_oxygen_percent ?? "?"}% | Temp: ${vitals?.temperature_celsius ?? "?"}°C | Streak: ${streak?.current_streak ?? 0} days`;

    const systemPrompt = `You are Sera, a warm AI voice therapist in the Care Plus app. This is a VOICE conversation.

USER: ${name}
DATA: ${dataBlock}
${session ? `SESSION: "${session.title}"` : "GENERAL voice session"}

VOICE RULES:
1. Speak in SHORT, calm sentences — max 2-3 sentences per response. This is spoken audio.
2. Use natural breathing cues when appropriate: "breathe in slowly... and out."
3. If HR > 100, guide 4-7-8 breathing immediately.
4. If stress/anxiety > 7, use grounding: "Name 5 things you can see right now."
5. NO markdown, NO bullet points, NO lists — pure natural spoken language only.
6. Speak as if sitting right beside the person.
7. End with one gentle question or short instruction.
8. If asked about data and privacy mode is OFF, answer naturally using the data.
9. For crisis: "Please call emergency services or a crisis helpline right away. I'm with you."`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const reply = response?.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ message: "Sera is unavailable." });
    res.json({ reply });
  } catch (error) {
    console.log("Voice chat error:", error?.message || error);
    if (!res.headersSent) res.status(500).json({ message: "Sera is unavailable right now." });
  }
});

// =====================
// TRANSCRIBE
// =====================
app.post("/api/therapy/transcribe", authMiddleware, uploadMemory.single("audio"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", req.file.buffer, { filename: "audio.m4a", contentType: req.file.mimetype || "audio/m4a" });
    form.append("model", "whisper-large-v3");
    form.append("language", "en");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, ...form.getHeaders() },
      body: form,
    });
    const data = await response.json();
    res.json({ transcript: data.text || "" });
  } catch (error) {
    console.log("Transcription error:", error);
    res.status(500).json({ message: "Transcription failed" });
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

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});