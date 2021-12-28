import json

from flask import (
    render_template,
    jsonify,
    request,
)
from flask.views import MethodView

from app.database import session
from app.models import (
    Collection,
    Person
)
from app.api import api
from .helpers import (
    ra_get_list_response,
    ra_item_response,
    make_cors_preflight_response,
)

'''
@api.route('/v1/collections')
def get_collection_list():
    data = {
        'header': (
            ('pk', '#', {'align':'right'}),
            ('collector__full_name', '採集者', {'align': 'right'}),
            ('display_field_number', '採集號', {'align': 'right', 'type': 'x_field_number'}),
            ('collect_date', '採集日期', {'align': 'right'}),
        ),
        'rows': [],
        'model': 'collection',
    }
    #result = session.execute(select(Collection))
    #print (result.all())
    #res = Collection.query.all()
    query = Collection.query
    #rows = []
    #for r in res:
    #    rows.append(r.to_dict())

    #return _corsify_actual_response(jsonify(rows))
    return ra_get_list_response('collection', request, query)

@api.route('/v1/collections/<int:collection_id>')
def get_collection_detail(collection_id):
    col = session.get(Collection, collection_id)
    #result = Person.query.filter(Person.is_collector==True).all()
    return _corsify_actual_response(jsonify(col.to_dict()))
'''
class PersonMethodView(MethodView):

    def get(self, item_id):
        if item_id is None:
            # item_list
            query = Person.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    query = query.filter(Person.full_name.ilike(f'%{keyword}%') | Person.atomized_name['en']['given_name'].astext.ilike(f'%{keyword}%') | Person.atomized_name['en']['inherited_name'].astext.ilike(f'%{keyword}%'))
                if is_collector := filter_dict.get('is_collector', ''):
                    query = query.filter(Person.is_collector==True)
                if is_identifier := filter_dict.get('is_identifier', ''):
                    query = query.filter(Person.is_identifier==True)

            return ra_get_list_response('people', request, query)
        else:
            # single item
            obj = session.get(Person, item_id)
            return ra_item_response('people', request, obj)

    def post(self, item_id):
        # create
        obj = Person()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response('people', request, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(Person, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response('people', request, obj)

    def put(self, item_id):
        # update
        obj = session.get(Person, item_id)
        return ra_item_response('people', request, obj)

    def options(self, item_id):
        print ('opt', item_id)
        return make_cors_preflight_response()
