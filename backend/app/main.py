import os
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, create_engine
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


class Listing(Base):
    __tablename__ = 'listings'

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(160), nullable=False)
    price = Column(Integer, nullable=False)
    category = Column(String(80), nullable=False)
    location = Column(String(120), nullable=False)
    contact = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ListingPhoto(Base):
    __tablename__ = 'listing_photos'

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey('listings.id', ondelete='CASCADE'), nullable=False)
    path = Column(String(255), nullable=False)


class Conversation(Base):
    __tablename__ = 'conversations'

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    seller_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    listing_id = Column(Integer, ForeignKey('listings.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)


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
UPLOADS_DIR = Path(__file__).resolve().parent.parent / 'uploads'
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOADS_DIR), name='uploads')

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
    db: Session = SessionLocal()
    try:
        saved_listings = db.query(Listing).order_by(Listing.created_at.desc()).all()
        listings = [
            {
                'id': listing.id,
                'seller_id': listing.seller_id,
                'title': listing.title,
                'type': listing.category,
                'price': listing.price,
                'location': listing.location,
                'contact': listing.contact,
                'description': listing.description,
                'created_at': listing.created_at.isoformat() if listing.created_at else None,
                'images': [f'/uploads/{photo.path}' for photo in db.query(ListingPhoto).filter(ListingPhoto.listing_id == listing.id).all()],
            }
            for listing in saved_listings
        ]
        return {'listings': listings}
    finally:
        db.close()


@app.get('/api/listings/category/{category}')
def get_listings_by_category(category: str):
    db: Session = SessionLocal()
    try:
        category_mapping = {
            'cars': 'Cars',
            'bikes': 'Bikes',
            'auto-rickshaws': 'Auto Rickshaws',
            'vans': 'Vans',
            'trucks': 'Trucks',
            'buses': 'Buses',
            'commercial': 'Commercial',
            'more-vehicles': 'More Vehicles',
        }
        
        category_name = category_mapping.get(category.lower(), category)
        saved_listings = db.query(Listing).filter(Listing.category == category_name).order_by(Listing.created_at.desc()).all()
        
        listings = [
            {
                'id': listing.id,
                'seller_id': listing.seller_id,
                'title': listing.title,
                'type': listing.category,
                'price': listing.price,
                'location': listing.location,
                'contact': listing.contact,
                'description': listing.description,
                'created_at': listing.created_at.isoformat() if listing.created_at else None,
                'images': [f'/uploads/{photo.path}' for photo in db.query(ListingPhoto).filter(ListingPhoto.listing_id == listing.id).all()],
            }
            for listing in saved_listings
        ]
        return {'listings': listings}
    finally:
        db.close()


@app.get('/api/listings/user/{user_id}')
def get_user_listings(user_id: int):
    db: Session = SessionLocal()
    try:
        if not db.query(User).filter(User.id == user_id).first():
            raise HTTPException(status_code=404, detail='User not found.')

        saved_listings = db.query(Listing).filter(
            Listing.seller_id == user_id
        ).order_by(Listing.created_at.desc()).all()
        listings = [
            {
                'id': listing.id,
                'seller_id': listing.seller_id,
                'title': listing.title,
                'type': listing.category,
                'price': listing.price,
                'location': listing.location,
                'contact': listing.contact,
                'description': listing.description,
                'created_at': listing.created_at.isoformat() if listing.created_at else None,
                'images': [f'/uploads/{photo.path}' for photo in db.query(ListingPhoto).filter(ListingPhoto.listing_id == listing.id).all()],
            }
            for listing in saved_listings
        ]
        return {'listings': listings}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Error fetching user listings: {exc}') from exc
    finally:
        db.close()


@app.post('/api/listings')
async def create_listing(
    seller_id: int = Form(...),
    title: str = Form(...),
    price: int = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    contact: str = Form(...),
    description: str = Form(...),
    photos: list[UploadFile] = File(default=[]),
):
    if not all(value.strip() for value in [title, category, location, contact, description]):
        raise HTTPException(status_code=422, detail='All listing fields are required.')
    if price < 0:
        raise HTTPException(status_code=422, detail='Price cannot be negative.')

    db: Session = SessionLocal()
    saved_files = []
    try:
        if not db.query(User).filter(User.id == seller_id).first():
            raise HTTPException(status_code=404, detail='Seller account not found.')

        listing = Listing(
            seller_id=seller_id,
            title=title.strip(),
            price=price,
            category=category.strip(),
            location=location.strip(),
            contact=contact.strip(),
            description=description.strip(),
        )
        db.add(listing)
        db.flush()

        for photo in photos:
            if not photo.content_type or not photo.content_type.startswith('image/'):
                raise HTTPException(status_code=422, detail='Only image files are allowed.')
            filename = f'{uuid.uuid4().hex}{Path(photo.filename or "image").suffix.lower()}'
            destination = UPLOADS_DIR / filename
            destination.write_bytes(await photo.read())
            saved_files.append(destination)
            db.add(ListingPhoto(listing_id=listing.id, path=filename))

        db.commit()
        return {'status': 'success', 'listing': {'id': listing.id, 'title': listing.title}}
    except HTTPException:
        db.rollback()
        for file_path in saved_files:
            file_path.unlink(missing_ok=True)
        raise
    except Exception as exc:
        db.rollback()
        for file_path in saved_files:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f'Unable to create listing: {exc}') from exc
    finally:
        db.close()


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


@app.get('/api/conversations/{user_id}')
def get_conversations(user_id: int):
    db: Session = SessionLocal()
    try:
        conversations = db.query(Conversation).filter(
            (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
        ).order_by(Conversation.updated_at.desc()).all()
        
        result = []
        for conv in conversations:
            listing = db.query(Listing).filter(Listing.id == conv.listing_id).first()
            other_user_id = conv.seller_id if conv.buyer_id == user_id else conv.buyer_id
            other_user = db.query(User).filter(User.id == other_user_id).first()
            
            last_message = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
            unread_count = db.query(Message).filter(
                Message.conversation_id == conv.id,
                Message.sender_id != user_id,
                Message.is_read.is_(False),
            ).count()
            
            result.append({
                'id': conv.id,
                'buyer_id': conv.buyer_id,
                'seller_id': conv.seller_id,
                'listing_id': conv.listing_id,
                'listing_title': listing.title if listing else 'Listing',
                'other_user_id': other_user_id,
                'other_user_name': other_user.name if other_user else 'Unknown',
                'last_message': last_message.message_text if last_message else '',
                'last_message_time': last_message.created_at.isoformat() if last_message else None,
                'unread_count': unread_count,
                'created_at': conv.created_at.isoformat(),
            })
        
        return {
            'conversations': result,
            'unread_count': sum(conversation['unread_count'] for conversation in result),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Error fetching conversations: {exc}') from exc
    finally:
        db.close()


@app.get('/api/conversations/{conversation_id}/messages')
def get_conversation_messages(conversation_id: int):
    db: Session = SessionLocal()
    try:
        messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
        
        result = [
            {
                'id': msg.id,
                'sender_id': msg.sender_id,
                'message_text': msg.message_text,
                'created_at': msg.created_at.isoformat(),
                'is_read': msg.is_read,
            }
            for msg in messages
        ]
        
        return {'messages': result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Error fetching messages: {exc}') from exc
    finally:
        db.close()


@app.post('/api/conversations/{conversation_id}/read')
def mark_conversation_read(conversation_id: int, user_id: int = Form(...)):
    db: Session = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail='Conversation not found.')
        if user_id not in [conversation.buyer_id, conversation.seller_id]:
            raise HTTPException(status_code=403, detail='You are not part of this conversation.')

        db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read.is_(False),
        ).update({Message.is_read: True}, synchronize_session=False)
        db.commit()
        return {'status': 'success'}
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Error marking conversation read: {exc}') from exc
    finally:
        db.close()


@app.post('/api/conversations')
def create_conversation(
    buyer_id: int = Form(...),
    seller_id: int = Form(...),
    listing_id: int = Form(...),
    message_text: str = Form(...),
):
    db: Session = SessionLocal()
    try:
        if buyer_id == seller_id:
            raise HTTPException(status_code=400, detail='Cannot chat with yourself.')
        
        existing_conv = db.query(Conversation).filter(
            Conversation.buyer_id == buyer_id,
            Conversation.seller_id == seller_id,
            Conversation.listing_id == listing_id,
        ).first()
        
        if existing_conv:
            conversation_id = existing_conv.id
        else:
            conversation = Conversation(
                buyer_id=buyer_id,
                seller_id=seller_id,
                listing_id=listing_id,
            )
            db.add(conversation)
            db.flush()
            conversation_id = conversation.id
        
        message = Message(
            conversation_id=conversation_id,
            sender_id=buyer_id,
            message_text=message_text.strip(),
        )
        db.add(message)
        db.commit()
        
        return {
            'status': 'success',
            'conversation_id': conversation_id,
            'message_id': message.id,
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Error creating conversation: {exc}') from exc
    finally:
        db.close()


@app.post('/api/messages')
def send_message(
    conversation_id: int = Form(...),
    sender_id: int = Form(...),
    message_text: str = Form(...),
):
    db: Session = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail='Conversation not found.')
        
        if sender_id not in [conversation.buyer_id, conversation.seller_id]:
            raise HTTPException(status_code=403, detail='You are not part of this conversation.')
        
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message_text=message_text.strip(),
        )
        db.add(message)
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(message)
        
        return {
            'status': 'success',
            'message': {
                'id': message.id,
                'sender_id': message.sender_id,
                'message_text': message.message_text,
                'created_at': message.created_at.isoformat(),
            },
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Error sending message: {exc}') from exc
    finally:
        db.close()
