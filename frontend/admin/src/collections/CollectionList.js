import * as React from "react";

import {
  useListContext,
  List,
  Pagination,
  Datagrid,
  TextField,
  //DateField,
  //ArrayField,
  ImageField,
  //ChipField,
  FunctionField,
  ReferenceField,
  ArrayField,
  SingleFieldList,
  ChipField,
  TextInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  AutocompleteInput,
  CheckboxGroupInput,
  EditButton,
  ExportButton,
  TopToolbar,
  //BulkDeleteButton,
} from 'react-admin';
import {
  Button,
  Box,
  Typography,
  Link as MuiLink,
  InputAdornment,
} from '@material-ui/core';

//import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Form } from 'react-final-form';
import SearchIcon from '@material-ui/icons/Search';
import ContentFilter from "@material-ui/icons/FilterList";

const useStyles = makeStyles({
  imgContainer: {
    '& img': {
      height: 50,
      width: 50,
      objectFit: "contain"
    }
  },
  typoGap: {
    margin: '0 2px'
  },
  longerTextInput: {
    width: '400px'
  }
});


//------------
const PostFilterButton = () => {
    const { showFilter } = useListContext();
    return (
        <Button
            size="small"
            color="primary"
            onClick={() => showFilter("main")}
            startIcon={<ContentFilter />}
        >
            Filter
        </Button>
    );
};
const PostFilterForm = () => {
  const {
    displayedFilters,
    filterValues,
    setFilters,
    hideFilter
  } = useListContext();
  const classes = useStyles();

  if (!displayedFilters.main) return null;

  const onSubmit = (values) => {
    if (Object.keys(values).length > 0) {
      setFilters(values);
    } else {
      hideFilter("main");
    }
  };

  const resetFilter = () => {
    setFilters({}, []);
  };

  return (
    <div>
      <Form onSubmit={onSubmit} initialValues={filterValues}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" alignItems="flex-end" mb={1}>
              <Box component="span" mr={2}>
                {/* Full-text search filter. We don't use <SearchFilter> to force a large form input */}
                <TextInput
                  resettable
                  helperText={false}
                  source="q"
                  label="Search"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment>
                        <SearchIcon color="disabled" />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              <Box component="span" mr={2}>
                <TextInput source="accession_number" label="館號" helperText={false} />
              </Box>
              <Box component="span" mr={2} width="500">
                <ReferenceInput source="taxon_id" label="學名" reference="taxa" helperText={false} fullWidth className={classes.longerTextInput} >
                  <AutocompleteInput optionText="display_name" />
                </ReferenceInput>
              </Box>
            </Box>
            <Box display="flex" alignItems="flex-end" mb={1}>
              <Box component="span" mr={2}>
                <ReferenceInput source="collector_id" label="採集者" reference="people" helperText={false}>
                  <AutocompleteInput optionText="display_name" />
                </ReferenceInput>
              </Box>
              <Box component="span" mr={2}>
                <TextInput source="field_number" label="採集號" helperText={false} />
              </Box>
              <Box component="span" mr={2}>
                <TextInput source="field_number2" label="採集號(連續)" helperText={false} />
              </Box>
            </Box>
            <Box display="flex" alignItems="flex-end" mb={1}>
              <Box component="span" mr={2}>
                <DateInput source="collect_date" label="採集日期" helperText={false} />
              </Box>
              <Box component="span" mr={2}>
                <DateInput source="collect_date2" label="採集日期2" helperText={false} />
              </Box>
              <Box component="span" mr={2}>
                <NumberInput source="collect_date__year" label="採集日期 (年)" helperText={false} />
              </Box>
              <Box component="span" mr={2}>
                <NumberInput source="collect_date__month" label="採集日期 (月)" min="1" max="12" helperText={false} />
              </Box>
              <Box component="span" mr={2} mb={1.5}>
                <Button variant="outlined" color="primary" type="submit">
                  Filter
                </Button>
              </Box>
              <Box component="span" mb={1.5}>
                <Button variant="outlined" onClick={resetFilter}>
                  Close
                </Button>
              </Box>
            </Box>
          </form>
        )}
      </Form>
    </div>
  );
};

//------------
const BulkActionButtons = props => {
  const HOST = 'http://127.0.0.1:5000';
  const printUrl = `${HOST}/print-label?ids=${props.selectedIds.join(",")}`;
  return (
  <>
    <MuiLink href={printUrl}><Button>列印標籤</Button></MuiLink>
  </>)
}

const ListTitle = () => {
  const context = useListContext();
  const firstItem = context.data[context.ids[0]];
  const queryElapsed = (firstItem && firstItem.query_elapsed) ? ` (query elapsed: ${firstItem.query_elapsed.toFixed(2)} secs)` : '';
  //const title = `Specimen${queryElapsed}`;
  return <span>Specimens<span style={{fontSize:'14px', color:'#d0d0d0'}}>{queryElapsed}</span></span>;
}

//const CollectionSpecimenEditButton = ({ record }) => (
//    <EditButton basePath={`/collection-specimens/${record.id}`} label="Edit me" record={record} />
//);

const ListPagination = props => <Pagination rowsPerPageOptions={[10, 20, 50, 100]} {...props} />;

const ListActions = () => (
  <Box width="100%">
    <TopToolbar>
      <PostFilterButton />
      <ExportButton />
    </TopToolbar>
    <PostFilterForm />
  </Box>
);

/* use custom form */
const ListFilters = [
  <TextInput source="q" label="全文搜尋" alwaysOn />,
  <TextInput source="accession_number" label="館號" />,
  <ReferenceInput source="collector_id" label="採集者" reference="people" >
    <AutocompleteInput optionText="display_name" />
  </ReferenceInput>,
  <TextInput source="field_number" label="採集號" />,
  <TextInput source="field_number2" label="採集號2" />,
  <DateInput source="collect_date" label="採集日期" />,
  <DateInput source="collect_date2" label="採集日期2" />,
  <NumberInput source="collect_date__year" label="採集日期 (年)" />,
  <NumberInput source="collect_date__month" label="採集日期 (月)" min="1" max="12" />,
  <ReferenceInput source="taxon_id" label="學名" reference="taxa">
    <AutocompleteInput optionText="display_name" />
  </ReferenceInput>,
  <CheckboxGroupInput source="dataset_id" choices={[
    { id: '1', name: 'HAST' },
    { id: '2', name: '紅藻' },
  ]} />,
];


const concatLocality = (data, typoGap) => {
  //console.log(data)
  if (data) {
    const keys = (data.country.value && data.country.value.id === 2) ? ['stateProvince', 'municipality', 'county'] : ['country', 'stateProvince', 'municipality'];
    return (
      <>
        {(data[keys[0]].value !== '') ?
         <Typography variant="body2" display="inline" className={typoGap}>{data[keys[0]].value.name}</Typography>
         : null}
        {(data[keys[1]].value !== '') ?
         <Typography variant="body2" display="inline" className={typoGap}>{data[keys[1]].value.name}</Typography>
         : null}
        {(data[keys[2]].value !== '') ?
         <Typography variant="body2" display="inline" className={typoGap}>{data[keys[2]].value.name}</Typography>
         : null}
      </>
    );
  }
  return null;
}

// filters=ListFilters
const CollectionList = props => {
  const classes = useStyles();
  return (
    <List title={<ListTitle/>} filters={ListFilters} actions={<ListActions/>} sort={{field: 'collectionKey', order: 'DESC'}} bulkActionButtons={<BulkActionButtons />} pagination={<ListPagination />}  {...props}>
    <Datagrid>
      <TextField source="id" style={{color:'#9f9f9f'}}/>
      {/*<TextField source="key" />*/}
      {/*<TextField source="accession_number" label="館號" />*/}
      <ArrayField source="units" label="館號">
        <SingleFieldList>
          <ChipField source="accession_number" />
        </SingleFieldList>
      </ArrayField>
      <FunctionField render={record => (
          <>
            <Typography variant="body2">{record.last_taxon_text}</Typography>
            <Typography variant="body2">common_name</Typography>
          </>
      )}
       label="學名/中文名" />
      <FunctionField render={record => {
        if (record.collector) {
          const collector = (record.collector) ? record.collector.display_name : '';
          const collectionKey = `${collector} ${record.field_number}`;
          return (
            <Typography variant="body2">{collectionKey}</Typography>
          )
        }
        return null;
      }} label="採集者/號" />
      <FunctionField render={record => {
        if (record.collect_date) {
          return (
              <Typography variant="body2">{record.collect_date}</Typography>
          )
        }
        return null;
      }} label="採集日期" />
      <FunctionField render={record => concatLocality(record.named_area_map, classes.typoGap)} label="地點" />
      <ReferenceField source="unit_ids" reference="units" label="照片" link={false}>
        <ImageField source="image_url" title="照片" className={classes.imgContainer} sortable={false}/>
      </ReferenceField>
      <EditButton />
    </Datagrid>
        </List>
  );
}

export default CollectionList;

/*
      <TextField source="collection.collector.display_name" sortBy="person.full_name" label="採集者"/>
      <TextField source="collection.field_number" label="採集號"/>
      <DateField source="collection.collect_date" locales="zh-TW" label="採集日期" />
*/


/*
import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
  DateField,
  ArrayField,
  //ChipField,
  FunctionField,
  SingleFieldList,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  EditButton,
  BulkDeleteButton,
} from 'react-admin';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core';
const BulkActionButtons = props => {
  const HOST = 'http://127.0.0.1:5000';
  const printUrl = `${HOST}/print-label?ids=${props.selectedIds.join(",")}`;
  return (
  <>
    <MuiLink href={printUrl}><Button>列印標籤</Button></MuiLink>
  </>)
}

const ListFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <ReferenceInput source="collector_id" label="Collector" reference="people">
    <AutocompleteInput optionText="full_name" />
  </ReferenceInput>,
];

const CollectionList = props => (
  <List filters={ListFilters} {...props} sort={{field: 'collection.id', order: 'DESC'}} bulkActionButtons={<BulkActionButtons />}>
    <Datagrid>
      <TextField source="id" style={{color:'#9f9f9f'}}/>
      <ArrayField source="units" label="館號">
        <SingleFieldList>
          <TextField source="accession_number" />
        </SingleFieldList>
      </ArrayField>
      <TextField source="collector.display_name" sortBy="person.full_name" label="採集者"/>
      <TextField source="field_number" label="採集號"/>
      <FunctionField label="Name" render={record => `${record.identification_last.taxon.full_scientific_name} / ${record.identification_last.taxon.common_name}`} label="物種"/>  
      <DateField source="collect_date" locales="zh-TW" label="採集日期" />
      <EditButton />
    </Datagrid>
  </List>
);

export default CollectionList;
*/
