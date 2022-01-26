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

const useStyles = makeStyles({
  imgContainer: {
    '& img': {
      height: 75,
      width: 75,
      objectFit: "contain"
    }
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
  <TextInput source="accession_number" label="館號" alwaysOn />,
  <ReferenceInput source="collector_id" label="採集者" reference="people" alwaysOn >
    <AutocompleteInput optionText="full_name" />
  </ReferenceInput>,
  <ReferenceInput source="taxon_id" label="物種" reference="taxa" alwaysOn>
    <AutocompleteInput optionText="display_name" />
  </ReferenceInput>,
  <CheckboxGroupInput source="dataset_id" choices={[
    { id: '1', name: 'HAST' },
    { id: '2', name: '紅藻' },
  ]} />,
];

const SpecimenList = props => {
  const classes = useStyles();
  return (
  <List title={<ListTitle/>} filters={ListFilters} {...props} sort={{field: 'unit.id', order: 'DESC'}} bulkActionButtons={<BulkActionButtons />}>
    <Datagrid>
      <TextField source="id" style={{color:'#9f9f9f'}}/>
      {/*<TextField source="key" />*/}
      <TextField source="accession_number" label="館號" />
      <TextField source="collection.collector.display_name" sortBy="person.full_name" label="採集者"/>
      <TextField source="collection.field_number" label="採集號"/>
      <FunctionField render={record => (record.collection.identification_last) ? `${record.collection.identification_last.taxon.full_scientific_name} / ${record.collection.identification_last.taxon.common_name}`: ''} label="物種" />
      <ImageField source="image_url" title="照片" className={classes.imgContainer} />
      <DateField source="collection.collect_date" locales="zh-TW" label="採集日期" />
      <EditButton />
    </Datagrid>
  </List>
  );
}

export default SpecimenList;
