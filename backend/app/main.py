import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+psycopg://postgres:dharunsiva%401@localhost:5432/AutoHub',
    
)

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default='buyer')
    district = Column(String(80), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2)
    mobile: str = Field(..., min_length=10)
    password: str = Field(..., min_length=6)
    role: str = 'buyer'
    district: str | None = None

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, value: str):
        cleaned = value.strip()
        if not cleaned.isdigit():
            raise ValueError('Mobile number should contain only numbers.')
        if len(cleaned) < 10:
            raise ValueError('Mobile number must have at least 10 characters.')
        return cleaned


class LoginRequest(BaseModel):
    mobile: str = Field(..., min_length=10)
    password: str = Field(..., min_length=6)

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, value: str):
        cleaned = value.strip()
        if not cleaned.isdigit():
            raise ValueError('Mobile number should contain only numbers.')
        if len(cleaned) < 10:
            raise ValueError('Mobile number must have at least 10 characters.')
        return cleaned


app = FastAPI(title='AutoHub API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup_event():
    Base.metadata.create_all(bind=engine)


@app.get('/api/health')
def health_check():
    return {'status': 'ok', 'service': 'AutoHub API'}


@app.get('/api/listings')
def get_listings():
    return {
        'listings': [
            {
                'id': 1,
                'title': '2022 Toyota Camry',
                'type': 'Car',
                'price': 24500,
                'location': 'Bangalore',
                'year': 2022,
                'mileage': '28k km',
                'fuel': 'Hybrid',
                'condition': 'Certified',
            },
            {
                'id': 2,
                'title': '2021 Royal Enfield Classic 350',
                'type': 'Bike',
                'price': 185000,
                'location': 'Hyderabad',
                'year': 2021,
                'mileage': '14k km',
                'fuel': 'Petrol',
                'condition': 'Excellent',
            },
            {
                'id': 3,
                'title': '2023 Mahindra Bolero',
                'type': 'SUV',
                'price': 980000,
                'location': 'Pune',
                'year': 2023,
                'mileage': '22k km',
                'fuel': 'Diesel',
                'condition': 'Verified',
            },
        ]
    }


@app.post('/api/signup')
def signup(payload: SignupRequest):
    db: Session = SessionLocal()
    try:
        normalized_mobile = payload.mobile.strip()
        if db.query(User).filter(User.mobile == normalized_mobile).first():
            raise HTTPException(status_code=409, detail='Mobile number already exists.')

        user = User(
            name=payload.name.strip(),
            mobile=normalized_mobile,
            password_hash=pwd_context.hash(payload.password),
            role=payload.role.lower(),
            district=payload.district.strip() if payload.district else None,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            'status': 'success',
            'message': 'Account created successfully.',
            'user': {
                'id': user.id,
                'name': user.name,
                'mobile': user.mobile,
                'role': user.role,
                'district': user.district,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Unable to create user: {exc}') from exc
    finally:
        db.close()


@app.post('/api/login')
def login(payload: LoginRequest):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.mobile == payload.mobile.strip()).first()
        if not user:
            raise HTTPException(status_code=404, detail='User not found.')

        if not pwd_context.verify(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail='Invalid password.')

        return {
            'status': 'success',
            'message': 'Login successful.',
            'user': {
                'id': user.id,
                'name': user.name,
                'mobile': user.mobile,
                'role': user.role,
                'district': user.district,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Login failed: {exc}') from exc
    finally:
        db.close()
