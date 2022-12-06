import json
import time
import re
import logging

from flask import (
    Blueprint,
    request,
    abort,
    jsonify,
)
from flask.views import MethodView
from sqlalchemy import (
    select,
    func,
    text,
    desc,
    cast,
    between,
    Integer,
    LargeBinary,
    extract,
    or_,
    inspect,
    join,
)
from app.database import session
from app.models import (
    Article,
    Collection,
    Person,
    NamedArea,
    AreaClass,
    Unit,
    Dataset,
    Organization,
    Identification,
    MeasurementOrFact,
    MeasurementOrFactParameter,
    LogEntry,
    collection_named_area,
    get_structed_list,
)
from app.taxon.models import (
    Taxon,
    TaxonRelation,
)

api = Blueprint('api', __name__)

def collection_filter(stmt, payload):
    filtr = payload['filter']

    if accession_number := filtr.get('accession_number'):
        an_list = [accession_number]

        if accession_number2 := filtr.get('accession_number2'):
            # TODO validate
            an_int1 = int(accession_number)
            an_int2 = int(accession_number2)
            an_list = [str(x) for x in range(an_int1, an_int2+1)]
            if len(an_list) > 1000:
                an_list = [] # TODO flash

        stmt = stmt.where(Unit.accession_number.in_(an_list))
    if value := filtr.get('collector'):
        stmt = stmt.where(Collection.collector_id==value[0])
    if value := filtr.get('field_number'):
        if value2 := filtr.get('field_number2'):
            # TODO validate
            int1 = int(value)
            int2 = int(value2)
            fn_list = [str(x) for x in range(int1, int2+1)]
            if len(fn_list) > 1000:
                fn_list = [] # TODO flash

            many_or = or_()
            for x in fn_list:
                many_or = or_(many_or, Collection.field_number.ilike(f'{x}%'))
            stmt = stmt.where(many_or)
        else:
            stmt = stmt.where(Collection.field_number.ilike('%{}%'.format(value)))
    if value := filtr.get('field_number_range'):
        if '-' in value:
            start, end = value.split('-')
            fn_list = [str(x) for x in range(int(start), int(end)+1)]
            if len(fn_list) > 1000:
                fn_list = [] # TODO flash

            many_or = or_()
            for x in fn_list:
                many_or = or_(many_or, Collection.field_number == x)
            stmt = stmt.where(many_or)
        else:
            stmt = stmt.where(Collection.field_number.ilike('%{}%'.format(value)))
    if value := filtr.get('collect_date'):
        if value2 := filtr.get('collect_date2'):
            stmt = stmt.where(Collection.collect_date>=value, Collection.collect_date<=value2)
        else:
            stmt = stmt.where(Collection.collect_date==value)
    if value := filtr.get('collect_month'):
        stmt = stmt.where(extract('month', Collection.collect_date) == value)
    # if scientific_name := filtr.get('scientific_name'): # TODO variable name
    #     if t := session.get(Taxon, scientific_name[0]):
    #         taxa_ids = [x.id for x in t.get_children()]
    #         stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    # if taxa := filtr.get('species'):
    #     if t := session.get(Taxon, taxa[0]):
    #         taxa_ids = [x.id for x in t.get_children()]
    #         stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    #         query_key_map['taxon'] = t.to_dict()
    # elif taxa := filtr.get('genus'):
    #     if t := session.get(Taxon, taxa[0]):
    #         taxa_ids = [x.id for x in t.get_children()]
    #         stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    #         query_key_map['taxon'] = t.to_dict()
    # elif taxa := filtr.get('family'):
    #     if t := session.get(Taxon, taxa[0]):
    #         taxa_ids = [x.id for x in t.get_children()]
    #         stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    #         query_key_map['taxon'] = t.to_dict()
    elif taxa_ids := filtr.get('taxon'):
        if t := session.get(Taxon, taxa_ids[0]):
            taxa_ids = [x.id for x in t.get_children()]
            stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    elif taxa_names := filtr.get('taxon_name'):
        taxa_name = taxa_names[0]
        stmt = stmt.where(Collection.proxy_taxon_text.ilike(f'%{taxa_name}%'))

    if value := filtr.get('locality_text'):
        stmt = stmt.where(Collection.locality_text.ilike(f'%{value}%'))
    if value := filtr.get(''):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('named_area'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('country'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('stateProvince'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
        print(stmt, flush=True)
    if value := filtr.get('county'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('locality'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('national_park'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('locality_text'):
        stmt = stmt.where(Collection.locality_text.ilike(f'%{value}%'))
    if value := filtr.get('altitude'):
        value2 = filtr.get('altitude2')
        if cond := filtr.get('altitude_condiction'):
            if cond == 'eq':
                stmt = stmt.where(Collection.altitude==value)
            elif cond == 'gte':
                stmt = stmt.where(Collection.altitude>=value)
            elif cond == 'lte':
                stmt = stmt.where(Collection.altitude<=value)
            elif cond == 'between' and value2:
                stmt = stmt.where(Collection.altitude>=value, Collection.altitude2<=value2)
        else:
            stmt = stmt.where(Collection.altitude==value)

    if value := filtr.get('type_status'):
        stmt = stmt.where(Unit.type_status==value)

    return stmt

def allow_cors_preflight():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def allow_cors(data):
    resp = jsonify(data)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@api.route('/collections/<int:collection_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def collection_item(collection_id):
    obj = session.get(Collection, collection_id)
    if not obj:
        return abort(404)

    if request.method == 'GET':
        data = obj.to_dict()
        return allow_cors({
            'data': data,
            'form': obj.get_form_layout()
        })

    elif request.method == 'OPTIONS':
        return allow_cors_preflight()

    elif request.method == 'PUT':
        changes = obj.update_from_json(request.json)
        log = LogEntry(
            model='Collection',
            item_id=collection_id,
            action='update',
            changes=changes)
        session.add(log)
        session.commit()

        return allow_cors(obj.to_dict())
    elif request.method == 'DELETE':
        session.delete(obj)
        session.commit()
        log = LogEntry(
            model='Collection',
            item_id=item.id,
            action='delete')
        session.add(log)
        session.commit()
        return allow_cors({})



@api.route('/searchbar', methods=['GET'])
def get_searchbar():
    '''for searchbar
    '''
    q = request.args.get('q')
    data = []
    if q.isdigit():
        # Field Number (with Collector)
        rows = Collection.query.filter(Collection.field_number.ilike(f'{q}%')).limit(10).all()
        for r in rows:
            item = {
                'id': r.id,
                'field_number': r.field_number or '',
                'collector': r.collector.to_dict() if r.collector else {},
            }
            item['term'] = 'field_number_with_collector'
            data.append(item)

        # Accession Number
        rows = Unit.query.filter(Unit.accession_number.ilike(f'{q}%')).limit(10).all()
        for r in rows:
            #unit = r.to_dict()
            unit = {
                'id': r.id,
                'accession_number': r.accession_number
            }
            unit['term'] = 'accession_number'
            data.append(unit)
    elif '-' in q:
        m = re.search(r'([0-9]+)-([0-9]+)', q)
        if m:
            data.append({
                'field_number_range': q,
                'term': 'field_number_range',
            })
    else:
        # Collector
        rows = Person.query.filter(Person.full_name.ilike(f'%{q}%') | Person.atomized_name['en']['given_name'].astext.ilike(f'%{q}%') | Person.atomized_name['en']['inherited_name'].astext.ilike(f'%{q}%')).limit(10).all()
        for r in rows:
            collector = r.to_dict()
            collector['term'] = 'collector'
            data.append(collector)

        # Taxon
        rows = Taxon.query.filter(Taxon.full_scientific_name.ilike(f'{q}%') | Taxon.common_name.ilike(f'%{q}%')).limit(10).all()
        for r in rows:
            taxon = r.to_dict()
            taxon['term'] = 'taxon'
            data.append(taxon)

        # Location
        rows = NamedArea.query.filter(NamedArea.name.ilike(f'{q}%') | NamedArea.name_en.ilike(f'%{q}%')).limit(10).all()
        for r in rows:
            loc = r.to_dict()
            loc['term'] = 'named_area'
            data.append(loc)

    resp = jsonify({
        'data': data,
    })
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')
    return resp


@api.route('/explore', methods=['GET'])
def get_explore():
    view = request.args.get('view', '')
    # group by collection
    #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Unit).join(Collection, full=True).group_by(Collection.id) #where(Unit.id>40, Unit.id<50)
    # TODO: full outer join cause slow
    #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Collection).join(Unit).group_by(Collection.id)

    # cast(func.nullif(Collection.field_number, 0), Integer)
    #unit_collection_join = join(Unit, Collection, Unit.collection_id==Collection.id)
    #collection_person_join = join(Collection, Person, Collection.collector_id==Person.id)
    #orig stmt = select(Unit.id, Unit.accession_number, Collection, Person.full_name).join(Collection, Collection.id==Unit.collection_id).join(Person, Collection.collector_id==Person.id)
    stmt = select(Unit, Collection) \
    .join(Unit, Unit.collection_id==Collection.id, isouter=True) \
    .join(Person, Collection.collector_id==Person.id)

    #res = session.execute(stmt)
    #.select_from(cp_join)
    #print(f'!!default stmt: \n{stmt}\n-----------------', flush=True)
    total = request.args.get('total', None)

    payload = {
        'filter': json.loads(request.args.get('filter')) if request.args.get('filter') else {},
        'sort': json.loads(request.args.get('sort')) if request.args.get('sort') else {},
        'range': json.loads(request.args.get('range')) if request.args.get('range') else [0, 20],
    }
    # query_key_map = {}
    print(payload, flush=True)
    stmt = collection_filter(stmt, payload)
    # logging.debug(stmt)

    base_stmt = stmt
    # print(payload['filter'], flush=True)
    # sort
    if view == 'checklist':
        stmt = stmt.order_by(Collection.proxy_taxon_text)
    elif view != 'map':
        if sort := payload['sort']:
            if 'collect_date' in sort:
                stmt = stmt.order_by(Collection.collect_date)
            elif 'collect_num' in sort:
                stmt = stmt.order_by(Person.full_name, cast(Collection.field_number, LargeBinary)) # TODO ulitilize Person.sorting_name
            elif 'taxon' in sort:
                stmt = stmt.order_by(Collection.proxy_taxon_text)
            elif 'created' in sort:
                stmt = stmt.order_by(Collection.created)
        else:
            # default order
            stmt = stmt.order_by(Person.full_name, cast(Collection.field_number, LargeBinary)) # TODO ulitilize Person.sorting_name
        #print(stmt, flush=True)

    # limit & offset
    if view != 'checklist':
        start = int(payload['range'][0])
        end = int(payload['range'][1])
        limit = min((end-start), 1000) # TODO: max query range
        stmt = stmt.limit(limit)
        if start > 0:
            stmt = stmt.offset(start)

    # group by
    #if view == 'checklist':
    #    stmt = stmt.group_by(Collection.proxy_taxon_id)

    # =======
    # results
    # =======
    begin_time = time.time()
    result = session.execute(stmt)
    elapsed = time.time() - begin_time

    # -----------
    # count total
    # -----------
    elapsed_count = None
    if total is None:
        begin_time = time.time()
        subquery = base_stmt.subquery()
        count_stmt = select(func.count()).select_from(subquery)
        total = session.execute(count_stmt).scalar()
        elapsed_count = time.time() - begin_time

    # --------------
    # result mapping
    # --------------
    data = []
    begin_time = time.time()
    elapsed_mapping = None

    rank_list = [{}, {}, {}] # family, genus, species
    rank_map = {'family': 0, 'genus': 1, 'species': 2}
    is_truncated = False
    TRUNCATE_LIMIT = 2000
    if view == 'checklist' and total > TRUNCATE_LIMIT: #  TODO
        is_truncated = True

    rows = result.all()
    if is_truncated is True:
        rows = rows[0:TRUNCATE_LIMIT] # TODO

    for r in rows:
        if c := r[1]:
            t = None
            if taxon_id := c.proxy_taxon_id:
                t = session.get(Taxon, taxon_id)

            if view == 'map':
                if c.longitude_decimal and c.latitude_decimal:
                    data.append({
                        'accession_number': r[1],
                        'collector': c.collector.to_dict() if c.collector else '',
                        'field_number': c.field_number,
                        'collect_date': c.collect_date.strftime('%Y-%m-%d') if c.collect_date else '',
                        'taxon': c.proxy_taxon_text,
                        'longitude_decimal': c.longitude_decimal,
                        'latitude_decimal': c.latitude_decimal,
                    })
            elif view == 'checklist':
                if c.proxy_taxon_id:
                    # taxon = session.get(Taxon, c.proxy_taxon_id)
                    # parents = taxon.get_parents()
                    tr_list = TaxonRelation.query.filter(TaxonRelation.child_id==c.proxy_taxon_id).order_by(TaxonRelation.depth).all()
                    tlist = [r.parent for r in tr_list]
                    for index, t in enumerate(tlist):
                        map_idx = rank_map[t.rank]
                        parent_id = 0
                        if index < len(tlist) - 1:
                            parent_id = tlist[index+1].id
                        if t.id not in rank_list[map_idx]:
                            rank_list[map_idx][t.id] = {
                                'obj': t.to_dict(),
                                'parent_id': parent_id,
                                'count': 1,
                                'children': [],
                            }
                        else:
                            rank_list[map_idx][t.id]['count'] += 1
            else:
                image_url = ''
                try:
                    accession_number_int = int(r[0].accession_number)
                    instance_id = f'{accession_number_int:06}'
                    first_3 = instance_id[0:3]
                    image_url = f'https://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}_s.jpg'
                except:
                    pass

                unit_id = r[0] or ''
                data.append({
                    'unit_id': r[0].id,
                    'collection_id': c.id,
                    'record_key': f'u{r[0].id}' if r[0] else f'c{c.id}',
                    'accession_number': r[0].accession_number,
                    'image_url': image_url,
                    'field_number': c.field_number,
                    'collector': c.collector.to_dict() if c.collector else '',
                    'collect_date': c.collect_date.strftime('%Y-%m-%d') if c.collect_date else '',
                    'taxon_text': c.proxy_taxon_text,
                    'taxon': t.to_dict() if t else {},
                    'named_areas': [x.to_dict() for x in c.named_areas],
                    'locality_text': c.locality_text,
                    'altitude': c.altitude,
                    'altitude2': c.altitude2,
                    'longitude_decimal': c.longitude_decimal,
                    'latitude_decimal': c.latitude_decimal,
                    'type_status': r[0].type_status if r[0].type_status else '',
                })

    elapsed_mapping = time.time() - begin_time

    # update data while view = checklist
    if view == 'checklist':
        flat_list = []
        tree = {'id':0, 'children':[]}
        taxon_list = {
            0: tree,
        }
        # sort
        for rank_dict in rank_list:
            for _, node in rank_dict.items():
                flat_list.append(node)

        # make tree
        for x in flat_list:
            taxon_list[x['obj']['id']] = x
            taxon_list[x['parent_id']]['children'].append(taxon_list[x['obj']['id']])

        data = tree['children']

    resp = jsonify({
        'data': data,
        # 'key_map': query_key_map,
        'is_truncated': is_truncated,
        'total': total,
        'elapsed': elapsed,
        'elapsed_count': elapsed_count,
        'elapsed_mapping': elapsed_mapping,
        'debug': {
            'query': str(stmt),
            'payload': payload,
        }
    })
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')
    return resp


@api.route('/collections', methods=['GET', 'POST', 'OPTIONS'])
def collection():
    if request.method == 'GET':
        # group by collection
        #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Unit).join(Collection, full=True).group_by(Collection.id) #where(Unit.id>40, Unit.id<50)
        # TODO: full outer join cause slow
        #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Collection).join(Unit).group_by(Collection.id)

        # stmt = select(Collection)
        stmt = select(Unit.id, Unit.accession_number, Collection, Person.full_name) \
            .join(Unit, Unit.collection_id==Collection.id, isouter=True) \
            .join(Person, Collection.collector_id==Person.id)

        total = request.args.get('total', None)
        payload = {
            'filter': json.loads(request.args.get('filter')) if request.args.get('filter') else {},
            'sort': json.loads(request.args.get('sort')) if request.args.get('sort') else {},
            'range': json.loads(request.args.get('range')) if request.args.get('range') else [0, 20],
        }

        base_stmt = collection_filter(stmt, payload)

        # =======
        # results
        # =======
        begin_time = time.time()
        result = session.execute(stmt)
        elapsed = time.time() - begin_time

        # -----------
        # count total
        # -----------
        elapsed_count = None
        if total is None:
            begin_time = time.time()
            subquery = base_stmt.subquery()
            count_stmt = select(func.count()).select_from(subquery)
            total = session.execute(count_stmt).scalar()
            elapsed_count = time.time() - begin_time

        # --------------
        # result mapping
        # --------------
        data = []
        begin_time = time.time()
        elapsed_mapping = None

        rows = result.all()
        for r in rows:
            if c := r[2]:
                units = []
                for u in c.units:
                    unit = {
                        'id': u.id,
                        'accession_number': u.accession_number,
                    }
                    image_url = ''
                    # TODO
                    try:
                        accession_number_int = int(u.accession_number)
                        instance_id = f'{accession_number_int:06}'
                        first_3 = instance_id[0:3]
                        image_url = f'https://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}_s.jpg'
                    except:
                        pass

                    if image_url:
                        unit['image_url'] = image_url

                    units.append(unit)

                data.append({
                    'id': c.id,
                    'field_number': c.field_number,
                    'collector': c.collector.to_dict() if c.collector else '',
                    'collect_date': c.collect_date.strftime('%Y-%m-%d') if c.collect_date else '',
                    'taxon': c.proxy_taxon_text,
                    'units': units,
                    'named_areas': [x.to_dict() for x in c.named_areas],
                })
            else:
                print(r, flush=True)
        elapsed_mapping = time.time() - begin_time

        resp = jsonify({
            'data': data,
            'total': total,
            'elapsed': elapsed,
            'elapsed_count': elapsed_count,
            'elapsed_mapping': elapsed_mapping,
            'debug': {
                'query': str(stmt),
                'payload': payload,
            }
        })
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Methods', '*')
        return resp

    elif request.method == 'OPTIONS':
        return allow_cors_preflight()

    elif request.method == 'POST':
        collection = Collection()
        changes = collection.update_from_json(request.json)
        session.add(collection)
        session.commit()
        log = LogEntry(
            model='Collection',
            item_id=collection.id,
            action='insert',
            changes=changes)
        session.add(log)
        session.commit()

        return allow_cors(collection.to_dict())
