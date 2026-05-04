from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional, List
import json

from database import create_tables, get_db, User, Post, Company, Job, Swipe, Message, CompanyInvitation, InvestmentRequest
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown (if needed)


app = FastAPI(
    title="Fumble API",
    description="A dating-app-style platform for startup matchmaking",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Education(BaseModel):
    school: str
    degree: str
    year: str


class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    website: Optional[str]
    role: Optional[str]
    company: Optional[str]
    skills: List[str] = []
    achievements: List[str] = []
    education: Optional[Education] = None
    social_links: Optional[SocialLinks] = None

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Auth endpoints
@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_user_response(db_user),
    }

@app.post("/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_user_response(user),
    }

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    skills: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    education: Optional[Education] = None
    social_links: Optional[SocialLinks] = None


# Post schemas
class PostAuthor(BaseModel):
    id: int
    full_name: Optional[str]
    email: str

    model_config = {"from_attributes": True}


class PostBase(BaseModel):
    content: str
    image_url: Optional[str] = None


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    id: int
    author: PostAuthor
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


def serialize_user_response(user) -> dict:
    """Serialize user with JSON fields"""
    data = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "bio": user.bio,
        "location": user.location,
        "website": user.website,
        "role": user.role,
        "company": user.company,
        "skills": json.loads(user.skills) if user.skills else [],
        "achievements": json.loads(user.achievements) if user.achievements else [],
        "education": json.loads(user.education) if user.education else None,
        "social_links": json.loads(user.social_links) if user.social_links else None,
    }
    return data


@app.patch("/auth/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile"""
    # Update only provided fields
    update_data = user_update.model_dump(exclude_unset=True)

    # Handle JSON fields separately
    json_fields = ["skills", "achievements", "education", "social_links"]
    for field in json_fields:
        if field in update_data:
            setattr(current_user, field, json.dumps(update_data[field]))
            del update_data[field]

    # Update regular fields
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return serialize_user_response(current_user)


@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user_response(current_user)


# Posts endpoints
@app.get("/posts", response_model=list[PostResponse])
async def get_posts(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all posts, ordered by most recent first"""
    posts = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return posts


@app.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post (authenticated users only)"""
    db_post = Post(
        content=post_data.content,
        image_url=post_data.image_url,
        author_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post


@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a post (only the author can delete their own posts)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )
    db.delete(post)
    db.commit()
    return None


# Company schemas
class CompanyBase(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    founded_year: Optional[str] = None
    size: Optional[str] = None
    funding_amount: Optional[str] = None
    funding_round: Optional[str] = None


class CompanyCreate(CompanyBase):
    founder_ids: List[int] = []


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    founded_year: Optional[str] = None
    size: Optional[str] = None
    funding_amount: Optional[str] = None
    funding_round: Optional[str] = None


class InviteCompany(BaseModel):
    id: int
    name: str
    founder_count: int


class FounderInfo(BaseModel):
    id: int
    full_name: Optional[str]
    email: str

    model_config = {"from_attributes": True}


class CompanyResponse(CompanyBase):
    id: int
    founders: List[FounderInfo]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Company endpoints
@app.get("/companies", response_model=list[CompanyResponse])
async def get_companies(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all companies"""
    companies = (
        db.query(Company)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return companies


@app.get("/companies/my", response_model=list[CompanyResponse])
async def get_my_companies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get companies where current user is a founder"""
    return current_user.companies


@app.get("/companies/invitable", response_model=list[InviteCompany])
async def get_invitable_companies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get companies where current user is founder with < 5 founders"""
    invitable_companies = []

    for company in current_user.companies:
        founder_count = len(company.founders)
        if founder_count < 5:
            invitable_companies.append({
                "id": company.id,
                "name": company.name,
                "founder_count": founder_count
            })

    return invitable_companies


@app.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new company (authenticated users only)
    
    - Current user is automatically added as a founder
    - Maximum 5 founders allowed per company
    """
    # Check total number of founders (including current user)
    total_founders = len(company_data.founder_ids) + 1  # +1 for current user
    if total_founders > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 founders allowed per company"
        )

    # Validate founder IDs
    founders = [current_user]
    if company_data.founder_ids:
        for founder_id in company_data.founder_ids:
            if founder_id == current_user.id:
                continue  # Skip if it's the current user
            founder = db.query(User).filter(User.id == founder_id).first()
            if founder is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Founder with ID {founder_id} not found"
                )
            founders.append(founder)

    # Create company
    db_company = Company(
        name=company_data.name,
        tagline=company_data.tagline,
        description=company_data.description,
        website=company_data.website,
        location=company_data.location,
        industry=company_data.industry,
        stage=company_data.stage,
        founded_year=company_data.founded_year,
        size=company_data.size,
        funding_amount=company_data.funding_amount,
        funding_round=company_data.funding_round,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    # Add founders
    db_company.founders = founders
    db.commit()
    db.refresh(db_company)

    return db_company


@app.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific company by ID"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company


@app.patch("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a company (only founders can update)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if current user is a founder
    if current_user not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can update the company"
        )

    # Update fields
    update_data = company_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company


@app.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a company (only founders can delete)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if current user is a founder
    if current_user not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can delete the company"
        )

    db.delete(company)
    db.commit()
    return None


@app.post("/companies/{company_id}/founders/{user_id}", response_model=CompanyResponse)
async def add_founder(
    company_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a founder to a company (only existing founders can add new founders)
    
    - Maximum 5 founders allowed per company
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Check if current user is a founder
    if current_user not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can add new founders"
        )

    # Check max founders limit
    if len(company.founders) >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 founders allowed per company"
        )

    # Check if user exists
    new_founder = db.query(User).filter(User.id == user_id).first()
    if new_founder is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already a founder
    if new_founder in company.founders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a founder of this company"
        )

    # Add founder
    company.founders.append(new_founder)
    db.commit()
    db.refresh(company)
    return company


@app.delete("/companies/{company_id}/founders/{user_id}", response_model=CompanyResponse)
async def remove_founder(
    company_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a founder from a company (only founders can remove other founders)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Check if current user is a founder
    if current_user not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can remove founders"
        )

    # Find the founder to remove
    founder_to_remove = db.query(User).filter(User.id == user_id).first()
    if founder_to_remove is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if user is actually a founder
    if founder_to_remove not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a founder of this company"
        )

    # Remove founder
    company.founders.remove(founder_to_remove)
    db.commit()
    db.refresh(company)
    return company


# Job schemas
class JobBase(BaseModel):
    title: str
    department: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: List[str] = []
    salary_range: Optional[str] = None
    status: Optional[str] = "open"


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None


class JobResponse(JobBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobWithCompany(JobResponse):
    company: CompanyResponse

    model_config = {"from_attributes": True}


# Job endpoints
@app.get("/jobs", response_model=list[JobResponse])
async def get_jobs(
    skip: int = 0,
    limit: int = 20,
    company_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all jobs, optionally filtered by company"""
    query = db.query(Job)
    if company_id:
        query = query.filter(Job.company_id == company_id)
    jobs = query.offset(skip).limit(limit).all()
    return jobs


@app.get("/jobs/my", response_model=list[JobWithCompany])
async def get_my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get jobs from companies where current user is a founder"""
    jobs = []
    for company in current_user.companies:
        company_jobs = db.query(Job).filter(Job.company_id == company.id).all()
        for job in company_jobs:
            # Add company info to job
            job_dict = {
                "id": job.id,
                "company_id": job.company_id,
                "title": job.title,
                "department": job.department,
                "type": job.type,
                "location": job.location,
                "description": job.description,
                "requirements": json.loads(job.requirements) if job.requirements else [],
                "salary_range": job.salary_range,
                "status": job.status,
                "created_at": job.created_at,
                "updated_at": job.updated_at,
                "company": serialize_company_response(company),
            }
            jobs.append(job_dict)
    return jobs


def serialize_company_response(company) -> dict:
    """Serialize company with founders and investors"""
    return {
        "id": company.id,
        "name": company.name,
        "tagline": company.tagline,
        "description": company.description,
        "website": company.website,
        "location": company.location,
        "industry": company.industry,
        "stage": company.stage,
        "founded_year": company.founded_year,
        "size": company.size,
        "funding_amount": company.funding_amount,
        "funding_round": company.funding_round,
        "founders": [
            {"id": f.id, "full_name": f.full_name, "email": f.email}
            for f in company.founders
        ],
        "investors": [
            {"id": i.id, "full_name": i.full_name, "email": i.email}
            for i in getattr(company, 'investors', [])
        ],
        "created_at": company.created_at,
        "updated_at": company.updated_at,
    }


@app.post("/companies/{company_id}/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    company_id: int,
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new job listing (only company founders can create jobs)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Check if current user is a founder
    if current_user not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can create job listings"
        )

    # Create job
    db_job = Job(
        company_id=company_id,
        title=job_data.title,
        department=job_data.department,
        type=job_data.type,
        location=job_data.location,
        description=job_data.description,
        requirements=json.dumps(job_data.requirements),
        salary_range=job_data.salary_range,
        status=job_data.status or "open",
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # Return job with parsed requirements
    job_dict = {
        "id": db_job.id,
        "company_id": db_job.company_id,
        "title": db_job.title,
        "department": db_job.department,
        "type": db_job.type,
        "location": db_job.location,
        "description": db_job.description,
        "requirements": json.loads(db_job.requirements) if db_job.requirements else [],
        "salary_range": db_job.salary_range,
        "status": db_job.status,
        "created_at": db_job.created_at,
        "updated_at": db_job.updated_at,
    }
    return job_dict


@app.get("/jobs/{job_id}", response_model=JobWithCompany)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific job by ID"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Return job with company info
    job_dict = {
        "id": job.id,
        "company_id": job.company_id,
        "title": job.title,
        "department": job.department,
        "type": job.type,
        "location": job.location,
        "description": job.description,
        "requirements": json.loads(job.requirements) if job.requirements else [],
        "salary_range": job.salary_range,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "company": serialize_company_response(job.company),
    }
    return job_dict


@app.patch("/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a job listing (only company founders can update)"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Check if current user is a founder of the company
    if current_user not in job.company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can update job listings"
        )

    # Update fields
    update_data = job_update.model_dump(exclude_unset=True)

    # Handle requirements as JSON
    if "requirements" in update_data:
        update_data["requirements"] = json.dumps(update_data["requirements"])

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    # Return job with parsed requirements
    job_dict = {
        "id": job.id,
        "company_id": job.company_id,
        "title": job.title,
        "department": job.department,
        "type": job.type,
        "location": job.location,
        "description": job.description,
        "requirements": json.loads(job.requirements) if job.requirements else [],
        "salary_range": job.salary_range,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }
    return job_dict


@app.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a job listing (only company founders can delete)"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Check if current user is a founder of the company
    if current_user not in job.company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can delete job listings"
        )

    db.delete(job)
    db.commit()
    return None


# Swipe schemas
class SwipeCreate(BaseModel):
    swiped_id: int
    swipe_type: str  # 'like' or 'dislike'
    target_type: str = "user"  # 'user' or 'company'


class SwipeResponse(BaseModel):
    id: int
    swiper_id: int
    swiped_id: int
    swipe_type: str
    target_type: str
    is_match: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchInfo(BaseModel):
    user: UserResponse
    matched_at: datetime


# Swipe endpoints
@app.post("/swipes", response_model=SwipeResponse, status_code=status.HTTP_201_CREATED)
async def create_swipe(
    swipe_data: SwipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a swipe (like/dislike) on a user or company"""
    # Check if already swiped
    existing_swipe = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.swiped_id == swipe_data.swiped_id,
            Swipe.target_type == swipe_data.target_type,
        )
        .first()
    )
    
    if existing_swipe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already swiped on this target"
        )
    
    # Check for mutual like (match)
    is_match = "not_matched"
    if swipe_data.swipe_type == "like":
        # Check if the other user also liked current user (only for user-user swipes)
        if swipe_data.target_type == "user":
            mutual_like = (
                db.query(Swipe)
                .filter(
                    Swipe.swiper_id == swipe_data.swiped_id,
                    Swipe.swiped_id == current_user.id,
                    Swipe.swipe_type == "like",
                    Swipe.target_type == "user",
                )
                .first()
            )
            if mutual_like:
                is_match = "matched"
                # Update the other user's swipe to show match too
                mutual_like.is_match = "matched"
    
    # Create the swipe
    db_swipe = Swipe(
        swiper_id=current_user.id,
        swiped_id=swipe_data.swiped_id,
        swipe_type=swipe_data.swipe_type,
        target_type=swipe_data.target_type,
        is_match=is_match,
    )
    db.add(db_swipe)
    db.commit()
    db.refresh(db_swipe)
    
    return db_swipe


@app.get("/swipes/matches", response_model=list[MatchInfo])
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all mutual matches for the current user"""
    # Get all swipes where current user liked someone and it's a match
    matches = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.swipe_type == "like",
            Swipe.is_match == "matched",
            Swipe.target_type == "user",
        )
        .all()
    )
    
    result = []
    for swipe in matches:
        matched_user = db.query(User).filter(User.id == swipe.swiped_id).first()
        if matched_user:
            result.append({
                "user": serialize_user_response(matched_user),
                "matched_at": swipe.created_at,
            })
    
    return result


@app.get("/swipes/history", response_model=list[SwipeResponse])
async def get_swipe_history(
    target_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get swipe history for current user"""
    query = db.query(Swipe).filter(Swipe.swiper_id == current_user.id)
    
    if target_type:
        query = query.filter(Swipe.target_type == target_type)
    
    swipes = query.order_by(Swipe.created_at.desc()).all()
    return swipes


# Message schemas
class MessageCreate(BaseModel):
    receiver_id: int
    content: str


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    user_id: int
    full_name: Optional[str]
    email: str
    last_message: str
    last_message_time: datetime
    unread_count: int


# Messaging endpoints
@app.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to another user (only if matched)"""
    # Check if receiver exists
    receiver = db.query(User).filter(User.id == message_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    # Check if users are matched (mutual like)
    match = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.swiped_id == message_data.receiver_id,
            Swipe.swipe_type == "like",
            Swipe.is_match == "matched",
            Swipe.target_type == "user",
        )
        .first()
    )
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only message users you've matched with"
        )
    
    # Create message
    db_message = Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        content=message_data.content,
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message


@app.get("/messages/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all conversations with matched users"""
    from sqlalchemy import func, case
    
    # Get all matched users
    matched_swipes = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.is_match == "matched",
            Swipe.target_type == "user",
        )
        .all()
    )
    
    conversations = []
    for swipe in matched_swipes:
        other_user_id = swipe.swiped_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        
        if not other_user:
            continue
        
        # Get last message between these users
        last_message = (
            db.query(Message)
            .filter(
                ((Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id)) |
                ((Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id))
            )
            .order_by(Message.created_at.desc())
            .first()
        )
        
        # Count unread messages
        unread_count = (
            db.query(Message)
            .filter(
                Message.sender_id == other_user_id,
                Message.receiver_id == current_user.id,
                Message.is_read == 0
            )
            .count()
        )
        
        conversations.append({
            "user_id": other_user.id,
            "full_name": other_user.full_name,
            "email": other_user.email,
            "last_message": last_message.content if last_message else "Start a conversation!",
            "last_message_time": last_message.created_at if last_message else swipe.created_at,
            "unread_count": unread_count,
        })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x["last_message_time"], reverse=True)
    
    return conversations


@app.get("/messages/{user_id}", response_model=list[MessageResponse])
async def get_messages(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get message history with a specific user"""
    # Check if users are matched
    match = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.swiped_id == user_id,
            Swipe.swipe_type == "like",
            Swipe.is_match == "matched",
            Swipe.target_type == "user",
        )
        .first()
    )
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view messages with users you've matched with"
        )
    
    # Get messages
    messages = (
        db.query(Message)
        .filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
            ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
        )
        .order_by(Message.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Mark messages as read
    unread_messages = [m for m in messages if m.receiver_id == current_user.id and m.is_read == 0]
    for msg in unread_messages:
        msg.is_read = 1
    
    if unread_messages:
        db.commit()
    
    return messages[::-1]  # Return in chronological order


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user profile by ID (only if matched)"""
    # Check if users are matched
    match = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.swiped_id == user_id,
            Swipe.swipe_type == "like",
            Swipe.is_match == "matched",
            Swipe.target_type == "user",
        )
        .first()
    )
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view profiles of users you've matched with"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return serialize_user_response(user)


@app.get("/users/{user_id}/companies", response_model=list[CompanyResponse])
async def get_user_companies(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get companies where a user is a founder (only if matched)"""
    # Check if users are matched
    match = (
        db.query(Swipe)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.swiped_id == user_id,
            Swipe.swipe_type == "like",
            Swipe.is_match == "matched",
            Swipe.target_type == "user",
        )
        .first()
    )
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view companies of users you've matched with"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return companies where this user is a founder
    return [serialize_company_response(company) for company in user.companies]


# Company Invitation schemas
class CompanyInvitationCreate(BaseModel):
    company_id: int
    invitee_id: int


class CompanyInvitationResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    inviter_id: int
    inviter_name: str
    invitee_id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Company Invitation endpoints
@app.post("/company-invitations", response_model=CompanyInvitationResponse)
async def send_company_invitation(
    invitation_data: CompanyInvitationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send invitation to a user to join as cofounder"""
    # Check if company exists and current user is founder
    company = db.query(Company).filter(Company.id == invitation_data.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    if current_user not in company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can invite cofounders"
        )
    
    # Check founder limit
    if len(company.founders) >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company already has maximum 5 founders"
        )
    
    # Check if invitee exists
    invitee = db.query(User).filter(User.id == invitation_data.invitee_id).first()
    if not invitee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already a founder
    if invitee in company.founders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a founder of this company"
        )
    
    # Check for existing pending invitation
    existing = db.query(CompanyInvitation).filter(
        CompanyInvitation.company_id == invitation_data.company_id,
        CompanyInvitation.invitee_id == invitation_data.invitee_id,
        CompanyInvitation.status == "pending"
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already pending"
        )
    
    # Create invitation
    invitation = CompanyInvitation(
        company_id=invitation_data.company_id,
        inviter_id=current_user.id,
        invitee_id=invitation_data.invitee_id,
        status="pending"
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    return {
        "id": invitation.id,
        "company_id": company.id,
        "company_name": company.name,
        "inviter_id": current_user.id,
        "inviter_name": current_user.full_name or current_user.email,
        "invitee_id": invitee.id,
        "status": invitation.status,
        "created_at": invitation.created_at
    }


@app.get("/company-invitations/pending", response_model=list[CompanyInvitationResponse])
async def get_pending_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get pending invitations for current user"""
    invitations = db.query(CompanyInvitation).filter(
        CompanyInvitation.invitee_id == current_user.id,
        CompanyInvitation.status == "pending"
    ).all()
    
    result = []
    for inv in invitations:
        result.append({
            "id": inv.id,
            "company_id": inv.company_id,
            "company_name": inv.company.name,
            "inviter_id": inv.inviter_id,
            "inviter_name": inv.inviter.full_name or inv.inviter.email,
            "invitee_id": inv.invitee_id,
            "status": inv.status,
            "created_at": inv.created_at
        })
    
    return result


@app.post("/company-invitations/{invitation_id}/accept")
async def accept_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accept a company invitation"""
    invitation = db.query(CompanyInvitation).filter(
        CompanyInvitation.id == invitation_id,
        CompanyInvitation.invitee_id == current_user.id
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation is not pending"
        )
    
    # Check founder limit again
    if len(invitation.company.founders) >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company already has maximum 5 founders"
        )
    
    # Check if user is already an investor in this company
    if current_user in invitation.company.investors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already an investor in this company. Cannot join as cofounder."
        )
    
    # Add user as founder
    invitation.company.founders.append(current_user)
    invitation.status = "accepted"
    db.commit()
    
    return {"message": "Invitation accepted successfully"}


@app.post("/company-invitations/{invitation_id}/ignore")
async def ignore_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ignore a company invitation"""
    invitation = db.query(CompanyInvitation).filter(
        CompanyInvitation.id == invitation_id,
        CompanyInvitation.invitee_id == current_user.id
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation is not pending"
        )
    
    invitation.status = "ignored"
    db.commit()
    
    return {"message": "Invitation ignored"}


# Investment Request schemas
class InvestmentRequestCreate(BaseModel):
    company_id: int


class InvestmentRequestResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    investor_id: int
    investor_name: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Investment Request endpoints
@app.post("/investment-requests", response_model=InvestmentRequestResponse)
async def send_investment_request(
    request_data: InvestmentRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send investment request to a company"""
    # Check if company exists
    company = db.query(Company).filter(Company.id == request_data.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if user is already a founder or investor
    if current_user in company.founders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a founder of this company"
        )
    
    if current_user in company.investors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already an investor in this company"
        )
    
    # Check for existing pending request
    existing = db.query(InvestmentRequest).filter(
        InvestmentRequest.company_id == request_data.company_id,
        InvestmentRequest.investor_id == current_user.id,
        InvestmentRequest.status == "pending"
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Investment request already pending"
        )
    
    # Create investment request
    request = InvestmentRequest(
        company_id=request_data.company_id,
        investor_id=current_user.id,
        status="pending"
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    
    return {
        "id": request.id,
        "company_id": company.id,
        "company_name": company.name,
        "investor_id": current_user.id,
        "investor_name": current_user.full_name or current_user.email,
        "status": request.status,
        "created_at": request.created_at
    }


@app.get("/investment-requests/pending", response_model=list[InvestmentRequestResponse])
async def get_pending_investment_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get pending investment requests for companies where user is founder"""
    # Get all companies where current user is founder
    companies = current_user.companies
    company_ids = [c.id for c in companies]
    
    if not company_ids:
        return []
    
    requests = db.query(InvestmentRequest).filter(
        InvestmentRequest.company_id.in_(company_ids),
        InvestmentRequest.status == "pending"
    ).all()
    
    result = []
    for req in requests:
        result.append({
            "id": req.id,
            "company_id": req.company_id,
            "company_name": req.company.name,
            "investor_id": req.investor_id,
            "investor_name": req.investor.full_name or req.investor.email,
            "status": req.status,
            "created_at": req.created_at
        })
    
    return result


@app.get("/investment-requests/my", response_model=list[InvestmentRequestResponse])
async def get_my_investment_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get investment requests sent by current user"""
    requests = db.query(InvestmentRequest).filter(
        InvestmentRequest.investor_id == current_user.id
    ).all()
    
    result = []
    for req in requests:
        result.append({
            "id": req.id,
            "company_id": req.company_id,
            "company_name": req.company.name,
            "investor_id": req.investor_id,
            "investor_name": req.investor.full_name or req.investor.email,
            "status": req.status,
            "created_at": req.created_at
        })
    
    return result


@app.post("/investment-requests/{request_id}/accept")
async def accept_investment_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accept an investment request (founders only)"""
    request = db.query(InvestmentRequest).filter(
        InvestmentRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment request not found"
        )
    
    # Check if current user is a founder of the company
    if current_user not in request.company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can accept investment requests"
        )
    
    if request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending"
        )
    
    # Check if investor is already a founder in this company
    if request.investor in request.company.founders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This user is already a founder of the company. Cannot add as investor."
        )
    
    # Add user as investor
    request.company.investors.append(request.investor)
    request.status = "accepted"
    db.commit()
    
    return {"message": "Investment request accepted successfully"}


@app.post("/investment-requests/{request_id}/reject")
async def reject_investment_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reject an investment request (founders only)"""
    request = db.query(InvestmentRequest).filter(
        InvestmentRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment request not found"
        )
    
    # Check if current user is a founder of the company
    if current_user not in request.company.founders:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only founders can reject investment requests"
        )
    
    if request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending"
        )
    
    request.status = "rejected"
    db.commit()
    
    return {"message": "Investment request rejected"}


# Search endpoints for swipe interface
@app.get("/search/cofounders", response_model=list[UserResponse])
async def search_cofounders(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of potential cofounders (users looking for cofounders)"""
    # Get IDs of users already swiped by current user
    swiped_ids = (
        db.query(Swipe.swiped_id)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.target_type == "user",
        )
        .subquery()
    )
    
    # Get users who have role indicating they're looking for cofounders
    # Exclude current user and already swiped users
    users = (
        db.query(User)
        .filter(
            User.id != current_user.id,
            User.role.in_(["Looking for Cofounder", "Cofounder", "Founder"]),
            ~User.id.in_(swiped_ids),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [serialize_user_response(user) for user in users]


@app.get("/search/companies", response_model=list[CompanyResponse])
async def search_companies(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of companies for job seekers"""
    # Get IDs of companies already swiped by current user
    swiped_company_ids = (
        db.query(Swipe.swiped_id)
        .filter(
            Swipe.swiper_id == current_user.id,
            Swipe.target_type == "company",
        )
        .subquery()
    )
    
    # Get companies with open jobs - use subquery to handle pagination correctly
    from sqlalchemy import func
    
    # First get company IDs that have open jobs and haven't been swiped
    company_ids_query = (
        db.query(Company.id)
        .join(Job, Company.id == Job.company_id)
        .filter(
            Job.status == "open",
            ~Company.id.in_(swiped_company_ids),
        )
        .distinct()
        .subquery()
    )
    
    # Then fetch those companies with proper pagination
    companies = (
        db.query(Company)
        .join(company_ids_query, Company.id == company_ids_query.c.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [serialize_company_response(company) for company in companies]


# Public endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to Fumble API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
