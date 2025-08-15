from types import MappingProxyType
from datetime import date, datetime

string_to_value_map = { 
    # Whitelist mapping of allowed sort field names to actual DB columns.
    # Used only for ORDER BY in list_jobs() to prevent SQL injection,
    # since SQL parameters cannot be used for column names.
    "job_id": "job_id",
    "company": "company_display",
    "company_key": "company_key",
    "title": "title_display",
    "title_key": "title_key",
    "date_applied": "date_applied",
    "status": "status",
    "referred": "referred",
    "last_updated": "last_updated",
    "location": "location_display",
    "location_key": "location_key",
    "next_action": "next_action",
    "source": "source_display",
    "source_key": "source_key",
}

template = MappingProxyType({
    # display fields (user input)
    "company_display": None,
    "title_display": None,
    "location_display": None,
    "source_display": None,

    # keys (system-managed)
    "company_key": None,
    "title_key": None,
    "location_key": None,
    "source_key": None,

    # other fields
    "date_applied": None,
    "status": None,
    "referred": 0,
    "next_action": None,
    "cv": None,
    "cover_letter": None,
    "notes": None,
    "application_url": None,
})
STATUS_MAP = {
    # Normalizes different variations the user might type in to the allowed forms
    "applied": "Applied",
    "home_assignment": "Home_Assignment",
    "home assignment": "Home_Assignment",
    "interview": "Interview",
    "offer": "Offer",
    "offer_accepted": "Offer_Accepted",
    "offer accepted": "Offer_Accepted",
    "rejected": "Rejected",
}

display_key = {
    "company_display": "company_key",
    "title_display": "title_key",
    "location_display": "location_key",
    "source_display": "source_key",
}

def _collapse_spaces(s: str) -> str:
    return " ".join(s.split())

def _empty_str_to_none(v):
    if v is None:
        return None
    s = _collapse_spaces(str(v).strip())
    return s if s else None

def _norm_key(s: str) -> str:
    if s is None:
        return None
    s = _collapse_spaces(str(s).strip())
    return s.lower() if s else None

def normalize_date(value: str)->str | None:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            dt = datetime.strptime(value, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    
    raise ValueError(f"Invalid date format: {value}")

def normalize(job_data):
    # DISPLAY
    for disp in ("company_display", "title_display", "location_display", "source_display"):
        if disp in job_data:
            job_data[disp] = _empty_str_to_none(job_data[disp])  # Normalize empty strings to None
            key_col = display_key.get(disp)
            job_data[key_col] = _norm_key(job_data[disp]) #Normalizes display names to keys, making variants of user input uniformed and easy for the system to manage.

    # STATUS
    raw_status = job_data.get("status")
    if raw_status:
        key = _collapse_spaces(str(raw_status).strip().lower()).replace("-", "_")
        job_data["status"] = STATUS_MAP.get(key, "Applied")

    # REFERRED TO 0/1
    if job_data.get("referred") is not None:
        job_data["referred"] = int(bool(job_data["referred"]))

    # Never allow manual last_updated
    job_data.pop("last_updated", None)

    #Normalize dates to a single format
    for d in ("date_applied", "next_action"):
        if d in job_data and job_data.get(d) is not None:
            job_data[d] = normalize_date(job_data[d])

def print_jobs(rows):
    if not rows:
        print("No jobs found.")
        return

    for idx, row in enumerate(rows, start=1):
        print(f"\n=== Job #{idx} ===")
        for key in row.keys():
            value = row[key]
            if value is not None:
                print(f"{key:15}: {value}")
        print("-" * 30)  # separator line