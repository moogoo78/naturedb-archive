from functools import wraps
import re

from flask import (
    Blueprint,
    request,
    abort,
    render_template,
)
from app.models import (
    Collection,
    Article,
)

admin = Blueprint('admin', __name__)

RESOURCE_MAP = {
    'collections': Collection,
    'articles': Article,
}

def check_res(f):
    #def decorator(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        #print (request.path, flush=True)
        m = re.match(r'/admin/(.+)(/.*)', request.path)
        if m:
            res = m.group(1)
            if res in RESOURCE_MAP:
                result = f(*args, **kwargs)
                return result
        return abort(404)
    return decorated_function
#return decorator

@admin.route('/')
def admin_index():
    return render_template('admin/dashboard.html')

@admin.route('/<resource>/', methods=['GET'])
@check_res
def list_resource(resource):
    model = RESOURCE_MAP[resource]
    #r = model.query.limit(20).all()
    #print(r, flush=True)
    return render_template('admin/list-view.html')

@admin.route('/<resource>/<int:item_id>', methods=['GET'])
@check_res
def get_resource(resource, item_id):
    model = RESOURCE_MAP[resource]
    if obj := model.query.get(item_id):
        return render_template('admin/form-view.html', record=obj)

