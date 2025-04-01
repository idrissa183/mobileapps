from datetime import date, datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..v1.auth import check_user_role
from ...models.user import User, UserRole
from ...models.student import Student, Course, Assignment, Grade, Attendance, AssignmentStatus, AttendanceStatus

router = APIRouter()


# Schema models for request and response
class CourseResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    instructor: str
    credits: int
    schedule: dict
    room: Optional[str] = None
    semester: str
    year: int
    start_date: date
    end_date: date
    syllabus_url: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: str
    title: str
    description: str
    course_id: str
    course_name: str
    due_date: datetime
    points_possible: float
    assignment_type: str
    instructions: str
    resources: List[str] = []


class GradeResponse(BaseModel):
    id: str
    assignment_id: str
    assignment_title: str
    course_id: str
    course_name: str
    points_earned: Optional[float] = None
    points_possible: float
    percentage: Optional[float] = None
    grade_status: str
    submission_date: Optional[datetime] = None
    submission_url: Optional[str] = None
    feedback: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    course_id: str
    course_name: str
    attendance_date: date
    attendance_status: str
    notes: Optional[str] = None


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    student_id: str
    full_name: str
    email: str
    enrolled_courses: List[CourseResponse] = []
    major: Optional[str] = None
    minor: Optional[str] = None
    academic_level: str
    gpa: Optional[float] = None
    admission_date: date
    expected_graduation: Optional[date] = None
    advisor: Optional[str] = None
    standing: str


class AssignmentSubmit(BaseModel):
    submission_url: str


class AttendanceCreate(BaseModel):
    course_id: str
    attendance_date: date = Field(default_factory=date.today)
    attendance_status: AttendanceStatus
    notes: Optional[str] = None


# Helper functions
async def get_student_profile(user: User) -> Student:
    # Get student profile for the current user
    student = await Student.find_one(Student.user.id == user.id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    return student


# Routes
@router.get("/profile", response_model=StudentProfileResponse)
async def get_profile(
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Get the student profile for the current user"""

    # Check if student app is enabled for user
    if not current_user.uses_student_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student app is not enabled for this user"
        )

    # Get student profile
    student = await get_student_profile(current_user)

    # Get enrolled courses
    enrolled_courses = []
    for course_link in student.enrolled_courses:
        course = await course_link.fetch()
        if course:
            enrolled_courses.append(CourseResponse(
                id=str(course.id),
                code=course.code,
                name=course.name,
                description=course.description,
                instructor=course.instructor,
                credits=course.credits,
                schedule=course.schedule,
                room=course.room,
                semester=course.semester,
                year=course.year,
                start_date=course.start_date,
                end_date=course.end_date,
                syllabus_url=course.syllabus_url
            ))

    # Create response
    return StudentProfileResponse(
        id=str(student.id),
        user_id=str(student.user.id),
        student_id=student.student_id,
        full_name=current_user.full_name,
        email=current_user.email,
        enrolled_courses=enrolled_courses,
        major=student.major,
        minor=student.minor,
        academic_level=student.academic_level,
        gpa=student.gpa,
        admission_date=student.admission_date,
        expected_graduation=student.expected_graduation,
        advisor=student.advisor,
        standing=student.standing
    )


@router.get("/courses", response_model=List[CourseResponse])
async def get_courses(
        semester: Optional[str] = None,
        year: Optional[int] = None,
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Get the courses for the current student"""

    # Get student profile
    student = await get_student_profile(current_user)

    # Get enrolled courses
    enrolled_courses = []
    for course_link in student.enrolled_courses:
        course = await course_link.fetch()
        if course:
            # Filter by semester and year if provided
            if semester and course.semester != semester:
                continue
            if year and course.year != year:
                continue

            enrolled_courses.append(CourseResponse(
                id=str(course.id),
                code=course.code,
                name=course.name,
                description=course.description,
                instructor=course.instructor,
                credits=course.credits,
                schedule=course.schedule,
                room=course.room,
                semester=course.semester,
                year=course.year,
                start_date=course.start_date,
                end_date=course.end_date,
                syllabus_url=course.syllabus_url
            ))

    return enrolled_courses


@router.get("/assignments", response_model=List[AssignmentResponse])
async def get_assignments(
        course_id: Optional[str] = None,
        assignment_status: Optional[AssignmentStatus] = None,
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Get assignments for the current student"""

    # Get student profile
    student = await get_student_profile(current_user)

    # Create list to store assignments
    assignments_response = []

    # Build query
    query: Dict[str, Any] = {}

    # If course_id is provided, filter by course
    if course_id:
        query["course.id"] = course_id
    else:
        # Get list of enrolled course IDs
        enrolled_course_ids = [str(course.id) for course in student.enrolled_courses]
        query["course.id"] = {"$in": enrolled_course_ids}

    # Get assignments matching query
    assignments = await Assignment.find(query).to_list()

    # Get grades for these assignments
    for assignment in assignments:
        # Get grade for this assignment
        grade = await Grade.find_one({
            "student.id": current_user.id,
            "assignment.id": assignment.id
        })

        # Skip if filtering by course_status and status doesn't match
        if assignment_status and (not grade or grade.status != assignment_status):
            continue

        # Get course info
        course = await assignment.course.fetch()

        # Add to response
        assignments_response.append(AssignmentResponse(
            id=str(assignment.id),
            title=assignment.title,
            description=assignment.description,
            course_id=str(assignment.course.id),
            course_name=course.name if course else "Unknown Course",
            due_date=assignment.due_date,
            points_possible=assignment.points_possible,
            assignment_type=assignment.assignment_type,
            instructions=assignment.instructions,
            resources=assignment.resources
        ))

    return assignments_response


@router.get("/grades", response_model=List[GradeResponse])
async def get_grades(
        course_id: Optional[str] = None,
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Get grades for the current student"""

    # Get student profile
    student = await get_student_profile(current_user)

    # Build query
    query = {"student.id": current_user.id}

    # If course_id is provided, we need to filter grades by assignments in that course
    if course_id:
        # First, get all assignments for the course
        assignment_ids = [
            str(a.id) for a in await Assignment.find({"course.id": course_id}).to_list()
        ]
        if assignment_ids:
            query["assignment.id"] = {"$in": assignment_ids}
        else:
            # No assignments for this course, return empty list
            return []

    # Get grades
    grades = await Grade.find(query).to_list()

    # Create response
    grades_response = []
    for grade in grades:
        # Get assignment info
        assignment = await grade.assignment.fetch()
        if not assignment:
            continue

        # Get course info
        course = await assignment.course.fetch()

        # Calculate percentage if points earned is available
        percentage = None
        if grade.points_earned is not None and assignment.points_possible > 0:
            percentage = (grade.points_earned / assignment.points_possible) * 100

        # Add to response
        grades_response.append(GradeResponse(
            id=str(grade.id),
            assignment_id=str(assignment.id),
            assignment_title=assignment.title,
            course_id=str(course.id) if course else "Unknown",
            course_name=course.name if course else "Unknown Course",
            points_earned=grade.points_earned,
            points_possible=assignment.points_possible,
            percentage=percentage,
            grade_status=grade.grade_status,
            submission_date=grade.submission_date,
            submission_url=grade.submission_url,
            feedback=grade.feedback
        ))

    return grades_response


@router.get("/attendance", response_model=List[AttendanceResponse])
async def get_attendance(
        course_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Get attendance records for the current student"""

    # Get student profile
    student = await get_student_profile(current_user)

    # Build query
    query = {"student.id": current_user.id}

    # Add course filter if provided
    if course_id:
        query["course.id"] = course_id

    # Add date range filters if provided
    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date
    if end_date:
        date_filter["$lte"] = end_date
    if date_filter:
        query["date"] = date_filter

    # Get attendance records
    attendance_records = await Attendance.find(query).to_list()

    # Create response
    attendance_response = []
    for record in attendance_records:
        # Get course info
        course = await record.course.fetch()

        # Add to response
        attendance_response.append(AttendanceResponse(
            id=str(record.id),
            course_id=str(record.course.id),
            course_name=course.name if course else "Unknown Course",
            attendance_date=record.attendance_date,
            attendance_status=record.attendance_status,
            notes=record.notes
        ))

    return attendance_response


@router.post("/assignments/{assignment_id}/submit", response_model=GradeResponse)
async def submit_assignment(
        assignment_id: str,
        submission: AssignmentSubmit,
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Submit an assignment"""

    # Get student profile
    student = await get_student_profile(current_user)

    # Get assignment
    assignment = await Assignment.get(assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Check if student is enrolled in the course
    course = await assignment.course.fetch()
    if not course or not any(str(c.id) == str(course.id) for c in student.enrolled_courses):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student is not enrolled in this course"
        )

    # Check if assignment is already submitted
    existing_grade = await Grade.find_one({
        "student.id": current_user.id,
        "assignment.id": assignment_id
    })

    now = datetime.now(timezone.utc)
    submission_status = AssignmentStatus.SUBMITTED

    # Check if submission is late
    if now > assignment.due_date:
        submission_status = AssignmentStatus.LATE

    if existing_grade:
        # Update existing grade
        existing_grade.submission_url = submission.submission_url
        existing_grade.submission_date = now
        existing_grade.grade_status = submission_status
        existing_grade.updated_at = now
        await existing_grade.save()
        grade = existing_grade
    else:
        # Create new grade
        grade = Grade(
            student=current_user,
            assignment=assignment,
            grade_status=submission_status,
            submission_date=now,
            submission_url=submission.submission_url
        )
        await grade.insert()

    # Calculate percentage if points earned is available
    percentage = None
    if grade.points_earned is not None and assignment.points_possible > 0:
        percentage = (grade.points_earned / assignment.points_possible) * 100

    # Create response
    return GradeResponse(
        id=str(grade.id),
        assignment_id=str(assignment.id),
        assignment_title=assignment.title,
        course_id=str(course.id),
        course_name=course.name,
        points_earned=grade.points_earned,
        points_possible=assignment.points_possible,
        percentage=percentage,
        grade_status=grade.grade_status,
        submission_date=grade.submission_date,
        submission_url=grade.submission_url,
        feedback=grade.feedback
    )


@router.post("/attendance", response_model=AttendanceResponse)
async def create_attendance(
        attendance_data: AttendanceCreate,
        current_user: User = Depends(check_user_role([UserRole.STUDENT]))
):
    """Create an attendance record (self-reporting)"""

    # Get student profile
    student = await get_student_profile(current_user)

    # Get course
    course = await Course.get(attendance_data.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if student is enrolled in the course
    if not any(str(c.id) == str(course.id) for c in student.enrolled_courses):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student is not enrolled in this course"
        )

    # Check if attendance record already exists
    existing_attendance = await Attendance.find_one({
        "student.id": current_user.id,
        "course.id": course.id,
        "attendance_date": attendance_data.attendance_date
    })

    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this date"
        )

    # Create attendance record
    attendance = Attendance(
        student=current_user,
        course=course,
        attendance_date=attendance_data.attendance_date,
        attendance_status=attendance_data.attendance_status,
        notes=attendance_data.notes
    )

    await attendance.insert()

    # Create response
    return AttendanceResponse(
        id=str(attendance.id),
        course_id=str(course.id),
        course_name=course.name,
        attendance_date=attendance.attendance_date,
        attendance_status=attendance.attendance_status,
        notes=attendance.notes
    )