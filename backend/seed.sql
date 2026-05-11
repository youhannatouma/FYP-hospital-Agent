-- Reset tables
TRUNCATE TABLE appointment, medical_record, prescription, time_slot, usr RESTART IDENTITY CASCADE;

-- Insert Admin
INSERT INTO usr (user_id, email, first_name, last_name, role, status)
VALUES (gen_random_uuid(), 'admin@hospital-care.com', 'Admin', 'System', 'admin', 'Active');

-- Insert Doctors
INSERT INTO usr (user_id, email, first_name, last_name, role, specialty, status) VALUES
(gen_random_uuid(), 'dr.ahmed.cardiology@gmail.com', 'Ahmed', 'Al-Rashid', 'doctor', 'Cardiology', 'Active'),
(gen_random_uuid(), 'dr.fatima.dermatology@gmail.com', 'Fatima', 'Hassan', 'doctor', 'Dermatology', 'Active'),
(gen_random_uuid(), 'dr.omar.orthopedics@gmail.com', 'Omar', 'Khalil', 'doctor', 'Orthopedics', 'Active'),
(gen_random_uuid(), 'dr.sarah.pediatrics@gmail.com', 'Sarah', 'Mansour', 'doctor', 'Pediatrics', 'Active'),
(gen_random_uuid(), 'dr.youssef.neurology@gmail.com', 'Youssef', 'Nabil', 'doctor', 'Neurology', 'Active'),
(gen_random_uuid(), 'dr.layla.gynecology@gmail.com', 'Layla', 'Ibrahim', 'doctor', 'Gynecology', 'Active'),
(gen_random_uuid(), 'dr.karim.surgery@gmail.com', 'Karim', 'Bakri', 'doctor', 'General Surgery', 'Active'),
(gen_random_uuid(), 'dr.nadia.internalmedicine@gmail.com', 'Nadia', 'El-Amin', 'doctor', 'Internal Medicine', 'Active');

-- Insert Patients
INSERT INTO usr (user_id, email, first_name, last_name, role, status) VALUES
(gen_random_uuid(), 'sarah.johnson@email.com', 'Sarah', 'Johnson', 'patient', 'Active'),
(gen_random_uuid(), 'mohammed.ali@email.com', 'Mohammed', 'Ali', 'patient', 'Active'),
(gen_random_uuid(), 'emily.chen@email.com', 'Emily', 'Chen', 'patient', 'Active'),
(gen_random_uuid(), 'rashid.khan@email.com', 'Rashid', 'Khan', 'patient', 'Active'),
(gen_random_uuid(), 'anna.martinez@email.com', 'Anna', 'Martinez', 'patient', 'Active');
