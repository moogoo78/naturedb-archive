import csv

from sqlalchemy import (
    create_engine,
    select,
    func,
)

from app.models import Unit, Collection, Person, FieldNumber, NamedArea, Identification, AreaClass, MeasurementOrFact, Annotation, MeasurementOrFactParameter, Transaction, MeasurementOrFactParameterOption, MeasurementOrFactParameterOptionGroup, Project
from app.taxon.models import Taxon, TaxonTree, TaxonRelation
from app.database import session

def make_proj(con):

    rows = con.execute('SELECT * FROM specimen_specimen ORDER BY id')
    for r in rows:
        if hast := r[4].get('hast'):
            if pid := hast.get('projectID'):
                c = Collection.query.filter(Collection.id==r[0]).first()
                #print (c, flush=True)
                if int(pid) > 11:
                    print (r[0], pid, flush=True)
                else:
                    c.project_id = int(pid)
    session.commit()
    '''
    with open('./data/projectName_202102051854.csv') as csvfile:
        spamreader = csv.reader(csvfile)
        next(spamreader)
        for row in spamreader:
            print (row, flush=True)
            p = Project(name=row[1])
            session.add(p)
        session.commit()
    '''
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
    '''
    rows = con.execute('SELECT * FROM specimen_areaclass ORDER BY id')
    for r in rows:
        ac = AreaClass(name=r[1], label=r[2])
        session.add(ac)
    session.commit()
    '''
    rows = con.execute('SELECT * FROM specimen_namedarea ORDER BY id')
    for r in rows:
        na = NamedArea(id=r[0], name=r[1], name_en=r[6], area_class_id=r[4], source_data=r[5])
        session.add(na)
    session.commit()

    # add parent
    children = NamedArea.query.filter(NamedArea.area_class_id>1).all()
    for i in children:
        qna = None
        if i.area_class_id == 2:
            p = i.source_data['countryNo']
            jstr ='{"countryNo":"'+p+'"}'
            qna = NamedArea.query.filter(
                NamedArea.source_data.op('@>')(jstr),
                NamedArea.area_class_id==1
            )
        elif i.area_class_id == 3:
            p = i.source_data['provinceNo']
            jstr ='{"provinceNo":"'+p+'"}'
            qna = NamedArea.query.filter(
                NamedArea.source_data.op('@>')(jstr),
                NamedArea.area_class_id==2
            )
        elif i.area_class_id == 4:
            p = i.source_data['hsienNo']
            jstr ='{"hsienNo":"'+p+'"}'
            qna = NamedArea.query.filter(
                NamedArea.source_data.op('@>')(jstr),
                NamedArea.area_class_id==3
            )
        if qna:
            if na := qna.first():
                i.parent_id = na.id
    session.commit()



MOF_PARAM_LIST = [
    ('abundance', 'annotation_abundance_choice_id', 'annotation_abundance_text', (18, 19), '豐富度'),
    ('habitat', 'annotation_habitat_choice_id', 'annotation_habitat_text', (20, 21), '微棲地'),
    ('humidity', 'annotation_humidity_choice_id', 'annotation_humidity_text', (22, 23), '環境濕度'),
    ('light-intensity', 'annotation_light_choice_id', 'annotation_light_text', (24, 25), '環境光度'),
    ('naturalness', 'annotation_naturalness_choice_id', 'annotation_naturalness_text', (26, 27), '自然度'),
    ('topography', 'annotation_topography_choice_id', 'annotation_topography_text', (28, 29),'地形位置'),
    ('veget', 'annotation_veget_choice_id', 'annotation_veget_text', (30, 31),'植群型'),
]
MOF_PARAM_LIST2a = [
    ('plant-h', 'annotation_plant_h', '植株高度'),
    ('sex-char', 'annotation_sex_char', '性狀描述'),
    #('memo', 'annotation_memo'),
    #('memo2', 'annotation_memo2'),
    #('is-greenhouse', 'annotation_category')
]
MOF_PARAM_LIST2 = [
    ('life-form', 'annotation_life_form_choice_id', 'annotation_life_form_text', '生長型'),
    ('flower', 'annotation_flower_choice_id', 'annotation_flower_text', '花'),
    ('fruit', 'annotation_fruit_choice_id', 'annotation_fruit_text', '果'),
    ('flower-color', 'annotation_flower_color_choice_id', 'annotation_flower_color_text', '花色'),
    ('fruit-color', 'annotation_fruit_color_choice_id', 'annotation_fruit_color_text', '果色'),
]

PARAM_MAP = {'abundance': '1', 'habitat': '2', 'humidity': '3', 'light-intensity': '4', 'naturalness': '5', 'topography': '6', 'veget': '7', 'plant-h': '8', 'sex-char': '9', 'life-form': '10', 'flower': '11', 'fruit': '12', 'flower-color': '13', 'fruit-color': '14'}

PARAM_OPT_GROUP_MAP = ['一般型','人工/干擾環境', '闊葉林', '針葉林/混交林', '混合型', '海岸環境', '針闊葉混合林','高山植群', '混合林']

def make_mof_option(con):
    for i, k in enumerate(PARAM_OPT_GROUP_MAP):
        pog = MeasurementOrFactParameterOptionGroup(name=k)
        session.add(pog)
    session.commit()

    rows = con.execute(f"SELECT * FROM specimen_annotation")
    for row in rows:
        pid = PARAM_MAP[row[2]]
        group_name = ''
        if row[2] == 'veget':
            group_name = row[4].get('typeC')
        #print (pid, group_name, flush=True)
        opt = MeasurementOrFactParameterOption(parameter_id=pid, value=row[1], description=row[3])
        session.add(opt)
        if group_name:
            opt.group_id = PARAM_OPT_GROUP_MAP.index(group_name) + 1
    session.commit()
    '''
    rows = MeasurementOrFact.query.all()
    for i in rows:
        # print (i, flush=True)
        if i.option_id:
            i.value = i.option.value
    session.commit()
    '''
    return {}

def make_collection(con):
    '''
    collection_id = r[0] (hast_21.specimen_specimen.id)
    '''
    #LIMIT = ' LIMIT 50'
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
            #print(na, flush=True)
            if na:
                naObj = NamedArea.query.get(na)
                if naObj:
                    col.named_areas.append(naObj)
                else:
                    print(na, 'not found', flush=True)

        # Identification
        rows2 = con.execute(f"SELECT i.*, t.full_scientific_name FROM specimen_identification AS i LEFT JOIN taxon_taxon AS t ON t.id = i.taxon_id  WHERE specimen_id ={r[0]} ORDER BY verification_level")

        id_list = [x for x in rows2]
        if len(id_list) > 0:
            last_id = id_list[-1]
            common_name = ''
            if tx := Taxon.query.get(last_id[7]):
                if cname := tx.common_name:
                    common_name = cname
            col.proxy_taxon_text = f'{last_id[10]}|{common_name}'
            col.proxy_taxon_id = last_id[7]

        for r2 in id_list:
            iden = Identification(
                collection_id=cid,
                identifier_id=r2[2],
                date=r2[1],
                date_text=r2[9],
                taxon_id=r2[7],
                #verification_level=r2[8],
                sequence=r2[8],
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

        an_list = []
        rows3 = con.execute(f"SELECT * FROM specimen_accession WHERE specimen_id ={r[0]}  ORDER BY id")
        for r3 in rows3:
            acc_num = ''
            acc_num2 = ''
            if an := r3[1]:
                acc_num = an
            if an2 := r3[2]:
                acc_num2 = an2

            an_list.append(acc_num)
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
            if r3['annotation_exchange_type'] or r3['annotation_exchange_dept']:
                tr = Transaction(
                    unit_id=u.id,
                    transaction_type=r3['annotation_exchange_type'],
                    organization_text=r3['annotation_exchange_dept'],
                )
                session.add(tr)

        col.proxy_unit_accession_numbers = '|'.join(an_list)
        # save unit
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
        p = MeasurementOrFactParameter(dataset_id=1, name=i[0], label=i[4])
        session.add(p)
    for i in MOF_PARAM_LIST2a:
        p = MeasurementOrFactParameter(dataset_id=1, name=i[0], label=i[2])
        session.add(p)
    for i in MOF_PARAM_LIST2:
        p = MeasurementOrFactParameter(dataset_id=1, name=i[0], label=i[3])
        session.add(p)
    session.commit()


def conv_hast21(key):
    engine2 = create_engine('postgresql+psycopg2://postgres:example@postgres:5432/hast21a', convert_unicode=True)
    with engine2.connect() as con:

        if key == 'person':
            make_person(con)
        elif key == 'geo':
            make_geospatial(con)
        elif key == 'param':
            make_param(con)
            #pmap = {}
            #for i in param_map.split('\n'):
            #    plist = i.split(',')
            #    pmap[plist[2]] = plist[0]
            #print(pmap, flush=True)
        elif key == 'taxon':
            make_taxon(con)
        elif key == 'collection':
            make_collection(con)
        elif key == 'mof_option':
            make_mof_option(con)
        elif key == 'make_proj':
            make_proj(con)
