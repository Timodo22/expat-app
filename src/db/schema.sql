DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Viewings;
DROP TABLE IF EXISTS Documents;
DROP TABLE IF EXISTS Clients;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'b2b', 'b2c')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Clients (
    id TEXT PRIMARY KEY,
    user_id TEXT, 
    b2b_company_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    service_type TEXT CHECK(service_type IN ('rent', 'buy')) NOT NULL,
    search_profile TEXT,
    status TEXT CHECK(status IN ('lead', 'onboarding', 'searching', 'viewing', 'matched', 'invoiced', 'closed')) DEFAULT 'lead',
    easynuts_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE Documents (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    document_type TEXT CHECK(document_type IN ('id', 'payslip', 'employment_contract', 'rental_agreement', 'purchase_agreement', 'inspection_report', 'other')) NOT NULL,
    r2_file_key TEXT NOT NULL, 
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES Clients(id)
);

CREATE TABLE Viewings (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    property_address TEXT NOT NULL,
    agent_name TEXT,
    viewing_date DATETIME NOT NULL,
    status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    FOREIGN KEY(client_id) REFERENCES Clients(id)
);

CREATE TABLE Invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('client_fee', 'agent_commission')) NOT NULL,
    status TEXT CHECK(status IN ('draft', 'sent', 'paid')) DEFAULT 'draft',
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES Clients(id)
);

-- Insert some dummy data for testing
INSERT INTO Users (id, email, password, role) VALUES ('admin-1', 'admin@expathousing.com', 'admin123', 'admin');
INSERT INTO Users (id, email, password, role) VALUES ('b2b-1', 'hr@asml.com', 'b2b123', 'b2b');
INSERT INTO Users (id, email, password, role) VALUES ('b2c-1', 'john.doe@example.com', 'b2c123', 'b2c');

INSERT INTO Clients (id, user_id, first_name, last_name, service_type, status) VALUES ('client-1', 'b2c-1', 'John', 'Doe', 'rent', 'onboarding');
