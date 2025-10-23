const dbConnection = require("../db/dbConfig");
async function install(req, res) {
  try {
    // 🧱 1. Create users table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        userid INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userid)
      );
    `);

    // 🧩 2. Add missing reset columns (safe to run even if columns already exist)
    try {
      await dbConnection.query(`
        ALTER TABLE users
        ADD COLUMN reset_token VARCHAR(255),
        ADD COLUMN reset_expires DATETIME;
      `);
      console.log("✅ Added reset_token and reset_expires columns");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(
          "ℹ reset_token and reset_expires already exist, skipping..."
        );
      } else {
        throw err;
      }
    }

    // 📝 3. Questions table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT NOT NULL AUTO_INCREMENT,
        questionid VARCHAR(100) NOT NULL UNIQUE,
        userid INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        tag VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
      );
    `);

    // 💬 4. Answers table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        answerid INT NOT NULL AUTO_INCREMENT,
        userid INT NOT NULL,
        questionid VARCHAR(100) NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (answerid),
        FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE,
        FOREIGN KEY (questionid) REFERENCES questions(questionid) ON DELETE CASCADE
      );
    `);

    // 👥 5. Groups table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS \`groups\` (
        groupid INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (groupid)
      );
    `);

    // 👥 6. User-Groups table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS user_groups (
        id INT NOT NULL AUTO_INCREMENT,
        userid INT NOT NULL,
        groupid INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (userid, groupid),
        FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE,
        FOREIGN KEY (groupid) REFERENCES \`groups\`(groupid) ON DELETE CASCADE
      );
    `);

    // 🌱 7. Insert sample groups
    await dbConnection.query(`
      INSERT IGNORE INTO \`groups\` (name, description)
      VALUES
        ('JavaScript Enthusiasts', 'A group for all JS lovers'),
        ('Python Devs', 'Discuss Python tips and tricks'),
        ('React Developers', 'Share React knowledge and projects'),
        ('Node.js Backend', 'All about Node.js development'),
        ('AI & Machine Learning', 'Discuss AI, ML, and Deep Learning'),
        ('Frontend Wizards', 'HTML, CSS, JS, and modern frontend frameworks'),
        ('DevOps & Cloud', 'CI/CD, cloud platforms, and deployment tips'),
        ('Cybersecurity', 'Security best practices, ethical hacking, and protection'),
        ('Mobile Developers', 'iOS, Android, and cross-platform apps'),
        ('UI/UX Designers', 'Design, prototyping, and user experience'),
        ('Gamers & Game Dev', 'Game development and gaming discussions'),
        ('Startups & Entrepreneurs', 'Share ideas and growth strategies');
    `);

    res
      .status(201)
      .json({ msg: "✅ Tables created and upgraded successfully" });
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    res.status(500).json({ msg: "Something went wrong, try again later" });
  }
}

module.exports = { install };
