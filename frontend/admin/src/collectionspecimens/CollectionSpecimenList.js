import * as React from "react";

import {
  useListContext,
  List,
  Datagrid,
  TextField,
  //DateField,
  //ArrayField,
  ImageField,
  //ChipField,
  FunctionField,
  //SingleFieldList,
  TextInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  AutocompleteInput,
  CheckboxGroupInput,
  EditButton,
  //BulkDeleteButton,
} from 'react-admin';
import Button from '@material-ui/core/Button';
//import { Link } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
  }
});

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
  <NumberInput source="collect_date_month" label="採集日期 (月份)" min="1" max="12" />,
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

const SpecimenList = props => {
  const classes = useStyles();
  return (
  <List title={<ListTitle/>} filters={ListFilters} {...props} sort={{field: 'unit.id', order: 'DESC'}} bulkActionButtons={<BulkActionButtons />}>
    <Datagrid>
      <TextField source="id" style={{color:'#9f9f9f'}}/>
      {/*<TextField source="key" />*/}
      <TextField source="accession_number" label="館號" />
      <FunctionField render={record => (
        (record && record.collection) ?
          <>
            <Typography variant="body2">{record.collection.last_taxon_text}</Typography>
            <Typography variant="body2">common_name</Typography>
          </> : null
      )}
       label="學名/中文名" />
      <FunctionField render={record => {
        if (record && record.collection) {
          const collector = (record.collection.collector) ? record.collection.collector.display_name : '';
          const collectionKey = `${collector} ${record.collection.field_number}`;
          return (
            <>
              <Typography variant="body2">{collectionKey}</Typography>
              <Typography variant="body2">{record.collection.collect_date}</Typography>
            </>)
        }
        return null;
      }} label="採集者/號/日期" />
      <FunctionField render={record => ((record && record.collection) ? concatLocality(record.collection.named_area_map, classes.typoGap) : null)} label="地點" />
      <ImageField source="image_url" title="照片" className={classes.imgContainer} sortable={false}/>
      <EditButton />
    </Datagrid>
        </List>
  );
}

export default SpecimenList;

/*
      <TextField source="collection.collector.display_name" sortBy="person.full_name" label="採集者"/>
      <TextField source="collection.field_number" label="採集號"/>
      <DateField source="collection.collect_date" locales="zh-TW" label="採集日期" />
*/
