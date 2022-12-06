from functools import wraps
import re

from flask import (
    Blueprint,
    request,
    abort,
    render_template,
    redirect,
    url_for,
    jsonify,
)
from flask.views import View
from flask_login import (
    login_required,
    current_user,
)
from app.models import (
    Collection,
    Article,
    ArticleCategory,
    RelatedLink,
    RelatedLinkCategory,
)
from app.database import session

admin = Blueprint('admin', __name__)

def ammm(*args):
    print(f'[ammm] {args}', flush=True)


# __tablename__
ADMIN_REGISTER_MAP = {
    'related_link': {
        'name': 'related_link',
        'fields': {
            'title': { 'label': '標題' },
            'category': { 'label': '類別', 'type': 'select', 'foreign': RelatedLinkCategory, 'display': 'label'},
            'url': { 'label': '連結' },
            'note': { 'label': '註記'},
        },
        'list_display': ('title', 'category', 'url', 'note')
    },
    'related_link_category': {
        'name': 'related_link_category',
        'fields': {
            'label': { 'label': '標題' },
            'name': { 'label': 'key' },
            #'sort': { 'label': ''},
        },
        'list_display': ('label', 'name')
    },
    'article': {
        'name': 'article',
        'fields': {
            'subject': { 'label': '標題' },
            'content': { 'label': '內容', 'type': 'textarea'},
            'category': { 'label': '類別', 'type': 'select', 'foreign': ArticleCategory, 'display': 'label'},
            'publish_date': {'label': '發布日期', 'type': 'date'}
        },
        'list_display': ('subject', 'category', 'content', 'publish_date')
    },
    'article_category': {
        'name': 'article_category',
        'fields': {
            'label': { 'label': '標題' },
            'name': { 'label': 'key' },
        },
        'list_display': ('label', 'name')
    }
}

@admin.route('/')
@login_required
def index():
    return render_template('admin/dashboard.html')

@admin.route('/collections/', methods=['GET'])
@login_required
def list_collection():
    return render_template('admin/list-view-collection.html')

@admin.route('/collections/<int:item_id>', methods=['GET'])
@login_required
def get_collection(item_id):
    if obj := model.query.get(item_id):
        return render_template('admin/form-view-collection.html', record=obj)



class ListView(View):
    def __init__(self, model, template='admin/list-view.html'):
        self.model = model
        self.template = template
        self.register = ADMIN_REGISTER_MAP[model.__tablename__]


    def dispatch_request(self):
        # login_requried
        if not current_user.is_authenticated:
            return redirect('/login')

        items = self.model.query.all()
        return render_template(self.template, items=items, register=self.register)


class FormView(View):
    '''
    - has item_id: GET, POST
    - create: GET, POST
    '''
    def __init__(self, model, is_create=False):
        self.model = model
        # self.template = f"{model.__tablename__}/detail.html"
        self.template = 'admin/form-view.html'
        self.register = ADMIN_REGISTER_MAP[model.__tablename__]
        self.item = None
        self.is_create = is_create

    def _get_item(self, item_id):
        return self.model.query.get(item_id)

    def dispatch_request(self, item_id):
        # login_requried
        if not current_user.is_authenticated:
            return redirect('/login')

        if self.is_create is not True:
            self.item = self._get_item(item_id)

            if not self.item:
                return abort(404)

        if request.method == 'GET':
            if self.is_create is not True and item_id:
                return render_template(
                    self.template,
                    item=self.item,
                    register=self.register,
                    action_url=url_for(f'admin.{self.register["name"]}-form', item_id=item_id)
                )
            else:
                return render_template(
                    self.template,
                    register=self.register,
                    action_url=url_for(f'admin.{self.register["name"]}-create')
                )
        elif request.method == 'POST':
            # create new instance
            if self.is_create is True:
                self.item = self.model()
                session.add(self.item)

            for key, value in request.form.items():
                if hasattr(self.item, key):
                    m = re.match(r'.+(_id)$', key)
                    if m:
                        if value == '':
                            setattr(self.item, key, None)
                        else:
                            setattr(self.item, key, value)
                    else:
                        setattr(self.item, key, value)
                session.commit()

            return redirect(url_for(f'admin.{self.model.__tablename__}-list'))
        elif request.method == 'DELETE':
            session.delete(self.item)
            session.commit()
            next_url = url_for(f'admin.{self.model.__tablename__}-list')
            return jsonify({'next_url': next_url})



# common url rule
MODEL_MAP = [
    ('related_link', 'related_links', RelatedLink),
    ('related_link_category', 'related_link_categories', RelatedLinkCategory),
    ('article', 'articles', Article),
    ('article_category', 'article_categories', ArticleCategory),
]
for i in MODEL_MAP:
    admin.add_url_rule(
        f'/{i[1]}/',
        view_func=ListView.as_view(f'{i[0]}-list', i[2]),
    )
    admin.add_url_rule(
        f'/{i[1]}/<int:item_id>',
        view_func=FormView.as_view(f'{i[0]}-form', i[2]),
        methods=['GET', 'POST', 'DELETE']
    )
    admin.add_url_rule(
        f'/{i[1]}/create',
        defaults={'item_id': None},
        view_func=FormView.as_view(f'{i[0]}-create', i[2], is_create=True),
        methods=['GET', 'POST']
    )

'''
## TEMPLATE ##

# articles
admin.add_url_rule(
    '/articles/',
    view_func=ListView.as_view('article-list', Article),
)
admin.add_url_rule(
    '/articles/<int:item_id>',
    view_func=FormView.as_view('article-form', Article),
    methods=['GET', 'POST', 'DELETE']
)
admin.add_url_rule(
    '/article/create',
    defaults={'item_id': None},
    view_func=FormView.as_view('article-create', Article, is_create=True),
    methods=['GET', 'POST']
)
'''



# @admin.app_template_filter()
# def get_value(item, key):
#     if '.' in key:
#         tmp = item
#         for k in key.split('.'):
#             tmp = getattr(tmp, k)
#         return tmp
#     else:
#         return getattr(item, key)
#     return item


# def check_res(f):
#     #def decorator(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         #print (request.path, flush=True)
#         m = re.match(r'/admin/(.+)(/.*)', request.path)
#         if m:
#             res = m.group(1)
#             if res in RESOURCE_MAP:
#                 result = f(*args, **kwargs)
#                 return result
#         return abort(404)
#     return decorated_function
#return decorator

@admin.app_template_filter()
def get_display(item):
    if isinstance(item, str):
        return item
    else:
        print(item.name,dir(item), flush=True)
    return ''
