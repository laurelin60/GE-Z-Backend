import json

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
def cvc_courses():
    category = request.args.get('category')

    if category not in ['Ia', 'Ib', 'II', 'III', 'IV', 'Va', 'Vb', 'VI', 'VII', 'VIII']:
        return error_message(f'incorrect param category={category}'), 400

    parent_courses = GECategory.query.filter_by(category=category).first().parent_courses

    total_articulations = []
    for p_course in parent_courses:
        articulations = p_course.articulates_from
        if not articulations:
            continue

        for a in articulations:
            total_articulations.append(a)

    result = []
    for articulation in total_articulations:
        child_course = articulation.child_course

        cvc_query = CVCCourse.query.filter_by(
            college_name=child_course.college_name,
            course_code=child_course.course_code.replace(' ', ''),
        ).all()

        for cvc_course in cvc_query:
            data = cvc_course.cvc_data

            json_data = json.loads(data)

            print(json.dumps(json_data, indent=2))

    return message(''), 200


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
              }]
    ), 200
