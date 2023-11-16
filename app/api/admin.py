from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView


class GECategoryView(ModelView):
    column_list = ('category', 'courses')


class ParentCourseView(ModelView):
    column_list = ('college_name', 'course_code', 'ge_categories', 'articulates_from')


class ChildCourseView(ModelView):
    column_list = ('college_name', 'course_code', 'articulates_to')


admin = Admin(template_mode='bootstrap3')
