CREATE TABLE division (
    division_id INT PRIMARY KEY AUTO_INCREMENT,
    division_name VARCHAR(100) NOT NULL,
    location VARCHAR(100)
);

CREATE TABLE employee (
    sl_no INT PRIMARY KEY AUTO_INCREMENT,
    emp_id VARCHAR(10) NOT NULL,
    emp_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    role VARCHAR(50),
    division_id INT,
    aadhaar VARCHAR(15),
    pan VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    salary DECIMAL(10,2),
    hire_date DATE,
    FOREIGN KEY (division_id) REFERENCES division(division_id)
);

CREATE TABLE equipment (
    equipment_id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_name VARCHAR(100),
    equipment_type VARCHAR(50),
    status VARCHAR(50),
    last_maintenance DATE
);

CREATE TABLE shift (
    shift_id INT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(50),
    start_time TIME,
    end_time TIME
);

CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id BIGINT UNIQUE NOT NULL,
    shift_id INT,
    attendance_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (emp_id) REFERENCES employee(emp_id),
    FOREIGN KEY (shift_id) REFERENCES shift(shift_id)
);

CREATE TABLE production (
    production_id INT PRIMARY KEY AUTO_INCREMENT,
    shift_id INT,
    coal_quantity DECIMAL(10,2),
    unit VARCHAR(20),
    production_date DATE,
    FOREIGN KEY (shift_id) REFERENCES shift(shift_id)
);

CREATE TABLE safety_incident (
    incident_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT,
    incident_type VARCHAR(100),
    description TEXT,
    incident_date DATE,
    severity VARCHAR(50),
    FOREIGN KEY (emp_id) REFERENCES employee(emp_id)
);

CREATE TABLE maintenance (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT,
    maintenance_date DATE,
    technician VARCHAR(100),
    remarks TEXT,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);

-- Forgot Password support
ALTER TABLE employee ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE employee ADD COLUMN reset_expires DATETIME NULL;
ALTER TABLE employee ADD COLUMN otp_attempts INT DEFAULT 3;


