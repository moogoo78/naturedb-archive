import json

from flask import (
    render_template,
    jsonify,
    request,
    current_app,
    abort,
)
from sqlalchemy import select

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
    CollectionNamedArea,
)
from app.taxon.models import (
    Taxon,
)
from app.api import api
from .helpers import (
    ra_get_list_response,
    ra_item_response,
    make_cors_preflight_response,
    make_react_admin_response,
)

@api.route('/auth', methods=['POST', 'OPTIONS'])
def auth():
    if request.method == 'OPTIONS':
        return make_cors_preflight_response()
    elif request.method == 'POST':
        payload = request.json

        data = {
            'err_msg': 'need check'
        }
        if payload['username'] == 'root' and payload['password'] == '1234':
            #data.update({'err_msg': ''})
            resp = jsonify(data)
            resp.headers.add('Access-Control-Allow-Origin', '*')
            resp.headers.add('Access-Control-Allow-Methods', '*')
            return resp
        else:
            #data.update({'err_msg': 'aoeus'})
            return abort(401)




from app.helpers import query_specimen
class SpecimenMethodView(MethodView):
    RESOURCE_NAME = 'collections'
    model = Collection

    def get(self, item_id):
        if item_id is None:
            # item_list
            query = query_specimen()
            #result = session.execute(stmt)
            #query = result.scalars()
            #print(len(query), flush=True)
            #print(request.args, flush=True)
            #if filter_str := request.args.get('filter', ''):
                #print(filter_str, request.args, flush=True)
            #    filter_dict = json.loads(filter_str)
            #    if keyword := filter_dict.get('q', ''):
            #        query = query.filter(Person.full_name.ilike(f'%{keyword}%'))
                #if keyword := filter_dict.get('q', ''):
                #    query = query.join(Collection.collector).join(Collection.identifications).join(Identification.taxon).filter(Person.full_name.ilike(f'%{keyword}%') | Collection.field_number.ilike(f'%{keyword}%') | Taxon.full_scientific_name.ilike(f'%{keyword}%') | Unit.accession_number.ilike(f'%{keyword}%'))
            #    if collector_id := filter_dict.get('collector_id'):
            #        query = query.filter(Person.id==collector_id)
                #if dataset_ids := filter_dict.get('dataset_id'):
                # TODO, query 順序不對
                #    query = query.join(Unit.collection).filter(Unit.dataset_id.in_(dataset_ids))

            return ra_get_list_response('specimens', request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        obj = self._modify(obj, request.json)
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
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        #print(data, flush=True)
        named_area_list = []
        for i, v in data.items():
            # available types: str, int, NoneType
            if 'named_area_' in i and i != 'named_area_list':
                named_area_list.append(v)
            elif i != 'id' and isinstance(v, str | int | None):
                setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()

        # NamedArea list
        if len(named_area_list) > 0:
            for i in named_area_list:
                cna = CollectionNamedArea(collection_id=obj.id, named_area_id=i)
                session.add(cna)
            session.commit()

        return obj

class TaxonMethodView(MethodView):
    RESOURCE_NAME = 'taxon'
    model = Taxon
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    query = query.filter(Taxon.full_scientific_name.ilike(f'%{keyword}%') | Taxon.common_name.ilike(f'%{keyword}%'))
                if rank := filter_dict.get('rank'):
                    query = query.filter(Taxon.rank==rank)

            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        obj = self._modify(obj, request.json)
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
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        for i, v in data.items():
            # available types: str, int, NoneType
            if i != 'id' and isinstance(v, str | int | None) and hasattr(obj, i):
                setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()
        return obj


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
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    #query = query.filter(ScientificName.full_scientific_name.ilike(f'%{keyword}%'))
                    pass
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        print (request.json, request.args, flush=True)
        #for i, v in request.json.items():
        #    setattr(obj, i, v)
        #session.add(obj)
        #session.commit()
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        #print (item_id, request.args)
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        if 'accession_number__quick' in data.keys():
            # post from collection ouick button
            obj.collection_id = data.get('id')
            obj.accession_number = data.get('accession_number__quick')
            obj.duplication_number = data.get('duplication_number__quick')
        else:
            for i, v in data.items():
                # available types: str, int, NoneType
                if i != 'id' and isinstance(v, str | int | None) and hasattr(obj, i):
                    setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()
        return obj

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
    model = Collection

    def get(self, item_id):
        if item_id is None:
            # item_list
            #query = Collection.query.join(Person).join(Identification).join(ScientificName)
            #query = Collection.query.join(Person)
            query = Collection.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    query = query.join(Collection.collector).join(Collection.identifications).join(Identification.taxon).filter(Person.full_name.ilike(f'%{keyword}%') | Collection.field_number.ilike(f'%{keyword}%') | Taxon.full_scientific_name.ilike(f'%{keyword}%') | Unit.accession_number.ilike(f'%{keyword}%'))
                if collector_id := filter_dict.get('collector_id'):
                    query = query.filter(Person.id==collector_id)
            return ra_get_list_response('collections', request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        obj = self._modify(obj, request.json)
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
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        #print(data, flush=True)
        named_area_list = []
        for i, v in data.items():
            # available types: str, int, NoneType
            if 'named_area_' in i and i != 'named_area_list':
                named_area_list.append(v)
            elif i != 'id' and isinstance(v, str | int | None):
                setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()

        # NamedArea list
        if len(named_area_list) > 0:
            for i in named_area_list:
                cna = CollectionNamedArea(collection_id=obj.id, named_area_id=i)
                session.add(cna)
            session.commit()

        return obj

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
        obj = self._modify(obj, request.json)
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
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        if 'scientific_name_id__quick' in data.keys():
            # post from collection ouick button
            print (data, flush=True)
            obj.collection_id = data.get('id')
            obj.taxon_id = data.get('taxon_id__quick')
            obj.identifier_id = data.get('identifier_id__quick')
            obj.date = data.get('date__quick')
            obj.date_text = data.get('date_text__quick')
            obj.verification_level = data.get('verification_level__quick')
        else:
            for i, v in data.items():
                # available types: str, int, NoneType
                if i != 'id' and isinstance(v, str | int | None) and hasattr(obj, i):
                    setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()
        return obj


class MeasurementOrFactsMethodView(MethodView):
    RESOURCE_NAME = 'measurement_or_facts'
    model = MeasurementOrFact
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if collection_id := filter_dict.get('collection_id', ''):
                    query = query.filter(MeasurementOrFact.collection_id==collection_id)
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
