from sqlalchemy import (
    create_engine,
    select,
    func,
)

from app.models import Unit, Collection, Person, FieldNumber, CollectionNamedArea, NamedArea, Identification, AreaClass, MeasurementOrFact, Annotation, MeasurementOrFactParameter, Transaction
from app.taxon.models import Taxon, TaxonTree, TaxonRelation
from app.database import session


def make_person(con):
    rows = con.execute('SELECT * FROM specimen_person ORDER BY id')
    for r in rows:
        #print(r)
        org = ''
        atom_name = {}
        abbr_name = ''
        full_name = r[6]
        if len(r[1]) > 0:
            # has source_data
            org = r[1]['organAbbr']
            abbr_name = r[1]['nameAbbr']
            atom_name = {
                'en': {
                    'given_name': r[1]['firstName'],
                    'inherited_name': r[1]['lastName'],
                }
            }
            if name_other := r[1]['nameOther']:
                atom_name['other'] = name_other

        if not full_name:
            name_list = []
            if first_name := r[1]['firstName']:
                name_list.append(first_name)
            if last_name := r[1]['lastName']:
                name_list.append(last_name)
            full_name = ' '.join(name_list)

        p = Person(
            full_name=full_name,
            abbreviated_name=abbr_name,
            atomized_name=atom_name,
            source_data=r[1],
            is_collector=r[3],
            is_identifier=r[4],
            organization=org)
        session.add(p)
    session.commit()

def make_geospatial(con):
    rows = con.execute('SELECT * FROM specimen_areaclass ORDER BY id')
    for r in rows:
        ac = AreaClass(name=r[1], label=r[2])
        session.add(ac)
    session.commit()

    rows = con.execute('SELECT * FROM specimen_namedarea ORDER BY id')
    for r in rows:
        na = NamedArea(id=r[0], name=r[1], name_en=r[6], area_class_id=r[4], source_data=r[5])
        session.add(na)
    session.commit()

MOF_PARAM_LIST = [
    ('abundance', 'annotation_abundance_choice_id', 'annotation_abundance_text', (18, 19)),
    ('habitat', 'annotation_habitat_choice_id', 'annotation_habitat_text', (20, 21)),
    ('humidity', 'annotation_humidity_choice_id', 'annotation_humidity_text', (22, 23)),
    ('light-intensity', 'annotation_light_choice_id', 'annotation_light_text', (24, 25)),
    ('naturalness', 'annotation_naturalness_choice_id', 'annotation_naturalness_text', (26, 27)),
    ('topography', 'annotation_topography_choice_id', 'annotation_topography_text', (28, 29)),
    ('veget', 'annotation_veget_choice_id', 'annotation_veget_text', (30, 31)),
]
MOF_PARAM_LIST2a = [
    ('plant-h', 'annotation_plant_h'),
    ('sex-char', 'annotation_sex_char'),
    #('memo', 'annotation_memo'),
    #('memo2', 'annotation_memo2'),
    #('is-greenhouse', 'annotation_category')
]
MOF_PARAM_LIST2 = [
    ('life-form', 'annotation_life_form_choice_id', 'annotation_life_form_text'),
    ('flower', 'annotation_flower_choice_id', 'annotation_flower_text'),
    ('fruit', 'annotation_fruit_choice_id', 'annotation_fruit_text'),
    ('flower-color', 'annotation_flower_color_choice_id', 'annotation_flower_color_text'),
    ('fruit-color', 'annotation_fruit_color_choice_id', 'annotation_fruit_color_text'),
]
param_map = '''1,1,abundance,
2,1,habitat,
3,1,humidity,
4,1,light-intensity,
5,1,naturalness,
6,1,topography,
7,1,veget,
8,1,plant-h,
9,1,sex-char,
10,1,memo,
11,1,memo2,
12,1,is-greenhouse,
13,1,life-form,
14,1,flower,
15,1,fruit,
16,1,flower-color,
17,1,fruit-color'''

PARAM_MAP = {'abundance': '1', 'habitat': '2', 'humidity': '3', 'light-intensity': '4', 'naturalness': '5', 'topography': '6', 'veget': '7', 'plant-h': '8', 'sex-char': '9', 'memo': '10', 'memo2': '11', 'is-greenhouse': '12', 'life-form': '13', 'flower': '14', 'fruit': '15', 'flower-color': '16', 'fruit-color': '17'}

def make_collection(con):
    #LIMIT = ' LIMIT 1600'
    LIMIT = ''
    rows = con.execute(f'SELECT * FROM specimen_specimen ORDER BY id{LIMIT}')
    for r in rows:
        #print(r)
        cid = r[0]
        field_number = r[2].replace('::', '') if r[2] else ''

        # Collection
        col = Collection(
            id=cid,
            collect_date=r[32],
            collector_id=r[6],
            field_number=field_number,
            companion_text=r[14],
            companion_text_en=r[15],
            locality_text=r[5],
            locality_text_en=r[13],
            altitude=r[11],
            altitude2=r[12],
            latitude_decimal=r[9],
            longitude_decimal=r[10],
            field_note=r[16],
            field_note_en=r[17],
        )
        if r[39] or r[41] or r[42] or r[43]:
            col.latitude_text = "{}{}°{}'{}\"".format(r[39], r[41], r[42], r[43])
        if r[40] or r[44] or r[45] or r[46]:
            col.longitude_text = "{}{}°{}'{}\"".format(r[40], r[44], r[45], r[46])
        session.add(col)


        # FieldNumber
        #fn = FieldNumber(
        #    collection_id=cid,
        #    value=field_number,
        #    collector_id=r[6])
        #session.add(fn)

        # NamedArea
        na_list = [r[33], r[37], r[34], r[38], r[36], r[35]]
        for na in na_list:
            if na:
                col_na = CollectionNamedArea(
                    collection_id=cid,
                    named_area_id=na,
                )
                session.add(col_na)
        session.commit()

        # Identification
        rows2 = con.execute(f"SELECT * FROM specimen_identification WHERE specimen_id ={r[0]} ORDER BY id")
        for r2 in rows2:
            iden = Identification(
                collection_id=cid,
                identifier_id=r2[2],
                date=r2[1],
                date_text=r2[9],
                taxon_id=r2[7],
                verification_level=r2[8],
                created=r2[4],
                changed=r2[3],
                source_data=r2[6],
            )
            session.add(iden)
        session.commit()

        # MeasurementOrFact1
        for param in MOF_PARAM_LIST:
            #print(p[0], r[p[2]])
            if x := r[param[2]]:
                mof = MeasurementOrFact(
                    collection_id=cid,
                    #parameter=param[0],
                    #text=x,
                    parameter_id=PARAM_MAP[param[0]],
                    value=x,
                )
                session.add(mof)
        session.commit()

        rows3 = con.execute(f"SELECT * FROM specimen_accession WHERE specimen_id ={r[0]}  ORDER BY id")
        for r3 in rows3:
            acc_num = ''
            acc_num2 = ''
            if an := r3[1]:
                acc_num = an
            if an2 := r3[2]:
                acc_num2 = an2

            # Unit
            u = Unit(
                collection_id=cid,
                accession_number=acc_num,
                duplication_number=acc_num2,
                acquisition_source_text=r[47],
                kind_of_unit='HS',
                preparation_date=r3[22],
                preparation_type='S',
                source_data=r[4],
                created=r3[5],
                changed=r3[4],
                dataset_id=1,
            )
            session.add(u)
            session.commit()

            # MeasurementOrFact2
            for param in MOF_PARAM_LIST2:
                if x := r3[param[2]]:
                    mof = MeasurementOrFact(
                        unit_id=u.id,
                        #parameter=param[0],
                        parameter_id=PARAM_MAP[param[0]],
                        value=x,
                    )
                    session.add(mof)
            # MeasurementOrFact2a
            for param in MOF_PARAM_LIST2a:
                if x := r3[param[1]]:
                    mof = MeasurementOrFact(
                        unit_id=u.id,
                        #parameter=param[0],
                        parameter_id=PARAM_MAP[param[0]],
                        value=x,
                    )
                    session.add(mof)

            a = Annotation(
                unit_id=u.id,
                category='add-char',
                text=r3['annotation_memo'],
                #memo='converted from legacy',
            )
            session.add(a)
            a = Annotation(
                unit_id=u.id,
                category='name-comment',
                text=r3['annotation_memo2'],
                #memo='converted from legacy',
            )
            session.add(a)
            a = Annotation(
                unit_id=u.id,
                category='is-greenhouse',
                text=r3['annotation_category'],
                #memo='converted from legacy',
            )
            session.add(a)
            #a = Annotation(
            #    unit_id=u.id,
            #    category='plant_h',
            #    text=r3['annotation_plant_h'],
            #    memo='converted from legacy',
            #)
            #session.add(a)
            #a = Annotation(
            #    unit_id=u.id,
            #    category='sex_char',
            #    text=r3['annotation_sex_char'],
            #    memo='converted from legacy',
            #)
            #session.add(a)
            #a = Annotation(
            #    unit_id=u.id,
            #    category='exchange_dept',
            #    text=r3['annotation_exchange_dept'],
            #    memo='converted from legacy',
            #)
            #session.add(a)
            #a = Annotation(
            #    unit_id=u.id,
            #    category='exchange_id',
            #    text=r3['annotation_exchange_type'],
            #    memo='converted from legacy',
            #)
            #session.add(a)
            tr = Transaction(
                unit_id=u.id,
                transaction_type=r3['annotation_exchange_type'],
                organization_text=r3['annotation_exchange_dept'],
            )
            session.add(tr)
        session.commit()


def make_taxon(con):
    rows_init = con.execute(f"SELECT * FROM taxon_taxon")
    rows = [x for x in rows_init]
    tree = TaxonTree(name='HAST-legacy')
    session.add(tree)
    session.commit()
    #tree = TaxonTree.query.filter(TaxonTree.id==1).first()

    for r in rows:
        sn = Taxon(
            id=r[0],
            rank=r[1],
            full_scientific_name=r[2],
            common_name=r[6],
            source_data=r[8],
            tree_id=tree.id,
        )
        session.add(sn)
    session.commit()

    # relation
    ## self
    for r in rows:
        tr = TaxonRelation(
            parent_id=r[0],
            child_id=r[0],
            depth=0,
        )
        session.add(tr)
    session.commit()

    for r in rows:
        if r[1] == 'species' and r[8]:
            #print(type(r[8]), r[8].get('genusE'), flush=True)
            if gen := r[8].get('genusE'):
                t_g = Taxon.query.filter(Taxon.rank=='genus', Taxon.full_scientific_name==gen).first()
                if t_g:
                    tr = TaxonRelation(
                        parent_id=t_g.id,
                        child_id=r[0],
                        depth=1,
                    )
                    session.add(tr)
            if fam := r[8].get('familyE'):
                t_f = Taxon.query.filter(Taxon.rank=='family', Taxon.full_scientific_name==fam).first()
                if t_f:
                    tr = TaxonRelation(
                        parent_id=t_f.id,
                        child_id=r[0],
                        depth=2,
                    )
                    session.add(tr)
        if r[1] == 'genus' and r[8]:
            if fam := r[8].get('familyE'):
                t_f = Taxon.query.filter(Taxon.rank=='family', Taxon.full_scientific_name==fam).first()
                if t_f:
                    tr = TaxonRelation(
                        parent_id=t_f.id,
                        child_id=r[0],
                        depth=1,
                    )
                    session.add(tr)
    session.commit()

def make_param(con):
    for i in MOF_PARAM_LIST:
        p = MeasurementOrFactParameter(dataset_id=1, name=i[0])
        session.add(p)
    for i in MOF_PARAM_LIST2a:
        p = MeasurementOrFactParameter(dataset_id=1, name=i[0])
        session.add(p)
    for i in MOF_PARAM_LIST2:
        p = MeasurementOrFactParameter(dataset_id=1, name=i[0])
        session.add(p)
    session.commit()


def conv_hast21(key):
    engine2 = create_engine('postgresql+psycopg2://postgres:example@postgres:5432/hast21', convert_unicode=True)
    with engine2.connect() as con:

        if key == 'person':
            make_person(con)
        elif key == 'geo':
            make_geospatial(con)
        elif key == 'param':
            #make_param(con)
            pmap = {}
            for i in param_map.split('\n'):
                plist = i.split(',')
                pmap[plist[2]] = plist[0]
            print(pmap, flush=True)
        elif key == 'taxon':
            make_taxon(con)
        elif key == 'collection':
            make_collection(con)
