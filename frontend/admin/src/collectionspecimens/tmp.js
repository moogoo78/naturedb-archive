// const UnitCreateButton = ({ record }) => {
//   return (
//     <Button
//       component={Link}
//       to={`/units/create?collectiod_id=${record.id}`}
//       label="Add a unit"
//       title="Add a unit"
//     >
//     </Button>
//   );
// }


// const MyTextField = (props) => {
//   const {
//     input: { name, onChange, ...rest },
//     meta: { touched, error },
//     isRequired
//   } = useInput(props);
//   console.log(props);
//   return (
//     <Labeled label="foo">
//       <MuiTextField
//         name={name}
//         label={props.label}
//         onChange={onChange}
//         error={!!(touched && error)}
//         helperText={touched && error}
//         required={isRequired}
//         {...rest}
//       />
//     </Labeled>
//     );
// }

/* const AddMeasureOrFactButton = ({ record }) => (
 *   <Button
 *     component={Link}
 *     to={{
 *       pathname: "/measurement_or_facts/create",
 *       // Here we specify the initial record for the create view
 *       state: { record: { collection_id: record.id } },
 *     }}
 *     label="Add New"
 *   >
 *     <ChatBubbleIcon />
 *   </Button>
 * ); */

        // <ArrayField source="mof_list" label="Measurement or Fact">
        //   <Datagrid>
        //     <TextField source="parameter" />
        //     <TextField source="text" />
        //   </Datagrid>
        // </ArrayField>
        // <AddMeasureOrFactButton />


/*
          <TextInput disabled label="ID" source="id" />
        <ReferenceInput source="collector_id" reference="people" allowEmpty>
          <AutocompleteInput optionText="full_name" />
        </ReferenceInput>
        <TextInput source="field_number" />
        <DateInput source="collect_date" />
        <ArrayField source="units">
          <Datagrid>
            <TextField source="accession_number" />
            <TextField source="duplication_number" />
            <SelectField source="preparation_type" choices={UnitPreparationTypeChoices} />
            <DateField source="preparation_date" />
            <ArrayField source="measurement_or_facts" label="Measurement or Fact/物候">
              <Datagrid>
                <TextField source="parameter.label" label="參數" />
                <TextField source="value" label="數值"/>
              </Datagrid>
            </ArrayField>
            <UnitEditButton />
          </Datagrid>
        </ArrayField>
        <UnitQuickCreateButton onChange={handleUnitChange} collectionId={props.id}/>
        <TextInput source="longitude_decimal" />
        <TextInput source="latitude_decimal" />
        <TextInput source="altitude" label="alt" />
        <TextInput source="altitude2" label="alt2" />
        <ReferenceInput source="named_area_list[0].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 1}} label="國家">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[1].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 2}} label="省份">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[2].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 3}} label="縣/市">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[3].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 4}} label="鄉/鎮">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[4].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 5}} label="國家公園">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[5].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 6}} label="地點">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>
        <TextInput source="locality_text" multiline={true} />
        <ArrayField source="biotope_measurement_or_facts">
          <Datagrid>
            <TextField source="parameter.label" />
            <TextField source="value" />
          </Datagrid>
        </ArrayField>
        <MeasurementOrFactEditButton />
        <ArrayField source="identifications">
          <Datagrid>
            <TextField source="id" />
            <TextField source="taxon.full_scientific_name" fullWidth />
            <TextField source="identifier.full_name" />
            <DateField source="date" />
            <TextField source="date_text" />
            <TextField source="verification_level" />
            <IdentificationEditButton />
          </Datagrid>
        </ArrayField>
        <IdentificationQuickCreateButton onChange={handleIdentificationChange} collectionId={props.id}/>
)
 */

  const [open, setOpen] = React.useState(false);
  const toggle = (open) => {
    //console.log(open, 'tog');
    setOpen(open);
  }
  const [version, setVersion] = React.useState(0);
  const [version2, setVersion2] = React.useState(0);
  const handleUnitChange = React.useCallback(() => setVersion(version + 1), [version]);
  const handleIdentificationChange = React.useCallback(() => setVersion2(version2 + 1), [version2]);
  //<UnitCreateButton />
//console.log('CollectionEdit::props', props);

/*
const SexInput = props => {
    const {
        input,
        meta: { touched, error }
    } = useInput(props);

    return (
        <Select
            label="Sex"
            {...input}
        >
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
        </Select>
    );
};

const MyField = (props) => {
  const record = useRecordContext(props);
  const mof_list = record[props.source];
  return (
    <>
      <div>
        <SexInput source="sex" />
      </div>
    </>
  )
}

*/
//        <MuiButton onClick={(e)=> toggle(true)}>a</MuiButton>
//          <Drawer open={open} anchor="right" onClose={(e)=>toggle(false)}><h1>foo</h1></Drawer>
/*

-----
        <FunctionField label="mof" render={ record => {
          console.log(record.measurement_or_facts);
          return (
            <>
              {record.measurement_or_facts.map((v=>{
                console.log(v);
                return < key={v.parameter}>{v.label}</h2>
              }))}
            </>
          )
        }} />
*/
