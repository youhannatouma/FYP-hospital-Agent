--------------------------------------------------
-- EXTENSION
--------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

--------------------------------------------------
-- ENUMS
--------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin','doctor','patient');
CREATE TYPE priority_level AS ENUM ('low','medium','high');
CREATE TYPE appointment_status AS ENUM ('scheduled','completed','cancelled');
CREATE TYPE payment_status AS ENUM ('pending','completed','failed','refunded');

--------------------------------------------------
-- USERS TABLE
--------------------------------------------------
CREATE TABLE usr (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    preferred_language TEXT,
    role user_role NOT NULL,
    permissions TEXT[],           -- for admins
    specialty TEXT,               -- for doctors
    license_number TEXT,          -- for doctors
    years_of_experience INTEGER,  -- for doctors
    qualifications TEXT[],        -- for doctors
    clinic_address TEXT,          -- for doctors
    date_of_birth DATE,           -- for patients
    gender TEXT,                  -- for patients
    address TEXT,                 -- for patients
    blood_type TEXT,              -- for patients
    allergies TEXT[],             -- for patients
    chronic_conditions TEXT[],    -- for patients
    emergency_contact TEXT,       -- for patients
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Role-specific constraints
ALTER TABLE usr
ADD CONSTRAINT chk_doctor_fields
CHECK ((role = 'doctor' AND specialty IS NOT NULL AND license_number IS NOT NULL) OR role != 'doctor');

ALTER TABLE usr
ADD CONSTRAINT chk_patient_dob
CHECK ((role = 'patient' AND date_of_birth IS NOT NULL) OR role != 'patient');

COMMENT ON COLUMN usr.specialty IS 'Doctor specialty; only set if role=doctor';
COMMENT ON COLUMN usr.date_of_birth IS 'Patient date of birth; only set if role=patient';

-- Index for fast login
CREATE INDEX idx_users_email ON usr(email);

--------------------------------------------------
-- UPDATED_AT TRIGGER
--------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON usr
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

--------------------------------------------------
-- AUDIT LOGS
--------------------------------------------------
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID,
    old_data JSONB,
    new_data JSONB
);

CREATE OR REPLACE FUNCTION audit_simple()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs(table_name, action, user_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        current_setting('app.current_user_id', true)::uuid,
        to_jsonb(OLD),
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE
ON usr
FOR EACH ROW
EXECUTE FUNCTION audit_simple();

--------------------------------------------------
-- SOFT DELETE TRIGGER
--------------------------------------------------
CREATE OR REPLACE FUNCTION soft_delete_usr()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usr SET deleted_at = NOW() WHERE user_id = OLD.user_id;

    -- Appointments
    UPDATE appointment SET status = 'cancelled' WHERE patient_id = OLD.user_id OR doctor_id = OLD.user_id;

    -- Payments
    UPDATE payment SET deleted_at = NOW() WHERE patient_id = OLD.user_id;

    -- Medical Records / Prescriptions
    UPDATE medical_record SET deleted_at = NOW() WHERE patient_id = OLD.user_id OR doctor_id = OLD.user_id;
    UPDATE prescription SET deleted_at = NOW() WHERE patient_id = OLD.user_id OR doctor_id = OLD.user_id;

    -- Notifications
    UPDATE notification SET deleted_at = NOW() WHERE user_id = OLD.user_id;

    -- Pharmacy assistants
    UPDATE pharmacy_assistant SET user_id = NULL WHERE user_id = OLD.user_id;

    -- Conversation sessions/messages
    UPDATE conversation_session SET status = 'closed', deleted_at = NOW() WHERE user_id = OLD.user_id;
    UPDATE message SET deleted_at = NOW() WHERE session_id IN (SELECT session_id FROM conversation_session WHERE user_id = OLD.user_id);

    RETURN NULL; -- prevent actual deletion
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_soft_delete_usr
BEFORE DELETE ON usr
FOR EACH ROW
EXECUTE FUNCTION soft_delete_usr();

--------------------------------------------------
-- TIME SLOTS
--------------------------------------------------
CREATE TABLE time_slot (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_available BOOLEAN,
    recurring_pattern TEXT,
    deleted_at TIMESTAMP
);

--------------------------------------------------
-- APPOINTMENTS
--------------------------------------------------
CREATE TABLE appointment (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES usr(user_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES usr(user_id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES time_slot(slot_id) ON DELETE CASCADE,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    appointment_type TEXT,
    fee NUMERIC CHECK (fee >= 0),   -- ensures fee can't be negative
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_appointments_patient_status ON appointment(patient_id, status) WHERE deleted_at IS NULL;

--------------------------------------------------
-- PAYMENTS
--------------------------------------------------
CREATE TABLE payment (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointment(appointment_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT,
    payment_method TEXT,
    payment_date TIMESTAMP DEFAULT NOW(),
    status payment_status DEFAULT 'pending',
    deleted_at TIMESTAMP
);

--------------------------------------------------
-- MEDICAL RECORDS
--------------------------------------------------
CREATE TABLE medical_record (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    record_type TEXT,
    diagnosis TEXT,
    treatment TEXT,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

--------------------------------------------------
-- PRESCRIPTIONS
--------------------------------------------------
CREATE TABLE prescription (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_record(record_id) ON DELETE CASCADE,
    issue_date DATE,
    expiry_date DATE,
    medications TEXT[],
    instructions TEXT,
    is_filled BOOLEAN,
    deleted_at TIMESTAMP
);

CREATE TABLE medication (
    medication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    dosage TEXT,
    frequency TEXT,
    duration INTEGER,
    instructions TEXT
);

--------------------------------------------------
-- AI / CONVERSATION
--------------------------------------------------
CREATE TABLE ai_assistant (
    assistant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usr(user_id),
    avatar_type TEXT,
    current_language TEXT,
    voice_enabled BOOLEAN,
    session_id UUID
);

CREATE TABLE conversation_session (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status TEXT,
    deleted_at TIMESTAMP
);

CREATE TABLE message (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES conversation_session(session_id) ON DELETE CASCADE,
    type TEXT,
    sender TEXT,
    content TEXT,
    is_voice BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

--------------------------------------------------
-- RAG / KNOWLEDGE
--------------------------------------------------
CREATE TABLE knowledge_base (
    kb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    domain TEXT,
    last_updated TIMESTAMP
);

CREATE TABLE medical_document (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[],
    publish_date DATE,
    source TEXT,
    relevance_score NUMERIC
);

CREATE TABLE rag_system (
    rag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_id UUID REFERENCES ai_assistant(assistant_id) ON DELETE CASCADE
);

CREATE TABLE vector_store (
    store_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rag_id UUID REFERENCES rag_system(rag_id) ON DELETE CASCADE
);

--------------------------------------------------
-- PHARMACY
--------------------------------------------------
CREATE TABLE pharmacy (
    pharmacy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    address TEXT,
    phone_number TEXT,
    opening_hours TEXT,
    open_24_hours BOOLEAN
);

CREATE TABLE pharmacy_assistant (
    assistant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES pharmacy(pharmacy_id) ON DELETE CASCADE,
    user_id UUID REFERENCES usr(user_id)
);

CREATE TABLE pharmacy_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES pharmacy(pharmacy_id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medication(medication_id) ON DELETE CASCADE,
    quantity_available INTEGER,
    price NUMERIC,
    last_updated TIMESTAMP
);

--------------------------------------------------
-- NOTIFICATIONS
--------------------------------------------------
CREATE TABLE notification (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    priority priority_level,
    deleted_at TIMESTAMP
);

--------------------------------------------------
-- VIEWS FOR ACTIVE RECORDS
--------------------------------------------------
CREATE VIEW active_users AS SELECT * FROM usr WHERE deleted_at IS NULL;
CREATE VIEW active_appointments AS SELECT * FROM appointment WHERE deleted_at IS NULL;
CREATE VIEW active_payments AS SELECT * FROM payment WHERE deleted_at IS NULL;
CREATE VIEW active_medical_records AS SELECT * FROM medical_record WHERE deleted_at IS NULL;
CREATE VIEW active_prescriptions AS SELECT * FROM prescription WHERE deleted_at IS NULL;
CREATE VIEW active_notifications AS SELECT * FROM notification WHERE deleted_at IS NULL;
