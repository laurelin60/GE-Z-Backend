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
    return "<h1>GE-Z Backend</h1> <a href=\"https://github.com/laurelinXYZABC/Degree-EZ-Backend#readme\">docs</a>"


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
            if ge_model in articulation.parent_course.ge_categories:
                maps_to_courses.add(articulation.parent_course.course_code)
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
                "cvcId": str(cvc_course.cvc_id),
                "niceToHaves": nice_to_haves_formatted,
                "units": cvc_course.units,
                "term": cvc_course.term_string,
                "startMonth": cvc_course.term_start_month,
                "startDay": cvc_course.term_start_day,
                "endMonth": cvc_course.term_end_month,
                "endDay": cvc_course.term_end_day,
                "tuition": cvc_course.tuition,
                "format": cvc_course.is_async,
                "hasOpenSeats": cvc_course.has_open_seats,
                "hasPrereqs": cvc_course.has_prereqs,
                "instantEnrollment": cvc_course.instant_enrollment,

                "fulfillsGEs": ge_categories,
                "mapToCourses": list(maps_to_courses),
                "pdfId": str(pdf_id)
            }
        )

    return jsonify(res), 200
