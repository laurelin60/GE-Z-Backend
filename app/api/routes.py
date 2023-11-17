from flask import Blueprint, request, jsonify, redirect, url_for

from .models import GECategory, CVCCourse

api = Blueprint('api', __name__)


def error_message(string):
    return jsonify({"error": str(string)})


def message(string):
    return jsonify({"msg": str(string)})


@api.get('/')
def index():
    return redirect(url_for('api.docs'))


@api.route('/api/docs')
def docs():
    return "DOCS"


@api.get('/api/cvc-courses')
def get_cvc_courses():
    category = request.args.get('category')

    if category not in ['Ia', 'Ib', 'II', 'III', 'IV', 'Va', 'Vb', 'VI', 'VII', 'VIII']:
        return error_message(f'incorrect param category={category}'), 400

    ge_model = GECategory.query.filter_by(category=category).first()

    res = []
    cvc_courses: list[CVCCourse] = ge_model.cvc_courses
    for cvc_course in cvc_courses:
        ge_categories = []
        for ge in cvc_course.ge_categories:
            ge_categories.append(ge.category)

        pdf_id = 0
        maps_to_courses = set()
        for articulation in cvc_course.articulates_to:
            maps_to_courses.add(articulation.parent_course.course_code)

            if ge_model in articulation.parent_course.ge_categories:
                pdf_id = articulation.pdf_id
                break

        nice_to_haves = cvc_course.nice_to_haves.strip('][').split(', ')
        nice_to_haves_formatted = []
        for nth in nice_to_haves:
            nice_to_haves_formatted.append(nth.strip('\''))

        res.append(
            {
                "college": cvc_course.college_name,
                "courseCode": cvc_course.course_code,
                "courseName": cvc_course.course_name,
                "cvcId:": str(cvc_course.cvc_id),
                "niceToHaves": nice_to_haves_formatted,
                "units": cvc_course.units,
                "term": cvc_course.term_string,
                "startMonth": cvc_course.term_start_month,
                "startDay": cvc_course.term_start_day,
                "endMonth": cvc_course.term_end_month,
                "endDay": cvc_course.term_end_day,
                "tuition": cvc_course.tuition,
                "async": cvc_course.is_async,
                "hasOpenSeats": cvc_course.has_open_seats,
                "hasPrereqs": cvc_course.has_prereqs,
                "instantEnrollment": cvc_course.instant_enrollment,

                "fulfillsGEs": ge_categories,
                "mapToCourses": list(maps_to_courses),
                "pdfID": str(pdf_id)
            }
        )

    return jsonify(res), 200


@api.get('/api/test')
def test_get():
    return jsonify([
        {
            "college": "Ohlone College",
            "courseCode": "BA101A",
            "courseName": "Financial Accounting",
            "cvcId:": "1051975",
            "niceToHaves": [
                "Online Tutoring",
                "Quality Reviewed"
            ],
            "units": 5,
            "term": "Jan 22 - May 17",
            "startMonth": 1,
            "startDay": 22,
            "endMonth": 5,
            "endDay": 17,
            "tuition": 230,
            "async": True,
            "hasOpenSeats": False,
            "hasPrereqs": False,
            "instantEnrollment": True,

            "fulfillsGEs": ["Ia", "II", "VI"],
            "pdfID": "12345678"
        },
        {
            "college": "My College",
            "courseCode": "ABC123",
            "courseName": "Course Name",
            "cvcId:": "9999999",
            "niceToHaves": [
                "Online Tutoring",
                "Quality Reviewed"
            ],
            "units": 3,
            "term": "Feb 22 - Mar 17",
            "startMonth": 2,
            "startDay": 2,
            "endMonth": 3,
            "endDay": 3,
            "tuition": 999,
            "async": False,
            "hasOpenSeats": True,
            "hasPrereqs": True,
            "instantEnrollment": False,

            "fulfillsGEs": ["III"],
            "pdfID": "12345678"
        }
    ]
    ), 200
