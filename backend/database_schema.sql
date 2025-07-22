-- MoveSmart KE System Database Schema
-- PostgreSQL Database Tables Created by Django Migrations
-- Database: neondb on Neon.tech
-- Connection: ep-polished-bar-af8nzrfo-pooler.c-2.us-west-2.aws.neon.tech

-- =============================================================================
-- DJANGO CORE TABLES
-- =============================================================================

-- Django admin log entries
CREATE TABLE IF NOT EXISTS django_admin_log (
    id SERIAL PRIMARY KEY,
    action_time TIMESTAMPTZ NOT NULL,
    object_id TEXT,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
    change_message TEXT NOT NULL,
    content_type_id INTEGER,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (content_type_id) REFERENCES django_content_type (id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (user_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
);

-- Django content types
CREATE TABLE IF NOT EXISTS django_content_type (
    id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE (app_label, model)
);

-- Django migrations tracking
CREATE TABLE IF NOT EXISTS django_migrations (
    id SERIAL PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied TIMESTAMPTZ NOT NULL
);

-- Django sessions
CREATE TABLE IF NOT EXISTS django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date TIMESTAMPTZ NOT NULL
);

-- =============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- =============================================================================

-- Users table (Django built-in)
CREATE TABLE IF NOT EXISTS auth_user (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMPTZ,
    is_superuser BOOLEAN NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    date_joined TIMESTAMPTZ NOT NULL
);

-- Groups for user permissions
CREATE TABLE IF NOT EXISTS auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

-- User groups relationship
CREATE TABLE IF NOT EXISTS auth_user_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    UNIQUE (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (group_id) REFERENCES auth_group (id) DEFERRABLE INITIALLY DEFERRED
);

-- Permissions
CREATE TABLE IF NOT EXISTS auth_permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER NOT NULL,
    codename VARCHAR(100) NOT NULL,
    UNIQUE (content_type_id, codename),
    FOREIGN KEY (content_type_id) REFERENCES django_content_type (id) DEFERRABLE INITIALLY DEFERRED
);

-- Group permissions
CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    UNIQUE (group_id, permission_id),
    FOREIGN KEY (group_id) REFERENCES auth_group (id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permission_id) REFERENCES auth_permission (id) DEFERRABLE INITIALLY DEFERRED
);

-- User permissions
CREATE TABLE IF NOT EXISTS auth_user_user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    UNIQUE (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permission_id) REFERENCES auth_permission (id) DEFERRABLE INITIALLY DEFERRED
);

-- DRF Authentication tokens
CREATE TABLE IF NOT EXISTS authtoken_token (
    key VARCHAR(40) PRIMARY KEY,
    created TIMESTAMPTZ NOT NULL,
    user_id INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
);

-- =============================================================================
-- TRAFFIC MANAGEMENT SYSTEM TABLES
-- =============================================================================

-- Traffic data collection
CREATE TABLE IF NOT EXISTS traffic_trafficdata (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    density VARCHAR(20) NOT NULL DEFAULT 'medium',
    flow VARCHAR(20) NOT NULL DEFAULT 'smooth',
    speed DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT traffic_trafficdata_density_check CHECK (
        density IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT traffic_trafficdata_flow_check CHECK (
        flow IN ('smooth', 'moderate', 'congested', 'gridlock')
    )
);

-- Traffic predictions using AI/ML
CREATE TABLE IF NOT EXISTS traffic_trafficprediction (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    predicted_density VARCHAR(20) NOT NULL,
    predicted_flow VARCHAR(20) NOT NULL,
    predicted_speed DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    prediction_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT traffic_trafficprediction_predicted_density_check CHECK (
        predicted_density IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT traffic_trafficprediction_predicted_flow_check CHECK (
        predicted_flow IN ('smooth', 'moderate', 'congested', 'gridlock')
    )
);

-- Route management
CREATE TABLE IF NOT EXISTS traffic_route (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_latitude DECIMAL(10, 7) NOT NULL,
    start_longitude DECIMAL(10, 7) NOT NULL,
    end_latitude DECIMAL(10, 7) NOT NULL,
    end_longitude DECIMAL(10, 7) NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    estimated_time INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI-generated traffic reports
CREATE TABLE IF NOT EXISTS traffic_trafficreport (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(20) NOT NULL DEFAULT 'location',
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    traffic_data JSONB NOT NULL,
    ai_analysis TEXT NOT NULL,
    ai_recommendations TEXT NOT NULL,
    congestion_level INTEGER NOT NULL,
    avg_speed DOUBLE PRECISION NOT NULL,
    incident_count INTEGER NOT NULL,
    user_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT traffic_trafficreport_report_type_check CHECK (
        report_type IN ('location', 'route', 'city')
    ),
    FOREIGN KEY (user_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
);

-- =============================================================================
-- INCIDENT MANAGEMENT SYSTEM TABLES
-- =============================================================================

-- Traffic incidents reporting
CREATE TABLE IF NOT EXISTS incidents_incident (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    reported_by_id INTEGER,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT incidents_incident_incident_type_check CHECK (
        incident_type IN ('accident', 'construction', 'road_closure', 'weather', 'event', 'breakdown', 'other')
    ),
    CONSTRAINT incidents_incident_severity_check CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT incidents_incident_status_check CHECK (
        status IN ('active', 'resolved', 'pending')
    ),
    FOREIGN KEY (reported_by_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
);

-- Incident comments/updates
CREATE TABLE IF NOT EXISTS incidents_incidentcomment (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    incident_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents_incident (id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (user_id) REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Traffic data indexes
CREATE INDEX IF NOT EXISTS idx_traffic_trafficdata_location ON traffic_trafficdata (location);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficdata_coordinates ON traffic_trafficdata (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficdata_timestamp ON traffic_trafficdata (timestamp);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficdata_density ON traffic_trafficdata (density);

-- Traffic predictions indexes
CREATE INDEX IF NOT EXISTS idx_traffic_trafficprediction_location ON traffic_trafficprediction (location);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficprediction_coordinates ON traffic_trafficprediction (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficprediction_time ON traffic_trafficprediction (prediction_time);

-- Traffic reports indexes
CREATE INDEX IF NOT EXISTS idx_traffic_trafficreport_location ON traffic_trafficreport (location);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficreport_coordinates ON traffic_trafficreport (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficreport_created ON traffic_trafficreport (created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_trafficreport_user ON traffic_trafficreport (user_id);

-- Incidents indexes
CREATE INDEX IF NOT EXISTS idx_incidents_incident_location ON incidents_incident (location);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_coordinates ON incidents_incident (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_status ON incidents_incident (status);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_type ON incidents_incident (incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_severity ON incidents_incident (severity);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_reported_at ON incidents_incident (reported_at);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_reported_by ON incidents_incident (reported_by_id);

-- Incident comments indexes
CREATE INDEX IF NOT EXISTS idx_incidents_incidentcomment_incident ON incidents_incidentcomment (incident_id);
CREATE INDEX IF NOT EXISTS idx_incidents_incidentcomment_user ON incidents_incidentcomment (user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_incidentcomment_created ON incidents_incidentcomment (created_at);

-- Authentication token index
CREATE INDEX IF NOT EXISTS idx_authtoken_token_user ON authtoken_token (user_id);

-- =============================================================================
-- SAMPLE DATA COMMENTS
-- =============================================================================

-- To insert sample data, you can run:
-- INSERT INTO traffic_trafficdata (location, latitude, longitude, density, flow, speed, timestamp) 
-- VALUES ('Nairobi CBD', -1.2921, 36.8219, 'high', 'congested', 15.5, NOW());
--
-- INSERT INTO incidents_incident (title, description, incident_type, severity, location, latitude, longitude, reported_at)
-- VALUES ('Road Closure on Uhuru Highway', 'Construction work blocking two lanes', 'construction', 'high', 'Uhuru Highway', -1.2921, 36.8219, NOW());
