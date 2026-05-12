
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");


const app = express();

app.use(express.json());
app.use(cors());

// =====================
// MYSQL CONNECTION
// =====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "care-plus-app",
});

db.connect((err) => {
  if (err) console.log("DB ERROR:", err);
  else console.log("MYSQL CONNECTED");
});


const path = require("path");

// serve static assets folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

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
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  },
});

const upload = multer({ storage });

// =====================
// REGISTER
// =====================
app.post("/register", async (req, res) => {
const defaultProfile = "assets/images/profile.png";

  const { name, email, password, phone_number } = req.body;

  const check = "SELECT * FROM users WHERE email = ?";

  db.query(check, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, phone_number, profile_image)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword, phone_number, defaultProfile],
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Insert error" });
        }

        res.json({ message: "User registered" });
      }
    );
  });
});

// =====================
// LOGIN 
// =====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, "secret123", {
      expiresIn: "7d",
    });

res.json({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number,
    profile_image: user.profile_image, // ✅ ADD THIS
  },
});
  });
});

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
// GET USER
// =====================
app.get("/me", authMiddleware, (req, res) => {
  const sql = `
    SELECT id, name, email, phone_number, created_at, profile_image
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [req.userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    res.json(user);
  });
});




// =====================
// UPDATE PROFILE
// =====================
app.put(
  "/update-profile",
  authMiddleware,
  upload.single("profile_image"),
  (req, res) => {

    const { name, email, phone_number } = req.body;

    // STEP 1: GET OLD IMAGE
    const getOld = "SELECT profile_image FROM users WHERE id = ?";

    db.query(getOld, [req.userId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching old image" });
      }

      const oldImage = result[0]?.profile_image;

      // STEP 2: HANDLE NEW IMAGE
      let newImage = oldImage;

      if (req.file) {

        newImage = `assets/uploads/${req.file.filename}`;

        // STEP 3: DELETE OLD FILE (ONLY IF IT'S UPLOADED FILE, NOT DEFAULT)
        if (oldImage && oldImage.includes("/uploads/")) {

  const filename = oldImage.split("/uploads/")[1];

  const oldPath = path.join(
    __dirname,
    "assets",
    "uploads",
    filename
  );

  fs.unlink(oldPath, (err) => {
    if (err) {
      console.log("Old image delete error:", err.message);
    } else {
      console.log("Old image deleted:", oldPath);
    }
  });
}
      }

      // STEP 4: UPDATE USER
      const sql = `
        UPDATE users
        SET name = ?, email = ?, phone_number = ?, profile_image = ?
        WHERE id = ?
      `;

      db.query(
        sql,
        [name, email, phone_number, newImage, req.userId],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Update failed" });
          }

          res.json({
            message: "Profile updated successfully",
            profile_image: newImage,
          });
        }
      );
    });
  }
);



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

    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, req.userId],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error updating password" });
        }

        res.json({ message: "Password updated successfully" });
      }
    );

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/mood", authMiddleware, (req, res) => {
  const { mood_emoji } = req.body;

  const moodMap = {
    "😄": "Happy",
    "🙂": "Good",
    "😐": "Neutral",
    "😕": "Sad",
    "😔": "Very Sad",
  };

  const mood_text = moodMap[mood_emoji] || "Unknown";

  const sql = `
    INSERT INTO moods (user_id, mood_emoji, mood_text)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [req.userId, mood_emoji, mood_text], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error saving mood" });
    }

    res.json({ message: "Mood saved successfully" });
  });
});

// =====================
// START SERVER
// =====================
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});