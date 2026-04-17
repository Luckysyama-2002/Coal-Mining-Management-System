DROP TABLE IF EXISTS `employee`;

CREATE TABLE `employee` (
  `emp_id` VARCHAR(20) NOT NULL,
  `emp_name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'manager', 'admin', 'safety_officer', 'surveyor', 'driller', 'blaster', 'excavator_operator') NOT NULL DEFAULT 'employee',
  `email` VARCHAR(255) DEFAULT NULL,
  `mobile` VARCHAR(30) DEFAULT NULL,
  `aadhaar` VARCHAR(20) DEFAULT NULL,
  `pan` VARCHAR(20) DEFAULT NULL,
  `bank_account` VARCHAR(50) DEFAULT NULL,
  `ifsc_code` VARCHAR(20) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `pincode` VARCHAR(20) DEFAULT NULL,
  `shift` VARCHAR(10) DEFAULT 'A',
  `status` VARCHAR(30) DEFAULT 'Active',
  `emergency_contact_name` VARCHAR(100) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(30) DEFAULT NULL,
  `emergency_contact_relation` VARCHAR(50) DEFAULT NULL,
  `date_of_joining` DATE DEFAULT NULL,
  `reset_token` VARCHAR(255) DEFAULT NULL,
  `reset_expires` DATETIME DEFAULT NULL,
  `otp_attempts` INT NOT NULL DEFAULT 3,
  `safety_status` ENUM('green', 'yellow', 'red') DEFAULT 'green',
  PRIMARY KEY (`emp_id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave Requests Table
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `leave_type` ENUM('sick', 'casual', 'annual', 'emergency') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `applied_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_by` VARCHAR(20) DEFAULT NULL,
  `approved_date` TIMESTAMP NULL,
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `employee`(`emp_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_date` (`start_date`),
  INDEX `idx_emp_status` (`emp_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Safety Incidents Table
DROP TABLE IF EXISTS `safety_incidents`;
CREATE TABLE `safety_incidents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `incident_type` ENUM('accident', 'near_miss', 'hazard', 'equipment_failure') NOT NULL,
  `description` TEXT NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  `location` VARCHAR(255),
  `reported_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('reported', 'investigating', 'resolved') DEFAULT 'reported',
  `assigned_to` VARCHAR(20) DEFAULT NULL,
  `resolution` TEXT,
  `resolved_date` TIMESTAMP NULL,
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `employee`(`emp_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_reported_date` (`reported_date`),
  INDEX `idx_emp_status` (`emp_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45),
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_action` (`action`),
  INDEX `idx_emp_timestamp` (`emp_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Production Audit Table
DROP TABLE IF EXISTS `production_audits`;
CREATE TABLE `production_audits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `audit_id` VARCHAR(20) NOT NULL UNIQUE,
  `sector` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `target_tons` DECIMAL(10,2) NOT NULL,
  `actual_tons` DECIMAL(10,2) NOT NULL,
  `variance_tons` DECIMAL(10,2) GENERATED ALWAYS AS (actual_tons - target_tons) STORED,
  `status` ENUM('verified', 'flagged', 'pending') DEFAULT 'pending',
  `reported_by` VARCHAR(20) NOT NULL,
  `verified_by` VARCHAR(20) DEFAULT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`reported_by`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  FOREIGN KEY (`verified_by`) REFERENCES `employee`(`emp_id`) ON DELETE SET NULL,
  INDEX `idx_date` (`date`),
  INDEX `idx_sector` (`sector`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sector_date` (`sector`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compliance Audit Table
DROP TABLE IF EXISTS `compliance_audits`;
CREATE TABLE `compliance_audits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `audit_id` VARCHAR(20) NOT NULL UNIQUE,
  `regulation` VARCHAR(255) NOT NULL,
  `check_date` DATE NOT NULL,
  `status` ENUM('passed', 'failed', 'pending') DEFAULT 'pending',
  `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `description` TEXT,
  `findings` TEXT,
  `corrective_action` TEXT,
  `due_date` DATE DEFAULT NULL,
  `assigned_to` VARCHAR(20) DEFAULT NULL,
  `completed_date` DATE DEFAULT NULL,
  `audited_by` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assigned_to`) REFERENCES `employee`(`emp_id`) ON DELETE SET NULL,
  FOREIGN KEY (`audited_by`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  INDEX `idx_check_date` (`check_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_regulation` (`regulation`),
  INDEX `idx_severity` (`status`, `severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payslips Table
DROP TABLE IF EXISTS `payslips`;
CREATE TABLE `payslips` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `basic_salary` DECIMAL(10,2) NOT NULL,
  `hra` DECIMAL(10,2) DEFAULT 0,
  `conveyance` DECIMAL(10,2) DEFAULT 0,
  `medical` DECIMAL(10,2) DEFAULT 0,
  `lta` DECIMAL(10,2) DEFAULT 0,
  `pf_employee` DECIMAL(10,2) DEFAULT 0,
  `pf_employer` DECIMAL(10,2) DEFAULT 0,
  `gratuity` DECIMAL(10,2) DEFAULT 0,
  `esi_employee` DECIMAL(10,2) DEFAULT 0,
  `esi_employer` DECIMAL(10,2) DEFAULT 0,
  `professional_tax` DECIMAL(10,2) DEFAULT 0,
  `income_tax` DECIMAL(10,2) DEFAULT 0,
  `other_deductions` DECIMAL(10,2) DEFAULT 0,
  `gross_earnings` DECIMAL(10,2) NOT NULL,
  `total_deductions` DECIMAL(10,2) NOT NULL,
  `net_pay` DECIMAL(10,2) NOT NULL,
  `generated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_payslip` (`emp_id`, `month`, `year`),
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  INDEX `idx_month_year` (`month`, `year`),
  INDEX `idx_emp_month_year` (`emp_id`, `month`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Health Checkups Table
DROP TABLE IF EXISTS `health_checkups`;
CREATE TABLE `health_checkups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `checkup_date` DATE NOT NULL,
  `checkup_type` ENUM('annual', 'pulmonary', 'routine', 'emergency') NOT NULL,
  `doctor_name` VARCHAR(100),
  `status` ENUM('scheduled', 'completed', 'missed') DEFAULT 'scheduled',
  `notes` TEXT,
  `heart_rate` VARCHAR(10),
  `blood_pressure` VARCHAR(20),
  `oxygen_saturation` VARCHAR(10),
  `body_temperature` VARCHAR(10),
  `report_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  INDEX `idx_checkup_date` (`checkup_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_emp_date` (`emp_id`, `checkup_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sensor Readings Table
DROP TABLE IF EXISTS `sensor_readings`;
CREATE TABLE `sensor_readings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `location` VARCHAR(100) NOT NULL,
  `sensor_type` ENUM('methane', 'oxygen', 'temperature', 'humidity', 'pressure') NOT NULL,
  `reading_value` DECIMAL(10, 4) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `threshold_min` DECIMAL(10, 4),
  `threshold_max` DECIMAL(10, 4),
  `status` ENUM('safe', 'warning', 'danger') DEFAULT 'safe',
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_location` (`location`),
  INDEX `idx_sensor_type` (`sensor_type`),
  INDEX `idx_recorded_at` (`recorded_at`),
  INDEX `idx_location_type_time` (`location`, `sensor_type`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Risk Zones Table
DROP TABLE IF EXISTS `risk_zones`;
CREATE TABLE `risk_zones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `zone_name` VARCHAR(100) NOT NULL UNIQUE,
  `location_description` VARCHAR(255),
  `risk_level` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `hazard_types` VARCHAR(255),
  `current_occupancy` INT DEFAULT 0,
  `max_capacity` INT NOT NULL,
  `ventilation_status` ENUM('good', 'adequate', 'poor', 'critical') DEFAULT 'adequate',
  `gas_monitoring_status` ENUM('active', 'inactive', 'calibrating') DEFAULT 'active',
  `emergency_contact` VARCHAR(20),
  `last_inspection` TIMESTAMP,
  `next_inspection` DATE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`emergency_contact`) REFERENCES `employee`(`emp_id`) ON DELETE SET NULL,
  INDEX `idx_risk_level` (`risk_level`),
  INDEX `idx_zone_name` (`zone_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PPE Compliance Table
DROP TABLE IF EXISTS `ppe_compliance`;
CREATE TABLE `ppe_compliance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `helmet` ENUM('compliant', 'non-compliant', 'expired') DEFAULT 'compliant',
  `respirator` ENUM('compliant', 'non-compliant', 'expired') DEFAULT 'compliant',
  `safety_boots` ENUM('compliant', 'non-compliant', 'expired') DEFAULT 'compliant',
  `gloves` ENUM('compliant', 'non-compliant', 'expired') DEFAULT 'compliant',
  `vest` ENUM('compliant', 'non-compliant', 'expired') DEFAULT 'compliant',
  `overall_compliance` ENUM('full', 'partial', 'non-compliant') DEFAULT 'full',
  `inspection_date` DATE DEFAULT CURRENT_DATE,
  `next_due_date` DATE,
  `inspector_id` VARCHAR(20),
  `notes` TEXT,
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  FOREIGN KEY (`inspector_id`) REFERENCES `employee`(`emp_id`) ON DELETE SET NULL,
  INDEX `idx_emp_id` (`emp_id`),
  INDEX `idx_inspection_date` (`inspection_date`),
  INDEX `idx_overall_compliance` (`overall_compliance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sensor Alerts Table
DROP TABLE IF EXISTS `sensor_alerts`;
CREATE TABLE `sensor_alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `location` VARCHAR(100) NOT NULL,
  `sensor_type` ENUM('methane', 'oxygen', 'temperature', 'humidity', 'pressure') NOT NULL,
  `alert_type` ENUM('threshold_exceeded', 'sensor_failure', 'calibration_due', 'anomaly') NOT NULL,
  `reading_value` DECIMAL(10, 4),
  `threshold_value` DECIMAL(10, 4),
  `alert_message` TEXT NOT NULL,
  `severity` ENUM('warning', 'critical') DEFAULT 'warning',
  `status` ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
  `acknowledged_by` VARCHAR(20),
  `acknowledged_at` TIMESTAMP NULL,
  `resolved_at` TIMESTAMP NULL,
  `triggered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`acknowledged_by`) REFERENCES `employee`(`emp_id`) ON DELETE SET NULL,
  INDEX `idx_location` (`location`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_status` (`status`),
  INDEX `idx_triggered_at` (`triggered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Safety Metrics Table
DROP TABLE IF EXISTS `safety_metrics`;
CREATE TABLE `safety_metrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metric_date` DATE NOT NULL UNIQUE,
  `total_incidents` INT DEFAULT 0,
  `critical_incidents` INT DEFAULT 0,
  `near_misses` INT DEFAULT 0,
  `equipment_failures` INT DEFAULT 0,
  `incidents_resolved` INT DEFAULT 0,
  `avg_sensor_methane` DECIMAL(5, 2),
  `avg_sensor_oxygen` DECIMAL(5, 2),
  `avg_sensor_temp` DECIMAL(5, 2),
  `alert_count` INT DEFAULT 0,
  `critical_alert_count` INT DEFAULT 0,
  `ppe_compliance_rate` DECIMAL(5, 2) DEFAULT 100,
  `lost_time_injuries` INT DEFAULT 0,
  `days_without_lti` INT DEFAULT 0,
  `ventilation_downtime_hours` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_metric_date` (`metric_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shifts Table
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `shift_date` DATE NOT NULL,
  `shift_type` ENUM('A', 'B', 'C') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `supervisor_id` VARCHAR(20),
  `zone` VARCHAR(100),
  `status` ENUM('assigned', 'completed', 'cancelled') DEFAULT 'assigned',
  `notes` TEXT,
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  FOREIGN KEY (`supervisor_id`) REFERENCES `employee`(`emp_id`),
  INDEX `idx_shift_date` (`shift_date`),
  INDEX `idx_emp_shift_date` (`emp_id`, `shift_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Table
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(20) NOT NULL,
  `date` DATE NOT NULL,
  `check_in` TIME,
  `check_out` TIME,
  `hours_worked` DECIMAL(5,2) DEFAULT 0,
  `status` ENUM('present', 'absent', 'late', 'half_day', 'on_leave') DEFAULT 'present',
  `shift_type` ENUM('A', 'B', 'C'),
  `notes` TEXT,
  `recorded_by` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_attendance` (`emp_id`, `date`),
  FOREIGN KEY (`emp_id`) REFERENCES `employee`(`emp_id`) ON DELETE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `employee`(`emp_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_emp_date` (`emp_id`, `date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Passwords must be hashed before insertion. Use the backend application or a hashing tool to seed users.

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample employees (passwords are hashed versions of 'password123')
INSERT INTO `employee` (`emp_id`, `emp_name`, `password`, `role`, `email`, `mobile`, `aadhaar`, `pan`, `bank_account`, `ifsc_code`, `city`, `state`, `country`, `pincode`, `shift`, `status`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `date_of_joining`, `safety_status`) VALUES
('MGR-102', 'Vikram Rathore', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'vikram.rathore@coalmine.com', '+919876543210', '123456789012', 'ABCDE1234F', '1234567890', 'SBI0000123', 'Dhanbad', 'Jharkhand', 'India', '826001', 'A', 'Active', 'Sunita Rathore', '+919876543211', 'Spouse', '2020-01-15', 'green'),
('SO-001', 'Arjun Sharma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'safety_officer', 'arjun.sharma@coalmine.com', '+919876543212', '123456789013', 'ABCDE1234G', '1234567891', 'SBI0000124', 'Dhanbad', 'Jharkhand', 'India', '826001', 'A', 'Active', 'Priya Sharma', '+919876543213', 'Spouse', '2019-06-10', 'green'),
('CM-4092', 'Rajesh Kumar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'excavator_operator', 'rajesh.kumar@coalmine.com', '+919876543214', '123456789014', 'ABCDE1234H', '1234567892', 'SBI0000125', 'Dhanbad', 'Jharkhand', 'India', '826001', 'A', 'Active', 'Sunita Kumar', '+919876543215', 'Spouse', '2023-05-10', 'green'),
('CM-3310', 'Suresh Mehta', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driller', 'suresh.mehta@coalmine.com', '+919876543216', '123456789015', 'ABCDE1234I', '1234567893', 'SBI0000126', 'Dhanbad', 'Jharkhand', 'India', '826001', 'B', 'Active', 'Kavita Mehta', '+919876543217', 'Spouse', '2022-03-20', 'yellow'),
('CM-2021', 'Amit Verma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'blaster', 'amit.verma@coalmine.com', '+919876543218', '123456789016', 'ABCDE1234J', '1234567894', 'SBI0000127', 'Dhanbad', 'Jharkhand', 'India', '826001', 'C', 'Active', 'Rekha Verma', '+919876543219', 'Spouse', '2021-11-05', 'green'),
('CM-5501', 'Deepak Singh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'surveyor', 'deepak.singh@coalmine.com', '+919876543220', '123456789017', 'ABCDE1234K', '1234567895', 'SBI0000128', 'Dhanbad', 'Jharkhand', 'India', '826001', 'A', 'Active', 'Meera Singh', '+919876543221', 'Spouse', '2020-08-15', 'green'),
('CM-7789', 'Ravi Patel', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 'ravi.patel@coalmine.com', '+919876543222', '123456789018', 'ABCDE1234L', '1234567896', 'SBI0000129', 'Dhanbad', 'Jharkhand', 'India', '826001', 'B', 'Active', 'Anita Patel', '+919876543223', 'Spouse', '2024-01-10', 'red');

-- Insert sample shifts
INSERT INTO `shifts` (`emp_id`, `shift_date`, `shift_type`, `start_time`, `end_time`, `supervisor_id`, `zone`, `status`, `notes`) VALUES
('CM-4092', '2024-12-01', 'A', '08:00:00', '16:00:00', 'MGR-102', 'Sector 7 - Underground', 'completed', 'Regular shift'),
('CM-4092', '2024-12-02', 'A', '08:00:00', '16:00:00', 'MGR-102', 'Sector 7 - Underground', 'completed', 'Regular shift'),
('CM-4092', '2024-12-03', 'B', '00:00:00', '08:00:00', 'MGR-102', 'Sector 7 - Underground', 'completed', 'Night shift'),
('CM-3310', '2024-12-01', 'B', '00:00:00', '08:00:00', 'MGR-102', 'Sector 4 - Surface', 'completed', 'Night shift'),
('CM-3310', '2024-12-02', 'B', '00:00:00', '08:00:00', 'MGR-102', 'Sector 4 - Surface', 'completed', 'Night shift'),
('CM-2021', '2024-12-01', 'C', '16:00:00', '00:00:00', 'MGR-102', 'Sector 3 - Blasting Zone', 'completed', 'Evening shift'),
('CM-2021', '2024-12-02', 'C', '16:00:00', '00:00:00', 'MGR-102', 'Sector 3 - Blasting Zone', 'completed', 'Evening shift'),
('CM-5501', '2024-12-01', 'A', '08:00:00', '16:00:00', 'MGR-102', 'Sector 1 - Survey Area', 'completed', 'Regular shift'),
('CM-7789', '2024-12-01', 'B', '00:00:00', '08:00:00', 'MGR-102', 'Sector 2 - Maintenance', 'completed', 'Night shift');

-- Insert sample attendance
INSERT INTO `attendance` (`emp_id`, `date`, `check_in`, `check_out`, `hours_worked`, `status`, `shift_type`, `notes`, `recorded_by`) VALUES
('CM-4092', '2024-12-01', '07:55:00', '16:05:00', 8.17, 'present', 'A', 'On time', 'MGR-102'),
('CM-4092', '2024-12-02', '08:02:00', '16:10:00', 8.13, 'late', 'A', '2 minutes late', 'MGR-102'),
('CM-3310', '2024-12-01', '23:58:00', '08:02:00', 8.07, 'present', 'B', 'On time', 'MGR-102'),
('CM-2021', '2024-12-01', '15:55:00', '00:05:00', 8.17, 'present', 'C', 'On time', 'MGR-102'),
('CM-5501', '2024-12-01', '07:50:00', '16:00:00', 8.17, 'present', 'A', 'Early arrival', 'MGR-102'),
('CM-7789', '2024-12-01', '23:55:00', '08:00:00', 8.08, 'present', 'B', 'On time', 'MGR-102');

-- Insert sample health checkups
INSERT INTO `health_checkups` (`emp_id`, `checkup_date`, `checkup_type`, `doctor_name`, `status`, `notes`, `heart_rate`, `blood_pressure`, `oxygen_saturation`, `body_temperature`, `report_url`) VALUES
('CM-4092', '2024-10-12', 'annual', 'Dr. A. Sharma', 'completed', 'Cleared for duty', '72', '120/80', '98', '36.6', 'https://example.com/reports/4092-2024-10.pdf'),
('CM-4092', '2024-09-15', 'routine', 'Dr. R. Patel', 'completed', 'Minor issue - Rest recommended', '75', '125/82', '97', '36.8', 'https://example.com/reports/4092-2024-09.pdf'),
('CM-4092', '2024-11-15', 'pulmonary', 'Dr. S. Gupta', 'scheduled', 'Dust exposure monitoring', NULL, NULL, NULL, NULL, NULL),
('CM-4092', '2024-12-10', 'annual', 'Dr. M. Jain', 'scheduled', 'Full body and fitness certification', NULL, NULL, NULL, NULL, NULL),
('CM-3310', '2024-10-20', 'annual', 'Dr. P. Kumar', 'completed', 'Fit for duty', '68', '118/78', '99', '36.4', 'https://example.com/reports/3310-2024-10.pdf'),
('CM-2021', '2024-09-25', 'annual', 'Dr. L. Singh', 'completed', 'Cleared for blasting operations', '70', '122/80', '98', '36.5', 'https://example.com/reports/2021-2024-09.pdf'),
('CM-5501', '2024-11-01', 'routine', 'Dr. N. Reddy', 'completed', 'Good health condition', '65', '115/75', '99', '36.2', 'https://example.com/reports/5501-2024-11.pdf');

-- Insert sample payslips
INSERT INTO `payslips` (`emp_id`, `month`, `year`, `basic_salary`, `hra`, `conveyance`, `medical`, `lta`, `pf_employee`, `pf_employer`, `gratuity`, `esi_employee`, `esi_employer`, `professional_tax`, `income_tax`, `other_deductions`, `gross_earnings`, `total_deductions`, `net_pay`) VALUES
('CM-4092', 11, 2024, 25000.00, 5000.00, 1920.00, 1250.00, 2000.00, 3000.00, 780.00, 375.00, 237.50, 78.13, 235.00, 1250.00, 0.00, 32420.00, 6930.50, 25489.50),
('CM-4092', 10, 2024, 25000.00, 5000.00, 1920.00, 1250.00, 2000.00, 3000.00, 780.00, 375.00, 237.50, 78.13, 235.00, 1200.00, 0.00, 32420.00, 6930.50, 25489.50),
('CM-3310', 11, 2024, 28000.00, 5600.00, 1920.00, 1400.00, 2240.00, 3360.00, 873.60, 420.00, 266.00, 87.36, 280.00, 1400.00, 0.00, 36360.00, 7687.32, 28672.68),
('CM-2021', 11, 2024, 30000.00, 6000.00, 1920.00, 1500.00, 2400.00, 3600.00, 936.00, 450.00, 285.00, 93.60, 300.00, 1800.00, 0.00, 38820.00, 8464.60, 30355.40),
('CM-5501', 11, 2024, 32000.00, 6400.00, 1920.00, 1600.00, 2560.00, 3840.00, 998.40, 480.00, 304.00, 99.84, 320.00, 1920.00, 0.00, 41480.00, 9182.24, 32297.76),
('CM-7789', 11, 2024, 22000.00, 4400.00, 1920.00, 1100.00, 1760.00, 2640.00, 686.40, 330.00, 209.00, 68.64, 220.00, 880.00, 0.00, 29180.00, 6033.04, 23146.96);

-- Insert sample leave requests
INSERT INTO `leave_requests` (`emp_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `approved_by`) VALUES
('CM-4092', 'annual', '2024-12-20', '2024-12-25', 'Family vacation', 'pending', NULL),
('CM-3310', 'sick', '2024-11-15', '2024-11-16', 'Fever and cold', 'approved', 'MGR-102'),
('CM-2021', 'casual', '2024-12-05', '2024-12-06', 'Personal work', 'approved', 'MGR-102'),
('CM-5501', 'annual', '2024-12-15', '2024-12-20', 'Marriage ceremony', 'pending', NULL);

-- Insert sample safety incidents
INSERT INTO `safety_incidents` (`emp_id`, `incident_type`, `description`, `severity`, `location`, `status`, `assigned_to`, `resolution`) VALUES
('CM-4092', 'near_miss', 'Excavator operator noticed unstable rock formation during digging', 'medium', 'Sector 7 - Underground Level 3', 'resolved', 'SO-001', 'Area secured and additional support beams installed. Employee retrained on hazard recognition.'),
('CM-3310', 'equipment_failure', 'Drilling machine motor overheated and shut down', 'high', 'Sector 4 - Surface Drilling Site', 'investigating', 'SO-001', NULL),
('CM-2021', 'hazard', 'Improper storage of explosives near working area', 'critical', 'Sector 3 - Blasting Zone', 'resolved', 'SO-001', 'Explosives moved to designated secure storage. Safety protocols reviewed with all blasting team members.'),
('CM-7789', 'accident', 'Minor injury from slipping on wet surface', 'low', 'Sector 2 - Maintenance Workshop', 'resolved', 'SO-001', 'Warning signs placed in wet areas. Anti-slip mats ordered for high-risk zones.');

-- Insert sample audit logs
INSERT INTO `audit_logs` (`emp_id`, `action`, `details`, `ip_address`) VALUES
('MGR-102', 'LOGIN', 'Manager login successful', '192.168.1.100'),
('SO-001', 'LOGIN', 'Safety officer login successful', '192.168.1.101'),
('CM-4092', 'LOGIN', 'Employee login successful', '192.168.1.102'),
('MGR-102', 'EMPLOYEE_CREATE', 'Created new employee CM-7789', '192.168.1.100'),
('MGR-102', 'LEAVE_APPROVE', 'Approved leave request ID 2 for CM-3310', '192.168.1.100'),
('SO-001', 'INCIDENT_LOG', 'Logged safety incident ID 1', '192.168.1.101'),
('SO-001', 'INCIDENT_RESOLVE', 'Resolved safety incident ID 1', '192.168.1.101'),
('CM-4092', 'LEAVE_REQUEST', 'Submitted leave request for annual leave', '192.168.1.102');

-- Insert sample production audits
INSERT INTO `production_audits` (`audit_id`, `sector`, `date`, `target_tons`, `actual_tons`, `status`, `reported_by`, `verified_by`, `notes`) VALUES
('AUD-001', 'North Face', '2026-03-20', 150.00, 142.00, 'verified', 'CM-4092', 'MGR-102', 'Weather conditions affected production'),
('AUD-002', 'East Shaft', '2026-03-19', 200.00, 210.00, 'verified', 'CM-3310', 'MGR-102', 'Exceeded target due to efficient operations'),
('AUD-003', 'Sector 7', '2026-03-18', 120.00, 80.00, 'flagged', 'CM-2021', 'MGR-102', 'Equipment maintenance required'),
('AUD-004', 'Sector 4', '2026-03-17', 180.00, 175.00, 'verified', 'CM-5501', 'MGR-102', 'Slight shortfall due to material quality'),
('AUD-005', 'Blasting Zone', '2026-03-16', 160.00, 168.00, 'verified', 'CM-2021', 'MGR-102', 'Good blasting efficiency');

-- Insert sample compliance audits
INSERT INTO `compliance_audits` (`audit_id`, `regulation`, `check_date`, `status`, `severity`, `description`, `findings`, `corrective_action`, `due_date`, `audited_by`) VALUES
('COMP-001', 'DGMS Safety Standards 2026', '2026-03-15', 'passed', 'low', 'Annual safety compliance check', 'All safety protocols followed', NULL, NULL, 'SO-001'),
('COMP-002', 'Environmental Protection Act 2025', '2026-03-10', 'passed', 'medium', 'Environmental impact assessment', 'Dust control measures effective', NULL, NULL, 'SO-001'),
('COMP-003', 'Mine Workers Health Regulations', '2026-03-05', 'failed', 'high', 'Health and safety equipment inspection', 'Missing emergency showers in Sector 3', 'Install emergency showers and eye wash stations', '2026-04-15', 'SO-001'),
('COMP-004', 'Explosives Handling Guidelines', '2026-02-28', 'passed', 'critical', 'Explosives storage and handling audit', 'Proper storage and handling procedures followed', NULL, NULL, 'SO-001'),
('COMP-005', 'Electrical Safety Standards', '2026-02-20', 'pending', 'medium', 'Electrical equipment safety check', 'Scheduled for next week', NULL, '2026-03-30', 'SO-001');
-- Insert sample sensor readings
INSERT INTO `sensor_readings` (`location`, `sensor_type`, `reading_value`, `unit`, `threshold_min`, `threshold_max`, `status`) VALUES
('Sector 1 - Survey Area', 'methane', 0.032, 'ppm', 0.0, 0.75, 'safe'),
('Sector 1 - Survey Area', 'oxygen', 20.8, '%', 19.5, 23.5, 'safe'),
('Sector 1 - Survey Area', 'temperature', 26.5, '°C', 15.0, 38.0, 'safe'),
('Sector 2 - Maintenance', 'methane', 0.056, 'ppm', 0.0, 0.75, 'safe'),
('Sector 2 - Maintenance', 'oxygen', 20.9, '%', 19.5, 23.5, 'safe'),
('Sector 2 - Maintenance', 'temperature', 28.2, '°C', 15.0, 38.0, 'safe'),
('Sector 3 - Blasting Zone', 'methane', 0.18, 'ppm', 0.0, 0.75, 'warning'),
('Sector 3 - Blasting Zone', 'oxygen', 20.5, '%', 19.5, 23.5, 'safe'),
('Sector 3 - Blasting Zone', 'temperature', 32.1, '°C', 15.0, 38.0, 'warning'),
('Sector 4 - Surface', 'methane', 0.042, 'ppm', 0.0, 0.75, 'safe'),
('Sector 4 - Surface', 'oxygen', 21.0, '%', 19.5, 23.5, 'safe'),
('Sector 4 - Surface', 'temperature', 24.5, '°C', 15.0, 38.0, 'safe'),
('Sector 7 - Underground', 'methane', 0.089, 'ppm', 0.0, 0.75, 'safe'),
('Sector 7 - Underground', 'oxygen', 20.7, '%', 19.5, 23.5, 'safe'),
('Sector 7 - Underground', 'temperature', 29.8, '°C', 15.0, 38.0, 'safe');

-- Insert sample risk zones
INSERT INTO `risk_zones` (`zone_name`, `location_description`, `risk_level`, `hazard_types`, `current_occupancy`, `max_capacity`, `ventilation_status`, `gas_monitoring_status`, `emergency_contact`, `last_inspection`, `next_inspection`, `notes`) VALUES
('Sector 1 - Survey Area', 'Survey operations zone with low ground excavation', 'low', 'dust, noise', 5, 20, 'good', 'active', 'SO-001', NOW(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Well ventilated area'),
('Sector 2 - Maintenance', 'Equipment maintenance and repair workshop', 'medium', 'electrical, noise, dust', 8, 25, 'adequate', 'active', 'SO-001', NOW(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Regular maintenance area'),
('Sector 3 - Blasting Zone', 'High-risk blasting operations area', 'critical', 'explosives, methane, flying debris', 3, 10, 'critical', 'active', 'SO-001', NOW(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Restricted access zone - requires special authorization'),
('Sector 4 - Surface', 'Open pit surface mining operations', 'medium', 'dust, noise, moving equipment', 12, 30, 'adequate', 'active', 'SO-001', NOW(), DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'Standard mining operations'),
('Sector 7 - Underground', 'Underground mining operations at Level 3', 'high', 'methane, hypoxia, roof collapse', 6, 15, 'adequate', 'active', 'SO-001', NOW(), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'Deep operations - constant monitoring required');

-- Insert sample PPE compliance
INSERT INTO `ppe_compliance` (`emp_id`, `helmet`, `respirator`, `safety_boots`, `gloves`, `vest`, `overall_compliance`, `next_due_date`, `inspector_id`, `notes`) VALUES
('CM-4092', 'compliant', 'compliant', 'compliant', 'compliant', 'compliant', 'full', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'SO-001', 'All PPE items in good condition'),
('CM-3310', 'compliant', 'expired', 'compliant', 'compliant', 'compliant', 'partial', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'SO-001', 'Respirator expired on 2026-03-15, needs replacement'),
('CM-2021', 'compliant', 'compliant', 'compliant', 'compliant', 'compliant', 'full', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'SO-001', 'All items compliant and certified'),
('CM-5501', 'compliant', 'compliant', 'non-compliant', 'compliant', 'compliant', 'partial', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'SO-001', 'Safety boots worn out - replacement required'),
('CM-7789', 'non-compliant', 'compliant', 'compliant', 'compliant', 'compliant', 'partial', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'SO-001', 'Helmet damaged - immediate replacement needed');

-- Insert sample sensor alerts
INSERT INTO `sensor_alerts` (`location`, `sensor_type`, `alert_type`, `reading_value`, `threshold_value`, `alert_message`, `severity`, `status`, `triggered_at`) VALUES
('Sector 3 - Blasting Zone', 'methane', 'threshold_exceeded', 0.78, 0.75, 'Methane level exceeded safe threshold in Blasting Zone', 'critical', 'active', NOW()),
('Sector 3 - Blasting Zone', 'temperature', 'threshold_exceeded', 39.2, 38.0, 'Temperature exceeds maximum safe limit in Blasting Zone', 'warning', 'active', NOW()),
('Sector 7 - Underground', 'sensor_failure', 'sensor_failure', NULL, NULL, 'Oxygen sensor malfunction detected in Underground Sector 7', 'critical', 'active', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('Sector 2 - Maintenance', 'methane', 'anomaly', 0.12, 0.05, 'Unusual methane spike detected in Maintenance workshop', 'warning', 'acknowledged', DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Insert sample safety metrics
INSERT INTO `safety_metrics` (`metric_date`, `total_incidents`, `critical_incidents`, `near_misses`, `equipment_failures`, `incidents_resolved`, `avg_sensor_methane`, `avg_sensor_oxygen`, `avg_sensor_temp`, `alert_count`, `critical_alert_count`, `ppe_compliance_rate`, `lost_time_injuries`, `days_without_lti`) VALUES
('2026-04-15', 4, 1, 2, 1, 3, 0.098, 20.78, 28.2, 4, 2, 98.6, 0, 142),
('2026-04-14', 2, 0, 1, 1, 2, 0.074, 20.82, 27.5, 2, 0, 98.8, 0, 141),
('2026-04-13', 3, 1, 1, 1, 2, 0.112, 20.65, 29.1, 5, 3, 98.0, 1, 0),
('2026-04-12', 1, 0, 1, 0, 1, 0.056, 20.91, 26.8, 1, 0, 99.2, 0, 139);