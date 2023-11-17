from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView


class GECategoryView(ModelView):
    page_size = 500

    column_list = ('category', 'college_name')


class ParentCourseView(ModelView):
    page_size = 500

    column_list = ('college_name', 'course_code', 'ge_categories')


class ChildCourseView(ModelView):
    page_size = 500

    column_list = ('college_name', 'course_code', 'articulates_to')


admin = Admin(template_mode='bootstrap3')
