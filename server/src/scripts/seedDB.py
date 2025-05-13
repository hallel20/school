import json
from datetime import datetime
import random

def generate_filler_data(existing_data):
    filler_data = {}

    # Helper function to generate a random date within a reasonable range
    def random_date(start_year=2023, end_year=2025):
        year = random.randint(start_year, end_year)
        month = random.randint(1, 12)
        day = random.randint(1, 28)  # Keep it simple to avoid month-end issues
        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        return datetime(year, month, day, hour, minute, second).isoformat() + "Z"

    # Helper function to get a random element from a list
    def get_random(data_list):
        return random.choice(data_list) if data_list else None

    # Helper function to generate a unique ID (simple incrementing based on existing)
    def generate_unique_id(table_name, data):
        if table_name in data and data[table_name]:
            max_numeric_id = 0
            processed_any_valid_id = False

            for item in data[table_name]:
                current_id_val = item.get('id')
                item_numeric_id = None # Stores the extracted numeric part of the ID

                if isinstance(current_id_val, int):
                    item_numeric_id = current_id_val
                elif isinstance(current_id_val, str):
                    # Specific parsing for "Registration" table's "REG<number>" format
                    if table_name == "Registration" and current_id_val.startswith("REG"):
                        try:
                            # Extract numeric part after "REG"
                            item_numeric_id = int(current_id_val[3:])
                        except ValueError:
                            # Failed to parse numeric part, item_numeric_id remains None
                            pass
                    # Add other 'elif' clauses here if other tables use specific string ID formats
                    # that need parsing to extract a numeric component. For example:
                    # elif table_name == "SomeOtherTable" and current_id_val.startswith("PFX"):
                    #     try:
                    #         item_numeric_id = int(current_id_val[len("PFX"):])
                    #     except ValueError:
                    #         pass
                    else:
                        # Fallback for strings that might be plain numbers (e.g., "123")
                        try:
                            item_numeric_id = int(current_id_val)
                        except ValueError:
                            # String is not a simple number, item_numeric_id remains None
                            pass
                
                if item_numeric_id is not None:
                    if not processed_any_valid_id or item_numeric_id > max_numeric_id:
                        max_numeric_id = item_numeric_id
                    processed_any_valid_id = True
            
            if processed_any_valid_id:
                return max_numeric_id + 1
            # If no processable numeric IDs were found in data[table_name] (e.g., table has items 
            # but IDs are all non-numeric strings or 'id' key is missing), 
            # fall through to NextId logic or default.

        elif "NextId" in existing_data:
            for next_id_entry in existing_data["NextId"]:
                if next_id_entry["tableName"].lower() == table_name.lower():
                    next_id = next_id_entry.get("nextId", 1)
                    next_id_entry["nextId"] += 1 # Simulate ID increment
                    return next_id
        return 1

    # Helper function to generate a unique code
    def generate_unique_code(prefix, existing_codes):
        count = 1
        while True:
            code = f"{prefix}{count:03d}"
            if code not in existing_codes:
                return code
            count += 1

    # --- Generate filler data for each model ---

    # Course
    filler_data["Course"] = list(existing_data.get("Course", []))
    department_ids = [dept["id"] for dept in existing_data.get("Department", [])]
    staff_ids = [staff["id"] for staff in existing_data.get("Staff", []) if staff.get("position") in ["professor", "doctor", "lecturer"]]
    existing_course_codes = {course["code"] for course in filler_data["Course"]}
    for _ in range(5): # Generate 5 more courses
        new_course = {
            "id": generate_unique_id("Course", filler_data),
            "name": f"Advanced {get_random(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'])}",
            "code": generate_unique_code(get_random(['MATH', 'PHY', 'CHEM', 'BIO', 'HIST']), existing_course_codes),
            "credits": random.randint(2, 4),
            "departmentId": get_random(department_ids),
            "lecturerId": get_random(staff_ids),
            "createdAt": random_date(),
            "isDeleted": 0
        }
        filler_data["Course"].append(new_course)
        existing_course_codes.add(new_course["code"])

    # Registration
    filler_data["Registration"] = list(existing_data.get("Registration", []))
    student_ids = [stu["id"] for stu in existing_data.get("Student", [])]
    course_ids = [course["id"] for course in filler_data["Course"]]
    academic_session_ids = [session["id"] for session in existing_data.get("AcademicSession", [])]
    semester_ids = [semester["id"] for semester in existing_data.get("Semester", [])]
    for _ in range(10): # Generate 10 registrations
        student_id = get_random(student_ids)
        if student_id:
            filler_data["Registration"].append({
                "id": f"REG{generate_unique_id('Registration', filler_data):05d}",
                "studentId": student_id,
                "courses": [get_random(course_ids)],
                "academicSessionId": get_random(academic_session_ids),
                "semesterId": get_random(semester_ids),
                "createdAt": random_date(),
                "updatedAt": random_date()
            })

    # HOD (Keep existing, maybe add one more if departments are lacking)
    filler_data["HOD"] = list(existing_data.get("HOD", []))
    existing_hod_dept_ids = {hod["departmentId"] for hod in filler_data["HOD"]}
    available_staff_for_hod = [staff["id"] for staff in existing_data.get("Staff", []) if staff.get("position") in ["professor", "doctor", "lecturer"] and staff["departmentId"] not in existing_hod_dept_ids]
    available_departments_for_hod = [dept["id"] for dept in existing_data.get("Department", []) if dept["id"] not in existing_hod_dept_ids]
    if available_staff_for_hod and available_departments_for_hod:
        filler_data["HOD"].append({
            "id": generate_unique_id("HOD", filler_data),
            "staffId": get_random(available_staff_for_hod),
            "departmentId": get_random(available_departments_for_hod),
            "isDeleted": 0
        })

    # NextId (Keep existing - the generate_unique_id function updates it)
    filler_data["NextId"] = list(existing_data.get("NextId", []))
    next_id_map = {item["tableName"].lower(): item for item in filler_data["NextId"]}
    for table_name in ["staff", "student", "course", "registration", "hod", "department", "dean", "result", "semester", "notification", "faculty", "schoolsetting", "academicsession", "user", "log"]:
        if table_name not in next_id_map:
            filler_data["NextId"].append({"id": generate_unique_id("NextId", filler_data), "tableName": table_name.capitalize(), "nextId": 1})

    # Staff
    filler_data["Staff"] = list(existing_data.get("Staff", []))
    department_ids = [dept["id"] for dept in existing_data.get("Department", [])]
    existing_staff_ids = {staff["staffId"] for staff in filler_data["Staff"]}
    staff_positions = ["lecturer", "assistant", "professor", "doctor"]
    for _ in range(3): # Generate 3 more staff members
        first_name = get_random(["Alice", "Bob", "Charlie", "David", "Eve"])
        last_name = get_random(["Smith", "Jones", "Williams", "Brown", "Davis"])
        staff_id = generate_unique_code("STAFF", existing_staff_ids)
        filler_data["Staff"].append({
            "id": generate_unique_id("Staff", filler_data),
            "userId": None,
            "staffId": staff_id,
            "firstName": first_name,
            "lastName": last_name,
            "position": get_random(staff_positions),
            "departmentId": get_random(department_ids),
            "createdAt": random_date(),
            "isDeleted": 0
        })
        existing_staff_ids.add(staff_id)

    # Department (Keep existing, maybe add one more if faculties are lacking)
    filler_data["Department"] = list(existing_data.get("Department", []))
    faculty_ids = [fac["id"] for fac in existing_data.get("Faculty", [])]
    existing_dept_codes = {dept["code"] for dept in filler_data["Department"]}
    available_hod_dept_ids = {hod["departmentId"] for hod in filler_data["HOD"]}
    available_faculties_for_dept = [fac_id for fac_id in faculty_ids if not any(dept["facultyId"] == fac_id for dept in filler_data["Department"])]
    if available_faculties_for_dept:
        filler_data["Department"].append({
            "id": generate_unique_id("Department", filler_data),
            "name": f"New {get_random(['Engineering', 'Science', 'Arts'])} Department",
            "code": generate_unique_code(get_random(['ENG', 'SCI', 'ART']), existing_dept_codes),
            "hodId": get_random([hod["staffId"] for hod in filler_data["HOD"]]),
            "facultyId": get_random(available_faculties_for_dept),
            "isDeleted": 0
        })

    # Dean (Keep existing, maybe add one more if staff are available)
    filler_data["Dean"] = list(existing_data.get("Dean", []))
    available_staff_for_dean = [staff["id"] for staff in existing_data.get("Staff", []) if staff.get("position") == "professor" and not any(dean["staffId"] == staff["id"] for dean in filler_data["Dean"])]
    available_faculty_for_dean = [fac["id"] for fac in existing_data.get("Faculty", []) if not any(dean["facultyId"] == fac["id"] for dean in filler_data["Dean"])]
    if available_staff_for_dean and available_faculty_for_dean:
        filler_data["Dean"].append({
            "id": generate_unique_id("Dean", filler_data),
            "staffId": get_random(available_staff_for_dean),
            "facultyId": get_random(available_faculty_for_dean),
            "isDeleted": 0
        })

    # Result
    filler_data["Result"] = list(existing_data.get("Result", []))
    if student_ids and course_ids and academic_session_ids and semester_ids:
        for _ in range(15): # Generate 15 results
            filler_data["Result"].append({
                "id": generate_unique_id("Result", filler_data),
                "studentId": get_random(student_ids),
                "courseId": get_random(course_ids),
                "academicSessionId": get_random(academic_session_ids),
                "semesterId": get_random(semester_ids),
                "score": round(random.uniform(0, 100), 2),
                "grade": get_random(["A", "B", "C", "D", "E", "F"]),
            })

    # Semester (Keep existing, maybe add for a new academic session)
    filler_data["Semester"] = list(existing_data.get("Semester", []))
    existing_session_semester_pairs = {(sem["academicSessionId"], sem["name"]) for sem in filler_data["Semester"]}
    for session_id in academic_session_ids:
        for semester_name in ["First Semester", "Second Semester"]:
            if (session_id, semester_name) not in existing_session_semester_pairs:
                filler_data["Semester"].append({
                    "id": generate_unique_id("Semester", filler_data),
                    "name": semester_name,
                    "academicSessionId": session_id
                })
                existing_session_semester_pairs.add((session_id, semester_name))

    # Student
    filler_data["Student"] = list(existing_data.get("Student", []))
    existing_student_ids = {stu["studentId"] for stu in filler_data["Student"]}
    for _ in range(2): # Generate 2 more students
        first_name = get_random(["Grace", "Henry"])
        last_name = get_random(["Miller", "Wilson"])
        student_id = generate_unique_code("STU", existing_student_ids)
        filler_data["Student"].append({
            "id": generate_unique_id("Student", filler_data),
            "userId": None,
            "studentId": student_id,
            "firstName": first_name,
            "lastName": last_name,
            "departmentId": get_random(department_ids),
            "createdAt": random_date(),
            "isDeleted": 0
        })
        existing_student_ids.add(student_id)

    # Notification (Add a few random notifications)
    filler_data["Notification"] = list(existing_data.get("Notification", []))
    user_ids = [user["id"] for user in existing_data.get("User", [])]
    for _ in range(3):
        filler_data["Notification"].append({
            "id": generate_unique_id("Notification", filler_data),
            "userId": get_random(user_ids),
            "message": f"Important announcement {random.randint(1, 100)}",
            "read": random.choice([True, False]),
            "createdAt": random_date()
        })

    # Faculty (Keep existing, maybe add one more)
    filler_data["Faculty"] = list(existing_data.get("Faculty", []))
    existing_faculty_codes = {fac["code"] for fac in filler_data["Faculty"]}
    available_deans = [dean["staffId"] for dean in filler_data.get("Dean", []) if dean.get("facultyId") is None]
    if available_deans:
        filler_data["Faculty"].append({
            "id": generate_unique_id("Faculty", filler_data),
            "name": f"Faculty of {get_random(['Business', 'Law'])}",
            "code": generate_unique_code(get_random(['BUS', 'LAW']), existing_faculty_codes),
            "createdAt": random_date(),
            "isDeleted": 0,
            "updatedAt": random_date(),
            "deanId": get_random(available_deans)
        })

    # SchoolSetting (Keep existing)
    filler_data["SchoolSetting"] = list(existing_data.get("SchoolSetting", []))
    academic_session_ids = [session["id"] for session in existing_data.get("AcademicSession", [])]
    if filler_data["SchoolSetting"]:
        filler_data["SchoolSetting"][0]["currentAcademicSessionId"] = get_random(academic_session_ids)

    # AcademicSession (Keep existing, maybe add one more)
    filler_data["AcademicSession"] = list(existing_data.get("AcademicSession", []))
    existing_session_names = {session["name"] for session in filler_data["AcademicSession"]}
    next_year = max(int(s["name"].split('/')[0]) for s in filler_data["AcademicSession"]) + 1 if filler_data["AcademicSession"] else 2026
    new_session_name = f"{next_year}/{next_year + 1}"
    if new_session_name not in existing_session_names:
        filler_data["AcademicSession"].append({
            "id": generate_unique_id("AcademicSession", filler_data),
            "name": new_session_name
        })

    # User
    filler_data["User"] = list(existing_data.get("User", []))
    existing_emails = {user["email"] for user in filler_data["User"]}
    student_ids_for_user = [stu["id"] for stu in existing_data.get("Student", []) if not any(u["studentId"] == stu["id"] for u in filler_data["User"])]
    staff_ids_for_user = [staff["id"] for staff in existing_data.get("Staff", []) if not any(u["staffId"] == staff["id"] for u in filler_data["User"])]
    roles = ["Student", "Staff"]
    for _ in range(2): # Generate 2 more users
        first_name = get_random(["Ivy", "Kevin"])
        last_name = get_random(["Moore", "Taylor"])
        role = get_random(roles)
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 100)}@school.com"
        if email not in existing_emails:
            new_user = {
                "id": generate_unique_id("User", filler_data),
                "email": email,
                "password": "$2a$10$fakehashedpassword", # Replace with actual hashing in real app
                "role": role,
                "studentId": get_random(student_ids_for_user) if role == "Student" else None,
                "staffId": get_random(staff_ids_for_user) if role == "Staff" else None,
                "isDeleted": 0,
                "createdAt": random_date()
            }
            filler_data["User"].append(new_user)
            existing_emails.add(email)

    # Log (Add a few random logs)
    filler_data["Log"] = list(existing_data.get("Log", []))
    error_origins = ["client", "server"]
    statuses = ["Success", "Failure"]
    for _ in range(5):
        filler_data["Log"].append({
            "id": generate_unique_id("Log", filler_data),
            "origin": get_random(error_origins),
            "details": f"Random log detail {random.randint(1, 20)}",
            "ipAddress": f"192.168.1.{random.randint(1, 254)}",
            "userAgent": f"Mozilla/5.0 (Random OS) AppleWebKit/{random.randint(100, 999)}.{random.randint(1, 99)} (KHTML, like Gecko) RandomBrowser/{random.randint(1, 50)}.{random.randint(1, 9)}",
            "status": get_random(statuses),
            "error": f"Random error message {random.randint(1, 15)}" if random.random() < 0.3 else None,
            "createdAt": random_date(),
            "updatedAt": random_date()
        })

    return filler_data

if __name__ == "__main__":
    existing_data = {
      "Course": [
        {
          "id": 1,
          "name": "Computer Analysis",
          "code": "CSE 191",
          "credits": 3,
          "departmentId": 1,
          "lecturerId": 5,
          "createdAt": "2025-05-13T10:26:16.126Z",
          "isDeleted": 0
        }
      ],
      "Registration": [],
      "HOD": [
        {
          "id": 1,
          "staffId": 1,
          "departmentId": 1,
          "isDeleted": 0
        },
        {
          "id": 2,
          "staffId": 8,
          "departmentId": 2,
          "isDeleted": 0
        }
      ],
      "NextId": [
        {
          "id": 1,
          "tableName": "staff",
          "nextId": 12
        },
        {
          "id": 2,
          "tableName": "student",
          "nextId": 4
        }
      ],
      "Staff": [
        {
          "id": 1,
          "userId": None,
          "staffId": "STAFF00001",
          "firstName": "Oreoluwa",
          "lastName": "Hallel",
          "position": "professor",
          "departmentId": 1,
          "createdAt": "2025-05-12T11:02:58.661Z",
          "isDeleted": 0
        },
        {
          "id": 4,
          "userId": None,
          "staffId": "STAFF00002",
          "firstName": "Oreoluwa",
          "lastName": "Hallel",
          "position": "professor",
          "departmentId": 1,
          "createdAt": "2025-05-12T11:08:19.673Z",
          "isDeleted": 0
        },
        {
          "id": 5,
          "userId": None,
          "staffId": "STAFF00003",
          "firstName": "Johnson",
          "lastName": "Emmanuel",
          "position": "doctor",
          "departmentId": 1,
          "createdAt": "2025-05-12T11:28:33.333Z",
          "isDeleted": 0
        },
        {
          "id": 8,
          "userId": None,
          "staffId": "STAFF00004",
          "firstName": "Teacher",
          "lastName": "School",
          "position": "lecturer",
          "departmentId": 2,
          "createdAt": "2025-05-12T11:31:15.267Z",
          "isDeleted": 0
        }
      ],
      "Department": [
        {
          "id": 1,
          "name": "Computer Science",
          "code": "CSE",
          "hodId": 1,
          "facultyId": 1,
          "isDeleted": 0
        },
        {
          "id": 2,
          "name": "Literature",
          "code": "LIT",
          "hodId": 2,
          "facultyId": 2,
          "isDeleted": 0
        }
      ],
      "Dean": [],
      "Result": [],
      "Semester": [
        {
          "id": 1,
          "name": "First Semester",
          "academicSessionId": 1
        },
        {
          "id": 2,
          "name": "Second Semester",
          "academicSessionId": 1
        },
        {
          "id": 3,
          "name": "First Semester",
          "academicSessionId": 2
        },
        {
          "id": 4,
          "name": "Second Semester",
          "academicSessionId": 2
        }
      ],
      "Student": [
        {
          "id": 1,
          "userId": None,
          "studentId": "STU00001",
          "firstName": "First",
          "lastName": "Prof",
          "departmentId": 2,
          "createdAt": "2025-05-12T16:13:28.744Z",
          "isDeleted": 0
        },
        {
          "id": 2,
          "userId": None,
          "studentId": "STU00003",
          "firstName": "John",
          "lastName": "Doe",
          "departmentId": 1,
          "createdAt": "2025-05-12T17:49:49.901Z",
          "isDeleted": 0
        }
      ],
      "Notification": [],
      "Faculty": [
        {
          "id": 1,
          "name": "Science",
          "code": "SCI",
          "createdAt": "2025-05-12T10:33:00.757Z",
          "isDeleted": 0,
          "updatedAt": "2025-05-12T13:40:56.109Z",
          "deanId": 4
        },
        {
          "id": 2,
          "name": "Faculty of Arts",
          "code": "ART",
          "createdAt": "2025-05-12T14:41:19.159Z",
          "isDeleted": 0,
          "updatedAt": "2025-05-13T10:39:08.525Z",
          "deanId": 8
        },
        {
          "id": 3,
          "name": "Faculty of Engineering",
          "code": "ENG",
          "createdAt": "2025-05-13T12:12:25.504Z",
          "isDeleted": 0,
          "updatedAt": "2025-05-13T12:12:25.504Z",
          "deanId": None
        }
      ],
      "SchoolSetting": [
        {
          "id": 7,
          "name": "Cyberwizdev University",
          "address": "123 Education Street, Knowledge City, 12345",
          "currentAcademicSessionId": 2,
          "semestersPerSession": 2
        }
      ],
      "AcademicSession": [
        {
          "id": 1,
          "name": "2023/2024"
        },
        {
          "id": 2,
          "name": "2024/2025"
        }
      ],
      "User": [
        {
          "id": 1,
          "email": "hallelojowuro@gmail.com",
          "password": "$2a$12$.a/yiN5hYNmKqKo75qBx9uw0UrzwtK6Bgpjx6ABQ9w1GQc3yyAqcW",
          "role": "Admin",
          "studentId": None,
          "staffId": None,
          "isDeleted": 0,
          "createdAt": "2025-05-10T15:04:38.097Z"
        },
        {
          "id": 2,
          "email": "john.doe@school.com",
          "password": "$2a$10$ViBB6cNCUeYW033a1/igtut/9Fb9bmjDfrJddZ0iGRu5V6MuneZma",
          "role": "Student",
          "studentId": 2,
          "staffId": None,
          "isDeleted": 0,
          "createdAt": "2025-05-10T15:04:38.097Z"
        },
        {
          "id": 3,
          "email": "jane.smith@school.com",
          "password": "$2a$10$ViBB6cNCUeYW033a1/igtut/9Fb9bmjDfrJddZ0iGRu5V6MuneZma",
          "role": "Student",
          "studentId": None,
          "staffId": None,
          "isDeleted": 0,
          "createdAt": "2025-05-10T15:04:38.097Z"
        },
        {
          "id": 4,
          "email": "prof.johnson@school.com",
          "password": "$2a$10$2EYlFOp..chzzkCR.rEb3eDnmbPyGRqBagCm1yFBGDIR4Alf./f4q",
          "role": "Staff",
          "studentId": None,
          "staffId": 5,
          "isDeleted": 0,
          "createdAt": "2025-05-10T15:04:38.097Z"
        },
        {
          "id": 5,
          "email": "admin@school.com",
          "password": "$2a$10$ViBB6cNCUeYW033a1/igtut/9Fb9bmjDfrJddZ0iGRu5V6MuneZma",
          "role": "Admin",
          "studentId": None,
          "staffId": None,
          "isDeleted": 0,
          "createdAt": "2025-05-10T15:04:38.097Z"
        },
        {
          "id": 8,
          "email": "admin@school.cyberwizdev.com.ng",
          "password": "$2a$10$GDEuaidK0vKk4wGMiqacq.bVae0WYNqT.M.jGYYisSsltFgWeMxe2",
          "role": "Admin",
          "studentId": None,
          "staffId": None,
          "isDeleted": 0,
          "createdAt": "2025-05-10T15:04:38.097Z"
        },
        {
          "id": 9,
          "email": "student@school.com",
          "password": "$2a$10$c6muCyfR29fRZA0oiwCnIeG2/dhaph50NsX0iFXN94nTL3btbOa4m",
          "role": "Student",
          "studentId": 1,
          "staffId": None,
          "isDeleted": 0,
          "createdAt": "2025-05-10T13:33:12.404Z"
        },
        {
          "id": 10,
          "email": "teacher@school.com",
          "password": "$2a$10$4dJJpu9wqpkUQPouYZ2Dxuhwa9Sgd/IDBsrhmW0FzxE4St0/U/jcu",
          "role": "Staff",
          "studentId": None,
          "staffId": 8,
          "isDeleted": 0,
          "createdAt": "2025-05-10T16:17:48.608Z"
        },
        {
          "id": 11,
          "email": "ore@school.com",
          "password": "$2a$10$Nr/dyyaXPUoRHjmYJ7GRIeNMpdRxMkFxJuo5BVpIOwU.Qzg3upi6G",
          "role": "Staff",
          "studentId": None,
          "staffId": 1,
          "isDeleted": 0,
          "createdAt": "2025-05-12T11:02:58.661Z"
        },
        {
          "id": 12,
          "email": "oreoluwa@school.com",
          "password": "$2a$10$nIDkdFtybmrYuYWTQHRzU.W1pHIFORXiyVex6l1SG7uEOo8RZK9eq",
          "role": "Staff",
          "studentId": None,
          "staffId": 4,
          "isDeleted": 0,
          "createdAt": "2025-05-12T11:08:19.673Z"
        }
      ],
      "Notification": [],
      "Faculty": [
        {
          "id": 1,
          "name": "Science",
          "code": "SCI",
          "createdAt": "2025-05-12T10:33:00.757Z",
          "isDeleted": 0,
          "updatedAt": "2025-05-12T13:40:56.109Z",
          "deanId": 4
        },
        {
          "id": 2,
          "name": "Faculty of Arts",
          "code": "ART",
          "createdAt": "2025-05-12T14:41:19.159Z",
          "isDeleted": 0,
          "updatedAt": "2025-05-13T10:39:08.525Z",
          "deanId": 8
        },
        {
          "id": 3,
          "name": "Faculty of Engineering",
          "code": "ENG",
          "createdAt": "2025-05-13T12:12:25.504Z",
          "isDeleted": 0,
          "updatedAt": "2025-05-13T12:12:25.504Z",
          "deanId": None
        }
      ],
      "SchoolSetting": [
        {
          "id": 7,
          "name": "Cyberwizdev University",
          "address": "123 Education Street, Knowledge City, 12345",
          "currentAcademicSessionId": 2,
          "semestersPerSession": 2
        }
      ],
      "AcademicSession": [
        {
          "id": 1,
          "name": "2023/2024"
        },
        {
          "id": 2,
          "name": "2024/2025"
        }
      ]
    }

    filler_data = generate_filler_data(existing_data)
    output_filename = "filler_data_output.json"
    with open(output_filename, 'w') as f:
        json.dump(filler_data, f, indent=2)
    print(f"Filler data successfully saved to {output_filename}")