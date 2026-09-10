from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import Counter, Token

def choose_counter(db: Session) -> Counter:
    """Select active counter/room with the minimum number of waiting/serving tokens."""
    counters = db.query(Counter).filter(Counter.is_active == True).order_by(Counter.id).all()
    if not counters:
        return None

    # Count load per counter
    min_counter = None
    min_load = float('inf')

    for counter in counters:
        load = (
            db.query(func.count(Token.id))
            .filter(Token.counter_id == counter.id, Token.status.in_(["waiting", "called", "serving"]))
            .scalar()
        )
        if load < min_load:
            min_load = load
            min_counter = counter

    return min_counter or counters[0]

def recalculate_waits(db: Session):
    """Recalculate estimated wait times for all waiting tokens."""
    waiting_tokens = (
        db.query(Token)
        .filter(Token.status == "waiting")
        .order_by(Token.created_at.asc())
        .all()
    )

    counter_accumulators = {}

    for token in waiting_tokens:
        cid = token.counter_id or 1
        if cid not in counter_accumulators:
            # Check currently serving token for this counter
            serving_token = (
                db.query(Token)
                .filter(Token.counter_id == cid, Token.status.in_(["serving", "called"]))
                .first()
            )
            serving_rem = serving_token.predicted_duration if serving_token else 0.0
            counter_accumulators[cid] = serving_rem

        token.estimated_wait = round(counter_accumulators[cid], 1)
        counter_accumulators[cid] += token.predicted_duration
