-- Initialize database for Renewable Energy Insights Hub

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS renewable_energy_db;

-- Use the database
USE renewable_energy_db;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Create energy consumption table
CREATE TABLE IF NOT EXISTS energy_consumption (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  value_kwh FLOAT NOT NULL,
  source_type ENUM('solar', 'wind', 'hydro', 'geothermal', 'biomass', 'grid') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (timestamp),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create energy generation table
CREATE TABLE IF NOT EXISTS energy_generation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  value_kwh FLOAT NOT NULL,
  source_type ENUM('solar', 'wind', 'hydro', 'geothermal', 'biomass', 'grid') NOT NULL,
  efficiency FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX (timestamp)
);

-- Creating demo user (password: password)
INSERT INTO users (email, username, hashed_password, is_active) 
VALUES ('demo@example.com', 'demo', '$2a$12$Gq14bZE5lE.BIM0PiglV8.saNwBmYVhYEhdxhmwIoEjF18t3GNWDO', TRUE)
ON DUPLICATE KEY UPDATE id = id;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_energy_consumption_user_timestamp 
ON energy_consumption(user_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_energy_generation_timestamp 
ON energy_generation(timestamp);