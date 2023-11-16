from flask import Flask

from .admin import *
from .models import db
from .routes import api


def create_app():
    app = Flask(__name__)

    app.config.from_pyfile('config.py')

    app.register_blueprint(api, url_prefix='/api')

    db.init_app(app)

    admin.init_app(app)

    model_views_to_register = {
        ParentCourseView(models.ParentCourse, db.session),
        ChildCourseView(models.ChildCourse, db.session),
        GECategoryView(models.GECategory, db.session)
    }

    for model_view in model_views_to_register:
        admin.add_view(model_view)

    return app
