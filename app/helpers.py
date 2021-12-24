from sqlalchemy import create_engine

from app.models import Unit, Collection, Person, FieldNumber, CollectionNamedArea, NamedArea, Identification, AreaClass, ScientificName, MeasurementOrFact
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

def make_collection(con):
    rows = con.execute('SELECT * FROM specimen_specimen ORDER BY id LIMIT 5')
    for r in rows:
        #print(r)
        cid = r[0]
        field_number = r[2].replace('::', '')

        # Collection
        col = Collection(
            id=cid,
            collect_date=r[32],
            collector_id=r[6],
            collector_text='{}::{}'.format(r[14] if r[14] else '', r[15] if r[15] else ''),
            locality_text='{}::{}'.format(r[5] if r[5] else '', r[13] if r[13] else ''),
            altitude=r[11],
            altitude2=r[12],
            latitude_decimal=r[9],
            longitude_decimal=r[10],
        )
        if r[39] or r[41] or r[42] or r[43]:
            col.verbatim_latitude = "{}{}°{}'{}\"".format(r[39], r[41], r[42], r[43])
        if r[40] or r[44] or r[45] or r[46]:
            col.verbatim_longitude = "{}{}°{}'{}\"".format(r[40], r[44], r[45], r[46])
        session.add(col)


        # FieldNumber
        fn = FieldNumber(
            collection_id=cid,
            value=field_number,
            collector_id=r[6])
        session.add(fn)

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
                scientific_name_id=r2[7],
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
                    parameter=param[0],
                    text=x,
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
            )
            session.add(u)
        session.commit()


def make_taxon(con):
    rows = con.execute(f"SELECT * FROM taxon_taxon")
    for r in rows:
        sn = ScientificName(
            id=r[0],
            rank=r[1],
            full_scientific_name=r[2],
            common_name=r[6],
            source_data=r[7],
        )
        session.add(sn)
    session.commit()


def conv_hast21():
    engine2 = create_engine('postgresql+psycopg2://postgres:example@postgres:5432/hast21', convert_unicode=True)
    with engine2.connect() as con:
        #make_person(con)

        #make_geospatial(con)

        #make_taxon(con)

        make_collection(con)



