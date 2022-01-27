import * as React from "react";

import {
  useListContext,
  List,
  Datagrid,
  TextField,
  DateField,
  //ArrayField,
  ImageField,
  //ChipField,
  FunctionField,
  //SingleFieldList,
  TextInput,
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
import Box from '@material-ui/core/Box';

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
const ListFilters = [
  <TextInput source="q" label="全文搜尋" alwaysOn />,
  <TextInput source="accession_number" label="館號" />,
  <ReferenceInput source="collector_id" label="採集者" reference="people" >
    <AutocompleteInput optionText="full_name" />
  </ReferenceInput>,
  <TextInput source="field_number" label="採集號" />,
  <ReferenceInput source="taxon_id" label="學名" reference="taxa">
    <AutocompleteInput optionText="display_name" />
  </ReferenceInput>,
  <CheckboxGroupInput source="dataset_id" choices={[
    { id: '1', name: 'HAST' },
    { id: '2', name: '紅藻' },
  ]} />,
];


const concatLocality = (data, typoGap) => {
  console.log(data);
  let idx = (data[0].data && data[0].data.id == 2) ? 1 : 0;
  return (
    <>
      {(data[idx].data) ?
       <Typography variant="body2" display="inline" className={typoGap}>{data[idx].data.name}</Typography>
       : null}
      {(data[idx+1].data) ?
       <Typography variant="body2" display="inline" className={typoGap}>{data[idx+1].data.name}</Typography>
              : null}
    {(data[idx+2].data) ?
     <Typography variant="body2" display="inline" className={typoGap}>{data[idx+2].data.name}</Typography>
     : null}
    </>
  );
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
        <>
          <Typography variant="body2">{(record.collection.identification_last.taxon) ? record.collection.identification_last.taxon.full_scientific_name : ''}</Typography>
          <Typography variant="body2">{(record.collection.identification_last.taxon) ? record.collection.identification_last.taxon.common_name : ''}</Typography>
        </>
      )} label="學名/中文名" />
      <FunctionField render={record => {
        const collector = (record.collection.collector) ? record.collection.collector.display_name : '';
        const collectionKey = `${collector} ${record.collection.field_number}`;
        return (
        <>
          <Typography variant="body2">{collectionKey}</Typography>
          <Typography variant="body2">{record.collection.collect_date}</Typography>
        </>)
      }
      } label="採集者/號/日期" />
      <FunctionField render={record => (concatLocality(record.collection.named_area_list, classes.typoGap))} label="地點" />
      <ImageField source="image_url" title="照片" className={classes.imgContainer} />
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
