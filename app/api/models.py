from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

course_ges = db.Table(
    'course_ges',
    db.Column('parent_course_id', db.Integer, db.ForeignKey('parent_course.id')),
    db.Column('ge_category_id', db.Integer, db.ForeignKey('ge_category.id'))
)


class Articulation(db.Model):
    __tablename__ = 'articulation'

    id = db.Column(db.Integer, primary_key=True)

    pdf_id = db.Column(db.Integer, nullable=False)

    parent_course_id = db.Column(db.Integer, db.ForeignKey('parent_course.id'))
    child_course_id = db.Column(db.Integer, db.ForeignKey('child_course.id'))

    parent_course = db.relationship('ParentCourse', back_populates='articulates_from', foreign_keys=[parent_course_id])
    child_course = db.relationship('ChildCourse', back_populates='articulates_to', foreign_keys=[child_course_id])

    def __repr__(self):
        return f'<Articulation {self.id} {self.child_course} -> {self.parent_course}>'


class GECategory(db.Model):
    __tablename__ = 'ge_category'

    id = db.Column(db.Integer, primary_key=True)

    category = db.Column(db.String(10), nullable=False, unique=True)
    college_name = db.Column(db.String(100), nullable=False, default="UC - Irvine")

    def __repr__(self):
        return f'<GECategory {self.category}>'


class ParentCourse(db.Model):
    __tablename__ = 'parent_course'

    id = db.Column(db.Integer, primary_key=True)

    course_code = db.Column(db.String(20), nullable=False, unique=True)
    college_name = db.Column(db.String(100), nullable=False, default="UC - Irvine")

    ge_categories = db.relationship('GECategory', secondary=course_ges, backref='parent_courses')
    articulates_from = db.relationship('Articulation', back_populates='parent_course', lazy=True)

    def __repr__(self):
        return f'<ParentCourse {self.course_code}, {self.college_name}>'


class ChildCourse(db.Model):
    __tablename__ = 'child_course'

    id = db.Column(db.Integer, primary_key=True)

    college_name = db.Column(db.String(100), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)

    articulates_to = db.relationship('Articulation', back_populates='child_course', lazy=True)

    def __repr__(self):
        return f'<ChildCourse {self.course_code}, {self.college_name}>'
