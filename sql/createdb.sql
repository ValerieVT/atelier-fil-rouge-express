CREATE DATABASE IF NOT EXISTS recoltes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS recolte (
`id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
`vegetable` VARCHAR(90) NOT NULL,
`date` DATE NOT NULL,
`overage` BOOL NOT NULL,
`weight_in_gramms` INTEGER NOT NULL
);