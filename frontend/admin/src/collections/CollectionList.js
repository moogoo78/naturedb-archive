import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
  DateField,
  ArrayField,
  ChipField,
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
      <TextField source="id" />
      <ArrayField source="units">
        <SingleFieldList>
          <ChipField source="accession_number" />
        </SingleFieldList>
      </ArrayField>
      <TextField source="collector.display_name" sortBy="person.full_name" />
      <TextField source="field_number" />
      <TextField source="latest_scientific_name" sortable={false} />
      <DateField source="collect_date" locales="zh-TW" />
      <EditButton />
    </Datagrid>
  </List>
);

export default CollectionList;
