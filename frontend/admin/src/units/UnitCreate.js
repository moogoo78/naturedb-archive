import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
} from 'react-admin';
import { parse } from 'query-string';

const UnitCreate = props => {
  const { post_id: post_id_string } = parse(props.location.search);
  const post_id = post_id_string ? parseInt(post_id_string, 10) : '';
  console.log(post_id, '----', parse(props.location.search));
  return (
  <Create {...props}>
  <SimpleForm>
  <TextInput source="accession_number" />
  </SimpleForm>
  </Create>
  );
}

export default UnitCreate;
