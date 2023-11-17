import json
from pathlib import Path

from api import create_app
from api.models import db, GECategory, ParentCourse, ChildCourse, Articulation, CVCCourse

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

            parent_course = ParentCourse.query.filter_by(
                course_code=to_code
            ).first()

            # if parent course does not fulfill a GE
            # no need to keep track of data
            if not parent_course:
                continue

            from_code = a["from"]["code"]
            college_name = path.parts[-2].replace('_', ' ')

            child_course = ChildCourse.query.filter_by(
                course_code=from_code,
                college_name=college_name
            ).first()

            if child_course:  # if exact child course already exists

                # if articulation between parent and child already exists
                # no need to add same articulation
                articulation = Articulation.query.filter_by(
                    parent_course_id=parent_course.id,
                    child_course_id=child_course.id,
                ).first()

                if articulation:
                    continue

                # else add articulation between existing child and existing parent
                articulation = Articulation(
                    parent_course=parent_course,
                    parent_course_id=parent_course.id,
                    child_course=child_course,
                    child_course_id=child_course.id,
                    pdf_id=pdf_id
                )

                db.session.add(articulation)
                db.session.commit()

            else:
                # if child course does not yet exist
                # create and add new child course
                # add articulation between new child and parent

                child_course = ChildCourse(
                    course_code=from_code,
                    college_name=college_name
                )

                db.session.add(child_course)

                articulation = Articulation(
                    parent_course=parent_course,
                    parent_course_id=parent_course.id,
                    child_course=child_course,
                    child_course_id=child_course.id,
                    pdf_id=pdf_id
                )

                db.session.add(articulation)
                db.session.commit()


def populate_cvc_data():
    month_ints = {
        "Jan": 1,
        "Feb": 2,
        "Mar": 3,
        "Apr": 4,
        "May": 5,
        "Jun": 6,
        "Jul": 7,
        "Aug": 8,
        "Sep": 9,
        "Oct": 10,
        "Nov": 11,
        "Dec": 12
    }
    path = r"C:\Users\awang\PycharmProjects\DegreasyBackend\utils\data\CVC.json"
    with open(path, 'r') as f:
        data_raw = f.read()
        data = json.loads(data_raw)

        data = data["data"]

        for d in data:
            college_name = d["college"]
            course_name = d["course"]
            course_code = course_name.split("-")[0].strip()

            term = d["term"]
            term_start = term.split("-")[0].strip()
            term_end = term.split("-")[1].strip()

            term_start_month = term_start.split(' ')[0]
            term_start_month_int = month_ints[term_start_month]

            term_start_day_int = int(term_start.split(' ')[0])

            term_end_month = term_end.split(' ')[0]
            term_end_month_int = month_ints[term_end_month]

            term_end_day_int = int(term_end.split(' ')[0])

            d["startMonth"] = term_start_month_int
            d["startDay"] = term_start_day_int
            d["endMonth"] = term_end_month_int
            d["endDay"] = term_end_day_int

            d = json.loads(d)
            d = d.replace('\'', '"')
            d = d.replace(": True", ": true")
            d = d.replace(": False", ": false")

            cvc_query = CVCCourse.query.filter_by(
                course_code=course_code,
                college_name=college_name,
                cvc_data=str(d)
            ).first()

            if cvc_query:
                continue

            cvc_course = CVCCourse(
                course_code=course_code,
                college_name=college_name,
                cvc_data=str(d)
            )
            db.session.add(cvc_course)
            db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        # populate_ge_categories()
        # populate_parent_courses('../utils/data/GEs_formatted.json')
        # populate_child_courses(r'C:\Users\awang\Downloads\transfer-courses-new-half')
        populate_cvc_data()
