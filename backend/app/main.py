from datetime import datetime
import os

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db, SessionLocal
from .models import Service, Counter, Token
from .schemas import (
    ServiceOut,
    TokenCreate,
    TokenOut,
    CounterOut,
    CompleteRequest,
)
from .ai import predict_duration
from .queue import choose_counter, recalculate_waits


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="MedPlus Smart Queue AI API",
    version="1.0.0",
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

raw_origins = os.getenv("CORS_ORIGINS", "*")

if raw_origins.strip() == "*":
    origins = ["*"]
else:
    origins = [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# WEBSOCKET CONNECTION MANAGER
# --------------------------------------------------

class ConnectionManager:

    def __init__(self):
        self.connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, message: str):

        dead_connections = []

        for connection in self.connections:

            try:
                await connection.send_text(message)

            except Exception:
                dead_connections.append(connection)

        for connection in dead_connections:
            self.disconnect(connection)


manager = ConnectionManager()


# --------------------------------------------------
# DATABASE STARTUP
# --------------------------------------------------

@app.on_event("startup")
def startup():

    db = SessionLocal()

    try:

        # Delete old patient tokens
        db.query(Token).delete()

        # Delete old banking services
        db.query(Service).delete()

        # Delete old counters
        db.query(Counter).delete()

        db.commit()


        # Add healthcare services
        db.add_all([

            Service(
                name="General Doctor Consultation",
                base_duration=15
            ),

            Service(
                name="Radiology",
                base_duration=25
            ),

            Service(
                name="Laboratory / Blood Test",
                base_duration=10
            ),

        ])


        # Add OPD counters
        db.add_all([

            Counter(name="OPD Room 1"),

            Counter(name="OPD Room 2"),

            Counter(name="OPD Room 3"),

        ])


        db.commit()


    finally:
        db.close()


# --------------------------------------------------
# ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def root():

    return {

        "status": "online",

        "service": "MedPlus Smart Queue AI FastAPI Backend Engine",

        "version": "1.0.0",

        "docs_url": "/docs",

        "health_check": "/health",

    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():

    return {

        "status": "ok"

    }


# --------------------------------------------------
# GET SERVICES
# --------------------------------------------------

@app.get(
    "/services",
    response_model=list[ServiceOut],
)
def get_services(
    db: Session = Depends(get_db),
):

    return (
        db.query(Service)
        .order_by(Service.id)
        .all()
    )


# --------------------------------------------------
# GET ALL TOKENS
# --------------------------------------------------

@app.get(
    "/tokens",
    response_model=list[TokenOut],
)
def get_tokens(
    db: Session = Depends(get_db),
):

    return (

        db.query(Token)

        .order_by(
            Token.created_at.desc()
        )

        .limit(100)

        .all()

    )


# --------------------------------------------------
# GET ACTIVE QUEUE
# --------------------------------------------------

@app.get(
    "/queue",
    response_model=list[TokenOut],
)
def get_queue(
    db: Session = Depends(get_db),
):

    return (

        db.query(Token)

        .filter(
            Token.status.in_([
                "waiting",
                "called",
                "serving",
            ])
        )

        .order_by(
            Token.created_at.asc()
        )

        .all()

    )


# --------------------------------------------------
# GET COUNTERS
# --------------------------------------------------

@app.get(
    "/counters",
    response_model=list[CounterOut],
)
def get_counters(
    db: Session = Depends(get_db),
):

    return (

        db.query(Counter)

        .order_by(
            Counter.id
        )

        .all()

    )


# --------------------------------------------------
# CREATE PATIENT TOKEN
# --------------------------------------------------

@app.post(
    "/tokens",
    response_model=TokenOut,
)
async def create_token(

    payload: TokenCreate,

    db: Session = Depends(get_db),

):

    service = db.get(
        Service,
        payload.service_id,
    )


    if not service:

        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )


    now = datetime.utcnow()


    counter = choose_counter(db)


    experience = 2.0


    predicted = predict_duration(

        service.name,

        payload.customer_type,

        now,

        experience,

    )


    prefix = datetime.utcnow().strftime(
        "%m%d"
    )


    count = (
        db.query(Token).count()
        + 1
    )


    clean_name = (
        payload.customer_name
        or ""
    ).strip()


    if not clean_name:

        clean_name = (
            "Walk-in Patient"
        )


    token = Token(

        token_number=(
            f"P{prefix}{count:03d}"
        ),

        customer_name=clean_name,

        customer_type=(
            payload.customer_type
        ),

        service_id=service.id,

        counter_id=(
            counter.id
            if counter
            else None
        ),

        predicted_duration=predicted,

        estimated_wait=0,

        status="waiting",

    )


    db.add(token)

    db.flush()


    recalculate_waits(db)


    db.commit()


    db.refresh(token)


    await manager.broadcast(
        "queue_updated"
    )


    return token


# --------------------------------------------------
# CALL PATIENT TOKEN
# --------------------------------------------------

@app.post(
    "/tokens/{token_id}/call",
    response_model=TokenOut,
)
async def call_token(

    token_id: int,

    db: Session = Depends(get_db),

):

    token = db.get(
        Token,
        token_id,
    )


    if not token:

        raise HTTPException(
            status_code=404,
            detail="Token not found",
        )


    if token.status != "waiting":

        raise HTTPException(
            status_code=400,
            detail="Token is not waiting",
        )


    token.status = "serving"


    token.called_at = (
        datetime.utcnow()
    )


    if token.counter_id is None:

        counter = choose_counter(db)

        token.counter_id = (
            counter.id
            if counter
            else None
        )


    db.commit()


    db.refresh(token)


    await manager.broadcast(
        "queue_updated"
    )


    return token


# --------------------------------------------------
# COMPLETE PATIENT TOKEN
# --------------------------------------------------

@app.post(
    "/tokens/{token_id}/complete",
    response_model=TokenOut,
)
async def complete_token(

    token_id: int,

    payload: CompleteRequest,

    db: Session = Depends(get_db),

):

    token = db.get(
        Token,
        token_id,
    )


    if not token:

        raise HTTPException(
            status_code=404,
            detail="Token not found",
        )


    if token.status not in [
        "serving",
        "called",
    ]:

        raise HTTPException(
            status_code=400,
            detail="Token is not currently serving",
        )


    completed = (
        datetime.utcnow()
    )


    token.completed_at = (
        completed
    )


    token.status = (
        "completed"
    )


    if token.called_at:

        measured = (

            completed
            - token.called_at

        ).total_seconds() / 60


        token.actual_duration = round(

            payload.actual_duration

            if payload.actual_duration
            is not None

            else measured,

            1,

        )


    counter = (

        db.get(
            Counter,
            token.counter_id,
        )

        if token.counter_id

        else None

    )


    if (

        counter

        and

        counter.current_token_id
        == token.id

    ):

        counter.current_token_id = (
            None
        )


    next_token = (

        db.query(Token)

        .filter(

            Token.status
            == "waiting",

            Token.counter_id
            == token.counter_id,

        )

        .order_by(
            Token.created_at.asc()
        )

        .first()

        if token.counter_id

        else None

    )


    if next_token and counter:

        counter.current_token_id = (
            next_token.id
        )


    recalculate_waits(db)


    db.commit()


    db.refresh(token)


    await manager.broadcast(
        "queue_updated"
    )


    return token


# --------------------------------------------------
# SEED DEMO PATIENT QUEUE
# --------------------------------------------------

@app.post("/seed-demo")
async def seed_demo(

    db: Session = Depends(get_db),

):

    services = (
        db.query(Service)
        .all()
    )


    if not services:

        raise HTTPException(
            status_code=400,
            detail="Services not initialized",
        )


    # Remove old demo tokens
    db.query(Token).delete()

    db.commit()


    names = [

        "Praveen Kumar",

        "Mithra",

        "Sankar",

    ]


    types = [

        "regular",

        "priority",

        "regular",

    ]


    for i in range(3):

        service = services[
            i % len(services)
        ]


        now = (
            datetime.utcnow()
        )


        counter = (
            choose_counter(db)
        )


        predicted = (
            predict_duration(

                service.name,

                types[i],

                now,

            )
        )


        token = Token(

            token_number=(
                f"P{i + 1:03d}"
            ),

            customer_name=(
                names[i]
            ),

            customer_type=(
                types[i]
            ),

            service_id=(
                service.id
            ),

            counter_id=(

                counter.id

                if counter

                else None

            ),

            predicted_duration=(
                predicted
            ),

            status=(

                "serving"

                if i == 0

                else "waiting"

            ),

        )


        db.add(token)


    db.flush()


    recalculate_waits(db)


    db.commit()


    await manager.broadcast(
        "queue_updated"
    )


    return {

        "message":
        "3 demo patient tokens added"

    }


# --------------------------------------------------
# WEBSOCKET
# --------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):

    await manager.connect(
        websocket
    )


    try:

        while True:

            await websocket.receive_text()


    except WebSocketDisconnect:

        manager.disconnect(
            websocket
        )
        
