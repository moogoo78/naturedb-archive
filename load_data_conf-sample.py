conf = {
    'source': 'Rhodophyta.csv',
    'is_dry_run': True,
    'is_skip_header': True,
    'rank_list': ['order', 'family', 'genus', 'species'],
    'dataset_id':  2,
    'columns': [
        {
            'resource': 'taxon',
            'rank': 'order',
        },
        {
            'resource': 'taxon',
            'rank': 'family',
        },
        {
            'resource': 'taxon',
            'rank': 'species',
        },
        {
            'resource': 'locality_text',
        },
        {
            'resource': 'annotation',
            'category': '__reference__',
        },
        {
            'resource': 'unit.accession_number',
        },
        {
            'resource': 'annotation',
            'category': '__type__',
        },
    ]
}
