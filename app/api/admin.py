from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView


class GECategoryView(ModelView):
    page_size = 100

    column_list = ('category', 'college_name')


class ParentCourseView(ModelView):
    page_size = 100

    column_list = ('college_name', 'course_code', 'ge_categories', 'articulates_from')


class ChildCourseView(ModelView):
    page_size = 100

    column_list = ('college_name', 'course_code', 'articulates_to')

class ArticulationView(ModelView):
    page_size = 100

    column_list = ('pdf_id', 'parent_course', 'child_course')

class CVCCourseView(ModelView):
    page_size = 5000

    column_list = ('college_name', 'course_code')

class CVCArticulationView(ModelView):
    page_size = 5000

    column_list = ('pdf_id', 'parent_course', 'cvc_course')


admin = Admin(template_mode='bootstrap3')
