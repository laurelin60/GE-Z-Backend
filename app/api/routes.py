from flask import Blueprint

api = Blueprint('api', __name__)


@api.get('/')
def index():
    return 'API INDEX'


@api.get('/get_cvc_by_ge')
def index():
    return 'API INDEX'
