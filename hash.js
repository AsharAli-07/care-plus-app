const bcrypt = require("bcryptjs");

async function run() {
  const hashed = await bcrypt.hash("Qwerty786?", 10);
  console.log(hashed);
}

run();