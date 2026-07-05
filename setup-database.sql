-- ============================================
-- APP-FLOW-TV - Database Setup for Cloudways
-- ============================================
-- Execute no phpMyAdmin ou via MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS flowtv
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'flowtv'@'localhost'
  IDENTIFIED BY 'flowtvpassword';

GRANT ALL PRIVILEGES ON flowtv.* TO 'flowtv'@'localhost';

FLUSH PRIVILEGES;
