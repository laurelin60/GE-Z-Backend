from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

course_ges = db.Table(
    'course_ges',
    db.Column('parent_course_id', db.Integer, db.ForeignKey('parent_course.id')),
    db.Column('ge_category_id', db.Integer, db.ForeignKey('ge_category.id'))
)

articulation = db.Table(
    'articulation',
    db.Column('parent_course_id', db.Integer, db.ForeignKey('parent_course.id')),
    db.Column('child_course_id', db.Integer, db.ForeignKey('child_course.id'))
)


class GECategory(db.Model):
    __tablename__ = 'ge_category'

    id = db.Column(db.Integer, primary_key=True)

    category = db.Column(db.Integer, nullable=False)


class ParentCourse(db.Model):
    __tablename__ = 'parent_course'

    id = db.Column(db.Integer, primary_key=True)

    course_code = db.Column(db.String(20), nullable=False, unique=True)

    ge_categories = db.relationship('GECategory', secondary=course_ges, backref='courses')
    articulates_from = db.relationship('ChildCourse', secondary=articulation, backref='articulates_to')


class ChildCourse(db.Model):
    __tablename__ = 'child_course'

    id = db.Column(db.Integer, primary_key=True)

    course_code = db.Column(db.String(20), nullable=False)
    pdf_id = db.Column(db.Integer(), nullable=False)
