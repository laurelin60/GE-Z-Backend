from flask import Blueprint, request, jsonify, redirect, url_for

from .models import GECategory

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
    res = []
    for p_course in parent_courses:
        articulations = p_course.articulates_from
        if not articulations:
            continue

        for a in articulations:
            res.append(a)

    return message(res)
