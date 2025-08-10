Entity: Job
    Fields:
        Mandatory:
            job_id INTEGER PRIMARY KEY AUTOINCREMENT

            company TEXT NOT NULL

            title TEXT NOT NULL

            date_applied DATE NOT NULL

            status TEXT NOT NULL (allowed for MVP: 'Applied', 'HomeAssignment', 'Interview', 'Offer', 'OfferAccepted', 'Rejected')

            referred INTEGER NOT NULL DEFAULT 0 (0/1 boolean in SQLite)

            last_updated TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)

            created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP) 

        Optional:
        cv TEXT

        cover_letter TEXT

        location TEXT

        source TEXT

        application_url TEXT

        next_action DATE 

        status_note TEXT
    
    Constraints: 
        UNIQUE (company, title, date_applied)
        CHECK (status IN ('Applied','HomeAssignment','Interview','Offer','OfferAccepted','Rejected'))
        CHECK (referred) (0/1)
    
    INDEXES:
        CREATE INDEX idx_jobs_status ON jobs(status);
        CREATE INDEX idx_jobs_company ON jobs(company);
        CREATE INDEX idx_jobs_date_applied ON jobs(date_applied);