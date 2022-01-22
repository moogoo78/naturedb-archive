import csv
import json
import urllib.request
from urllib.parse import quote


from app.models import Taxon, Collection, Unit, Annotation, Identification
from app.database import session

taxon_tree = {}

def import_csv(conf):
    with open(conf['source'], newline='') as csvfile:
        spamreader = csv.reader(csvfile)

        rank_map = {f'{x}': '' for x in conf['rank_list']}
        if conf['is_skip_header']:
            next(spamreader, None)

        for row in spamreader:
            collection = Collection()
            session.add(collection)
            if not conf['is_dry_run']:
                session.commit()
            unit = Unit(collection_id=collection.id, dataset_id=conf['dataset_id'])
            session.add(unit)
            if not conf['is_dry_run']:
                session.commit()

            for i, v in enumerate(row):
                col = conf['columns'][i]
                if col['resource'] == 'taxon':
                    print (col['rank'], v)
                    if col['rank'] == 'species':
                        url = 'http://match.taibif.tw/api.php?names={}&format=json'.format(quote(v))
                        #print(url)
                        with urllib.request.urlopen(url) as response:
                            resp = response.read()
                            #print(type(resp), json.loads(resp))
                            payload = json.loads(resp)
                            if res:= payload['results']:
                                data = res[0][0]
                                # TODO
                                source_map = { v: i for i, v in enumerate(data['source']) }
                                source_id = source_map.get('taicol', '')
                    #else:
                elif col['resource'] == 'locality_text':
                    collection.locality_text = v
                elif col['resource'] == 'annotation':
                    anno = Annotation(unit_id=unit.id, category=col['category'], text=v)
                elif col['resource'] == 'unit.accession_number':
                    unit.accession_number = v

            if not conf['is_dry_run']:
                session.commit()

