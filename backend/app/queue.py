from sqlalchemy.orm import Session
from .models import Token, Counter

def waiting_tokens(db: Session):
    return (
        db.query(Token)
        .filter(Token.status == "waiting")
        .order_by(Token.created_at.asc())
        .all()
    )

def counter_load(db: Session, counter_id: int) -> float:
    active = (
        db.query(Token)
        .filter(Token.counter_id == counter_id, Token.status.in_(["called", "serving"]))
        .all()
    )
    waiting = (
        db.query(Token)
        .filter(Token.counter_id == counter_id, Token.status == "waiting")
        .all()
    )
    return sum(t.predicted_duration for t in active + waiting)

def choose_counter(db: Session):
    counters = db.query(Counter).filter(Counter.is_active == True).all()
    if not counters:
        return None
    return min(counters, key=lambda c: counter_load(db, c.id))

def recalculate_waits(db: Session):
    tokens = waiting_tokens(db)
    for token in tokens:
        if token.counter_id is None:
            counter = choose_counter(db)
            token.counter_id = counter.id if counter else None

    db.flush()

    for counter in db.query(Counter).filter(Counter.is_active == True).all():
        queue = (
            db.query(Token)
            .filter(Token.counter_id == counter.id, Token.status == "waiting")
            .order_by(Token.created_at.asc())
            .all()
        )
        elapsed = counter_load(db, counter.id)
        for token in queue:
            token.estimated_wait = round(elapsed, 1)
            elapsed += token.predicted_duration
