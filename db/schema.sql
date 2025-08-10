CREATE TABLE IF NOT EXISTS jobs(
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    date_applied DATE NOT NULL,
    status  TEXT NOT NULL,
    referred INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cv TEXT,
    cover_letter TEXT,
    location TEXT,
    source TEXT,
    application_url TEXT,
    next_action DATE,
    notes TEXT,
    UNIQUE (company, title, date_applied),
    CHECK (status IN ('Applied', 'Home_Assignment', 'Interview', 'Offer', 'Offer_Accepted', 'Rejected')),
    CHECK (referred IN (0, 1))
    );
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied);