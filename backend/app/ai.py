from datetime import datetime

# Medical Service Consultation Durations (in minutes)
SERVICE_BASE = {
    "General Consultation": 15.0,
    "Radiology": 20.0,
    "Laboratory Test": 10.0,
}

CUSTOMER_ADJUSTMENT = {
    "regular": 0.0,
    "senior": 3.0,
    "priority": -1.0,
    "emergency": -3.0,
}

def predict_duration(
    service_name: str,
    customer_type: str,
    when: datetime,
    counter_experience: float = 2.0,
) -> float:
    """Predict consultation duration using hospital department baseline, customer triage category,

    peak time factors, and doctor room experience.
    """
    base = SERVICE_BASE.get(service_name, 15.0)
    customer_adjustment = CUSTOMER_ADJUSTMENT.get(customer_type, 0.0)

    # Peak hour load factor (11am to 2pm)
    peak_adjustment = 2.0 if 11 <= when.hour <= 14 else 0.0
    experience_adjustment = -(float(counter_experience) * 0.8)

    prediction = base + customer_adjustment + peak_adjustment + experience_adjustment
    return round(max(3.0, prediction), 1)
