CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

CREATE TABLE usr (
    user_id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    preferred_language TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);


CREATE TABLE admin (
    admin_id UUID PRIMARY KEY,
    user_id UUID REFERENCES usr(user_id) ON DELETE SET NULL,
    role TEXT DEFAULT 'admin',
    permissions TEXT[],   -- example: {'manage_users','view_reports','system_config'}
    created_at TIMESTAMP
);


CREATE TABLE doctor (
    doctor_id UUID PRIMARY KEY,
    user_id UUID REFERENCES usr(user_id) ON DELETE SET NULL,
    specialty TEXT,
    license_number TEXT,
    years_of_experience INTEGER,
    qualifications TEXT[],
    clinic_address TEXT,
    availability BOOLEAN,
    consultation_fee NUMERIC
);

CREATE TABLE patient (
    patient_id UUID PRIMARY KEY,
    user_id UUID REFERENCES usr(user_id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact TEXT
);

--------------------------------------------------
-- AI / MATCHING
--------------------------------------------------

CREATE TABLE ai_assistant (
    assistant_id UUID PRIMARY KEY,
    avatar_type TEXT,
    current_language TEXT,
    voice_enabled BOOLEAN,
    session_id UUID
);

CREATE TABLE doctor_matcher (
    matcher_id UUID PRIMARY KEY
);

CREATE TABLE symptom (
    symptom_id UUID PRIMARY KEY,
    name TEXT,
    description TEXT,
    severity INTEGER,
    related_specialties TEXT[]
);

--------------------------------------------------
-- CONVERSATION
--------------------------------------------------

CREATE TABLE conversation_session (
    session_id UUID PRIMARY KEY,
    user_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status TEXT
);

CREATE TABLE message (
    message_id UUID PRIMARY KEY,
    session_id UUID REFERENCES conversation_session(session_id) ON DELETE CASCADE,
    type TEXT,
    sender TEXT,
    content TEXT,
    is_voice BOOLEAN,
    created_at TIMESTAMP
);

--------------------------------------------------
-- RAG / KNOWLEDGE
--------------------------------------------------

CREATE TABLE knowledge_base (
    kb_id UUID PRIMARY KEY,
    name TEXT,
    domain TEXT,
    last_updated TIMESTAMP
);

CREATE TABLE medical_document (
    document_id UUID PRIMARY KEY,
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[],
    publish_date DATE,
    source TEXT,
    relevance_score NUMERIC
);

CREATE TABLE rag_system (
    rag_id UUID PRIMARY KEY,
    assistant_id UUID REFERENCES ai_assistant(assistant_id) ON DELETE CASCADE
);

CREATE TABLE vector_store (
    store_id UUID PRIMARY KEY,
    rag_id UUID REFERENCES rag_system(rag_id) ON DELETE CASCADE

);
--------------------------------------------------
-- DOCUMENT PROCESSING
--------------------------------------------------

CREATE TABLE document_processor (
    processor_id UUID PRIMARY KEY
);

CREATE TABLE ocr_engine (
    engine_id UUID PRIMARY KEY
);

CREATE TABLE document_analyzer (
    analyzer_id UUID PRIMARY KEY
);

CREATE TABLE medical_record (
    record_id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patient(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    record_type TEXT,
    diagnosis TEXT,
    treatment TEXT,
    attachments TEXT[],
    created_at TIMESTAMP
);

--------------------------------------------------
-- APPOINTMENTS
--------------------------------------------------

CREATE TABLE specialty (
    specialty_id UUID PRIMARY KEY,
    name TEXT,
    description TEXT,
    common_conditions TEXT[],
    keywords TEXT[]
);

CREATE TABLE time_slot (
    slot_id UUID PRIMARY KEY,
    doctor_id UUID REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_available BOOLEAN,
    recurring_pattern TEXT
);

CREATE TABLE appointment (
    appointment_id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patient(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    slot_id UUID REFERENCES time_slot(slot_id) ON DELETE CASCADE,
    status TEXT,
    appointment_type TEXT,
    fee NUMERIC
);

--------------------------------------------------
-- PAYMENTS
--------------------------------------------------

CREATE TABLE payment (
    payment_id UUID PRIMARY KEY,
    appointment_id UUID REFERENCES appointment(appointment_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patient(patient_id) ON DELETE CASCADE,
    amount NUMERIC,
    currency TEXT,
    payment_method TEXT,
    payment_date TIMESTAMP,
    status TEXT
);

--------------------------------------------------
-- PRESCRIPTIONS / PHARMACY
--------------------------------------------------

CREATE TABLE prescription (
    prescription_id UUID PRIMARY KEY,
    doctor_id UUID REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patient(patient_id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_record(record_id) ON DELETE CASCADE,
    issue_date DATE,
    expiry_date DATE,
    medications TEXT[],
    instructions TEXT,
    is_filled BOOLEAN
);

CREATE TABLE medication (
    medication_id UUID PRIMARY KEY,
    name TEXT,
    dosage TEXT,
    frequency TEXT,
    duration INTEGER,
    instructions TEXT
);

CREATE TABLE pharmacy (
    pharmacy_id UUID PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone_number TEXT,
    opening_hours TEXT,
    open_24_hours BOOLEAN
);

CREATE TABLE pharmacy_assistant (
    assistant_id UUID PRIMARY KEY,
    pharmacy_id UUID REFERENCES pharmacy(pharmacy_id) ON DELETE CASCADE 
);

CREATE TABLE pharmacy_inventory (
    inventory_id UUID PRIMARY KEY,
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
    notification_id UUID PRIMARY KEY,
    user_id UUID REFERENCES usr(user_id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP,
    priority priority_level
);

-- Partial unique indexes to enforce uniqueness on non-NULL user_ids
CREATE UNIQUE INDEX idx_admin_user_id_unique ON admin(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_doctor_user_id_unique ON doctor(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_patient_user_id_unique ON patient(user_id) WHERE user_id IS NOT NULL;