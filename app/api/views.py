import json

from flask import (
    render_template,
    jsonify,
    request,
)
#from sqlalchemy import desc
from flask.views import MethodView

from app.database import session
from app.models import (
    Collection,
    Person,
    NamedArea,
    AreaClass,
    Unit,
    Dataset,
    Organization,
    Identification,
    MeasurementOrFact,
)
from app.taxon.models import (
    ScientificName,
)
from app.api import api
from .helpers import (
    ra_get_list_response,
    ra_item_response,
    make_cors_preflight_response,
)

class UnitMethodView(MethodView):
    RESOURCE_NAME = 'unit'
    model = Unit
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class AreaClassMethodView(MethodView):
    RESOURCE_NAME = 'area_class'
    model = AreaClass
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query.order_by('id')
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class NamedAreaMethodView(MethodView):
    RESOURCE_NAME = 'named_area'
    model = NamedArea
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    query = query.filter(NamedArea.name.ilike(f'%{keyword}%') | NamedArea.name_en.ilike(f'%{keyword}%'))
                if area_class_id := filter_dict.get('area_class_id', ''):
                    query = query.filter(NamedArea.area_class_id==area_class_id)
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class CollectionMethodView(MethodView):
    RESOURCE_NAME = 'collections'
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = Collection.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    query = query.join(Collection.collector).join(Collection.identifications).join(Identification.scientific_name).filter(Person.full_name.ilike(f'%{keyword}%') | Collection.field_number.ilike(f'%{keyword}%') | ScientificName.full_scientific_name.ilike(f'%{keyword}%'))
            #print(query, '--')
            return ra_get_list_response('collections', request, query)
        else:
            # single item
            obj = session.get(Collection, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = Collection()
        #for i, v in request.json.items():
        #    setattr(obj, i, v)
        #session.add(obj)
        #session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(Collection, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(Person, item_id)
        print 
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


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
            return ra_item_response('people', obj)

    def post(self, item_id):
        # create
        obj = Person()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response('people', obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(Person, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response('people',  obj)

    def put(self, item_id):
        # update
        #obj = session.get(Person, item_id)
        query = Person.query.filter(Person.id==item_id)
        if obj := query.first():
            query.update(values=request.json)
            session.commit()
            return ra_item_response('people', obj)

    def options(self, item_id):
        return make_cors_preflight_response()

class DatasetMethodView(MethodView):
    RESOURCE_NAME = 'dataset'
    model = Dataset
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

class OrganizationMethodView(MethodView):
    RESOURCE_NAME = 'organization'
    model = Organization
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class IdentificationMethodView(MethodView):
    RESOURCE_NAME = 'identification'
    model = Identification
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class MeasurementOrFactsMethodView(MethodView):
    RESOURCE_NAME = 'measurement_or_facts'
    model = MeasurementOrFact
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()
