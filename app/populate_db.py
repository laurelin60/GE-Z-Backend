import json
from pathlib import Path

from api import create_app
from api.models import db, GECategory, ParentCourse, ChildCourse

app = create_app()


def populate_ge_categories():
    print("CREATING GECategories")
    ge_lis = ['Ia', 'Ib', 'II', 'III', 'IV', 'Va', 'Vb', 'VI', 'VII', 'VIII']
    for ge in ge_lis:
        if GECategory.query.filter_by(category=ge).first():
            continue

        db.session.add(GECategory(category=ge))
        db.session.commit()


def populate_parent_courses(ge_json_path):
    print("CREATING ParentCourses")
    with open(ge_json_path, 'r') as f:
        data = json.loads(f.read())

    for course in data:
        if ParentCourse.query.filter_by(course_code=course).first():
            continue

        parent = ParentCourse(course_code=course)
        db.session.add(parent)

        ge_categories = data[course]
        for ge in ge_categories:
            ge_object = GECategory.query.filter_by(category=ge).first()
            parent.ge_categories.append(ge_object)

        db.session.commit()


def populate_child_courses(directory_path):
    print("CREATING ChildCourses")

    total = len(list(Path(directory_path).rglob('*.json')))
    x = int(total / 50)

    for i, path in enumerate(Path(directory_path).rglob('*.json')):
        if i % x == 0:
            print(int(i / x) * '#' + (50 - int(i / x)) * ' ' + '|')

        with open(path, 'r') as f:
            data = json.loads(f.read())

        pdf_id = data["ID"]
        articulations = data["Articulations"]

        for a in articulations:
            to_code = a["to"]["code"]

            parent = ParentCourse.query.filter_by(course_code=to_code).first()
            if not parent:
                continue

            from_code = a["from"]["code"]
            college_name = path.parts[-2].replace('_', ' ')

            child_query = ChildCourse.query.filter_by(course_code=from_code, pdf_id=pdf_id).first()
            if child_query:
                child_query.articulates_to.append(parent)
                continue

            child = ChildCourse(course_code=from_code, pdf_id=pdf_id, college_name=college_name)
            db.session.add(child)

            parent.articulates_from.append(child)
            db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        populate_ge_categories()
        populate_parent_courses('../utils/data/GEs_formatted.json')
        populate_child_courses(r'C:\Users\awang\Downloads\transfer-courses-new-half')
