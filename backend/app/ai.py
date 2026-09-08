from datetime import datetime

SERVICE_BASE = {
    "Account Opening": 18.0,
    "Cash Deposit": 7.0,
    "Cash Withdrawal": 8.0,
    "Loan Enquiry": 20.0,
    "Document Verification": 12.0,
}

CUSTOMER_ADJUSTMENT = {
    "regular": 0.0,
    "senior": 3.0,
    "priority": -1.0,
}

def predict_duration(
    service_name: str,
    customer_type: str,
    when: datetime,
    counter_experience: float = 2.0,
) -> float:
    """Lightweight AI-style prediction used by the Python 3.14 MVP.

    It combines learned/defined service baselines with customer, time,
    and counter-experience features. Later this function can be replaced
    by a trained scikit-learn model when using a Python version with a
    compatible ML wheel.
    """
    base = SERVICE_BASE.get(service_name, 10.0)
    customer_adjustment = CUSTOMER_ADJUSTMENT.get(customer_type, 0.0)

    peak_adjustment = 2.0 if 11 <= when.hour <= 14 else 0.0
    experience_adjustment = -(float(counter_experience) * 0.8)

    prediction = base + customer_adjustment + peak_adjustment + experience_adjustment
    return round(max(3.0, prediction), 1)
