"""MVP training-data generator.

The Python 3.14 starter intentionally avoids NumPy/scikit-learn so the
backend can be installed reliably in a 4-day submission environment.
The prediction logic is in app/ai.py and is structured so a trained model
can be plugged in later.
"""

from pathlib import Path
import csv
import random

OUT = Path(__file__).resolve().parent / "training_data.csv"

services = {
    "Account Opening": 18,
    "Cash Deposit": 7,
    "Cash Withdrawal": 8,
    "Loan Enquiry": 20,
    "Document Verification": 12,
}
customers = {"regular": 0, "senior": 3, "priority": -1}

random.seed(42)

with OUT.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["service", "customer_type", "hour", "weekday", "counter_experience", "duration"])
    for _ in range(1200):
        service = random.choice(list(services))
        customer = random.choice(list(customers))
        hour = random.randint(8, 19)
        weekday = random.randint(0, 6)
        experience = round(random.uniform(0.5, 5.0), 2)
        duration = services[service] + customers[customer]
        if 11 <= hour <= 14:
            duration += 2
        duration -= experience * 0.8
        duration += random.uniform(-1.8, 1.8)
        writer.writerow([service, customer, hour, weekday, experience, round(max(3, duration), 1)])

print(f"Generated {OUT}")
