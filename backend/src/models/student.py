from datetime import datetime, date, UTC
from enum import Enum
from typing import Dict, List, Optional

from beanie import Document, Indexed, Link
from pydantic import Field

from ..models.user import User


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class AssignmentStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"
    LATE = "late"


class Course(Document):
    """Course model for the student app"""
    code: Indexed(str, unique=True)
    name: str
    description: Optional[str] = None
    instructor: str
    credits: int
    schedule: Dict[str, List[str]] = {}  # e.g., {"Monday": ["10:00-11:30", "14:00-15:30"]}
    room: Optional[str] = None
    semester: str
    year: int
    start_date: date
    end_date: date
    syllabus_url: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "courses"


class Assignment(Document):
    """Assignment model for the student app"""
    title: str
    description: str
    course: Link[Course]
    due_date: datetime
    points_possible: float
    assignment_type: str  # e.g., "homework", "quiz", "exam", "project"
    instructions: str
    resources: List[str] = []  # URLs or file paths
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "assignments"


class Grade(Document):
    """Grade model for the student app"""
    student: Link[User]
    assignment: Link[Assignment]
    points_earned: Optional[float] = None
    grade_status: AssignmentStatus = AssignmentStatus.NOT_STARTED
    submission_date: Optional[datetime] = None
    submission_url: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "grades"


class Attendance(Document):
    """Attendance model for the student app"""
    student: Link[User]
    course: Link[Course]
    attendance_date: date
    attendance_status: AttendanceStatus
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "attendance"


class Student(Document):
    """Student profile for the student app"""
    user: Link[User]
    student_id: Indexed(str, unique=True)
    enrolled_courses: List[Link[Course]] = []
    major: Optional[str] = None
    minor: Optional[str] = None
    academic_level: str  # "freshman", "sophomore", "junior", "senior", "graduate"
    gpa: Optional[float] = None
    admission_date: date
    expected_graduation: Optional[date] = None
    advisor: Optional[str] = None

    # Academic standing
    standing: str = "good"  # "good", "probation", "warning", etc.

    # Address and contact information
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "student_profiles"