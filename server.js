// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 3001;

// function extractText(data) {
//   if (typeof data.output_text === "string" && data.output_text.trim()) {
//     return data.output_text.trim();
//   }

//   const parts = [];

//   for (const item of data.output || []) {
//     if (item.type === "message") {
//       for (const content of item.content || []) {
//         if (content.type === "output_text" && content.text) {
//           parts.push(content.text);
//         }
//       }
//     }
//   }

//   return parts.join("\n").trim();
// }

// app.post("/chat", async (req, res) => {
//   try {
//     const { messages } = req.body;

//     if (!Array.isArray(messages)) {
//       return res.status(400).json({
//         error: "messages must be an array",
//       });
//     }

//     const instructions = `
// You are a calm, supportive AI wellness companion.
// Rules:
// - Keep replies short and clear.
// - Be warm and gentle.
// - Ask simple follow-up questions when helpful.
// - Do not claim to be a licensed therapist.
// - Do not provide medical diagnosis.
// - If the user mentions self-harm, suicide, or immediate danger, encourage them to contact local emergency services or a crisis hotline immediately.
//     `.trim();

//     const response = await fetch("https://api.openai.com/v1/responses", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "gpt-4.1-mini",
//         instructions,
//         input: messages.map((m) => ({
//           role: m.sender === "user" ? "user" : "assistant",
//           content: m.text,
//         })),
//         max_output_tokens: 200
//       }),
//     });

//     const data = await response.json();
//     console.log("OPENAI RAW RESPONSE:", JSON.stringify(data, null, 2));

//     if (!response.ok) {
//       return res.status(response.status).json({
//         error: data?.error?.message || "OpenAI request failed",
//       });
//     }

//     const reply = extractText(data) || "I’m here with you.";

//     return res.json({ reply });
//   } catch (error) {
//     console.error("SERVER ERROR:", error);
//     return res.status(500).json({
//       error: error?.message || "Internal server error",
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`API server running on http://localhost:${PORT}`);
// });
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

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

// =====================
// FORMAT DATE HELPER
// =====================
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
};

// =====================
// REGISTER
// =====================
app.post("/register", async (req, res) => {
  const { name, email, password, phone_number, birthdate } = req.body;

  const check = "SELECT * FROM users WHERE email = ?";

  db.query(check, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, phone_number, birthdate)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword, phone_number, birthdate],
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
// LOGIN (FIXED)
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
        birthdate: formatDate(user.birthdate), // 🔥 FIX HERE
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
// GET USER (FIXED)
// =====================
app.get("/me", authMiddleware, (req, res) => {
  const sql = `
    SELECT id, name, email, phone_number, birthdate, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [req.userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const user = result[0];

    res.json({
      ...user,
      birthdate: formatDate(user.birthdate), // 🔥 FIX HERE
    });
  });
});

// =====================
// UPDATE PROFILE (FIXED)
// =====================
app.put("/update-profile", authMiddleware, (req, res) => {
  const { name, email, phone_number, birthdate } = req.body;

  const sql = `
    UPDATE users
    SET name = ?, email = ?, phone_number = ?, birthdate = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, email, phone_number, birthdate, req.userId],
    (err) => {
      if (err) {
        console.log("UPDATE ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      res.json({ message: "Profile updated successfully" });
    }
  );
});

// =====================
// START SERVER
// =====================
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});