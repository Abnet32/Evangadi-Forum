-- Production database setup for Evangadi Forum
-- Run this script after creating your MySQL database

-- Create database (run this manually in your database console)
-- CREATE DATABASE evangadi_forum;

-- Use the database
USE evangadi_forum;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    userid INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) NULL,
    reset_expires TIMESTAMP NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    questionid INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    answerid INT PRIMARY KEY AUTO_INCREMENT,
    questionid INT NOT NULL,
    userid INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionid) REFERENCES questions(questionid) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    groupid INT PRIMARY KEY AUTO_INCREMENT,
    groupname VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default groups
INSERT IGNORE INTO groups (groupname, description) VALUES
('General Discussion', 'General questions and discussions'),
('Programming', 'Programming related questions'),
('Web Development', 'Frontend and backend development'),
('Database', 'Database design and queries'),
('AI & Machine Learning', 'Artificial Intelligence and ML topics');

-- Create indexes for better performance
CREATE INDEX idx_questions_userid ON questions(userid);
CREATE INDEX idx_answers_questionid ON answers(questionid);
CREATE INDEX idx_answers_userid ON answers(userid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reset_token ON users(reset_token);
