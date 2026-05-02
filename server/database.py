from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fumble.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association table for company founders (many-to-many)
company_founders = Table(
    'company_founders',
    Base.metadata,
    Column('company_id', Integer, ForeignKey('companies.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    role = Column(String, nullable=True)
    company = Column(String, nullable=True)
    # Profile sections
    skills = Column(Text, nullable=True)  # JSON array
    achievements = Column(Text, nullable=True)  # JSON array
    education = Column(Text, nullable=True)  # JSON object
    social_links = Column(Text, nullable=True)  # JSON object
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    # Companies relationship is defined via backref in Company model


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", back_populates="posts")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tagline = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    location = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    stage = Column(String, nullable=True)
    founded_year = Column(String, nullable=True)
    size = Column(String, nullable=True)
    funding_amount = Column(String, nullable=True)
    funding_round = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Many-to-many relationship with users (founders)
    founders = relationship("User", secondary=company_founders, backref="companies")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    department = Column(String, nullable=True)
    type = Column(String, nullable=True)  # Full-time, Part-time, Contract, etc.
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)  # JSON array
    salary_range = Column(String, nullable=True)
    status = Column(String, default="open")  # open, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="jobs")


class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    swiper_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    swiped_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    swipe_type = Column(String, nullable=False)  # 'like' or 'dislike'
    target_type = Column(String, nullable=False, default="user")  # 'user' or 'company'
    is_match = Column(String, default="pending")  # 'pending', 'matched', 'not_matched'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    swiper = relationship("User", foreign_keys=[swiper_id], backref="swipes_made")
    swiped = relationship("User", foreign_keys=[swiped_id], backref="swipes_received")
    
    # Unique constraint to prevent duplicate swipes
    __table_args__ = (
        # Ensure a user can only swipe once on a target
        {'sqlite_autoincrement': True},
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_read = Column(Integer, default=0)  # 0 = unread, 1 = read
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="messages_received")


class CompanyInvitation(Base):
    __tablename__ = "company_invitations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    inviter_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # The cofounder sending invite
    invitee_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # The user being invited
    status = Column(String, default="pending")  # 'pending', 'accepted', 'ignored'
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)  # Associated message
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company")
    inviter = relationship("User", foreign_keys=[inviter_id])
    invitee = relationship("User", foreign_keys=[invitee_id])
    message = relationship("Message")


def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
