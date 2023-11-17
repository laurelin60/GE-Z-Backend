import json
from pathlib import Path

from .models import db, ParentCourse, ChildCourse, GECategory


def populate_ge_categories():
    categories = [GECategory(category=i) for i in range(1, )


def populate_child_courses(directory_path):
    for path in Path(directory_path).rglob('*.json'):
        with open(path, 'r') as f:
            data = json.loads(f.read())

        pdf_id = data["ID"]
        articulations = data["Articulations"]

        for a in articulations:
            from_code = a["from"]["code"]
            to_code = a["to"]["code"]


def main():
    populate_child_courses()


if __name__ == '__main__':
    main()
