import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

const RelatedCollectionButton = ({ record }) => (
    <Button
        component={Link}
        to={{
            pathname: `/collections/${record.collection_id}`,
            state: { record: { collection_id: record.collection_id } },
        }}
    >
  {`Collection: ${record.id}`}
    </Button>
);

const UnitEdit = props => (
  <Edit {...props}>
  <SimpleForm>
  <RelatedCollectionButton />
  <TextInput source="accession_number" />
  </SimpleForm>
  </Edit>
);

export default UnitEdit;
