import React from 'react';

import {
  Autocomplete,
  Box,
  Button,
  Details,
  Dialog,
  Flash,
  Heading,
  IconButton,
  Label,
  FormControl,
  Select,
  Spinner,
  Pagehead,
  Text,
  TextInput,
  Textarea,
  useDetails,
} from '@primer/react';
import {
  PlusIcon,
  XIcon,
} from '@primer/octicons-react'
import {
  useParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";
import {
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import {
  getOne,
  getList,
  updateOrCreate,
  deleteOne,
  getFormOptions,
  convertDDToDMS,
  convertDMSToDD,
  formatDate,
} from 'Utils';

import { reducer, initialArg } from 'CollectionReducer';
import {
  Confirm,
  PhokFlash,
} from 'Helpers';


const PhokHeading = ({text, size}) => {
  return (
    <Box display="flex" borderWidth="0 0 0 4px" borderStyle="solid" borderColor="#cfcfcf">
      <Heading sx={{fontSize: size, color: "#637153", pl: 2}}>{ text }</Heading>
    </Box>
  );
};

const PhokControl = ({ name, label, as=TextInput, asProps, control, errors, ...rest }) => {
  // console.log(name, label, control);
  let isDirty = false;

  // dump way to check dotted-name dirty
  const n = name.split('.');
  if (n.length == 1) {
    if (name in rest.dirtyFields) {
      isDirty = true;
    }
  } else if (n.length === 2) {
    if (n[0] in rest.dirtyFields && n[1] in rest.dirtyFields[n[0]]) {
      isDirty = true;
    }
  } else if (n.length === 3) {
    if (n[0] in rest.dirtyFields && rest.dirtyFields[n[0]][n[1]] && n[2] in rest.dirtyFields[n[0]][n[1]]) {
      isDirty = true;
    }
  } else if (n.length === 4){
    if (n[0] in rest.dirtyFields
        && rest.dirtyFields[n[0]][n[1]]
        && n[2] in rest.dirtyFields[n[0]][n[1]]
        && n[3] in rest.dirtyFields[n[0]][n[1]][n[2]]
       ) {
      isDirty = true;
    }
  }
  const As = as;
  return(
  <FormControl>
    <FormControl.Label>{label}</FormControl.Label>
    <Controller
      name={name}
      control={control}
      render={({
        field,
        fieldState,
        formState,
      }) => {
        return <As name={name} setValue={rest.setValue} {...asProps} {...field} />;
      }}
    />
    {isDirty && <FormControl.Validation variant="warning">修改過</FormControl.Validation>}
    {/*errors[name] && <span>Err: {errors[name]}</span>*/}
    {/*<FormControl.Caption>helpers</FormControl.Caption>*/}
  </FormControl>
  );
}

const DMSConverter = ({setValue, longitudeDMS, latitudeDMS}) => {

  const [lonlat, setLonLat] = React.useState({
    'longitude': longitudeDMS,
    'latitude': latitudeDMS,
  });

  const handleChange = (event, ll, index) => {
    const v = (event.target.value === '') ? 0 : parseInt(event.target.value);
    let isValid = false;

    if (index === 0 && (v === 1 || v === -1)) {
      isValid = true;
    } else if (index === 1) {
      if (ll === 'longitude') {
        if (v >= 0 && v <= 180) {
          isValid = true;
        }
      } else if ( ll === 'latitude') {
        if (v >= 0 && v <= 90) {
          isValid = true;
        }
      }
    } else if (index === 2 || index === 3) {
      if (v >=0 && v <= 60) {
        isValid = true;
      }
    }
    if (isValid) {
      // console.log('lonlat', ll, index, v);
      let tmp = {...lonlat};
      tmp[ll][index] = v
      setLonLat(tmp);
      setValue(`${ll}_decimal`, convertDMSToDD(tmp[ll]), {shouldDirty: true});
    }
  };

  return (
    <Box bg="papayawhip" borderRadius={2} p={2}>
      <Box pb={1}><Text color="palevioletred">度分秒轉換工具</Text></Box>
      <Box display="flex">
        <Box pr={2}>
          <Select sx={{width: 70}} onChange={(e)=>handleChange(e, 'longitude', 0) } value={(lonlat.longitude && lonlat.longitude.length > 0) ? lonlat.longitude[0] : ''}>
            <Select.Option value="">--</Select.Option>
            <Select.Option value="1">東經</Select.Option>
            <Select.Option value="-1">西經</Select.Option>
          </Select>
        </Box>
        <Box pr={2}>
          <TextInput label="度" value={(lonlat.longitude) ? lonlat.longitude[1] : ''} onChange={(e)=>handleChange(e, 'longitude', 1)} trailingVisual="°" sx={{width: 50}} />
        </Box>
        <Box pr={2}>
          <TextInput label="分" value={(lonlat.longitude) ? lonlat.longitude[2] : ''} onChange={(e)=>handleChange(e, 'longitude',2)} trailingVisual="'"  sx={{width: 50}}/>
        </Box>
        <Box>
          <TextInput label="秒" value={(lonlat.longitude) ? lonlat.longitude[3] : ''} onChange={(e)=>handleChange(e, 'longitude', 3)} trailingVisual="&quot;"  sx={{width: 80}}/>
        </Box>
      </Box>
      <Box display="flex" pt={2}>
        <Box pr={2}>
          <Select sx={{width: 70}} onChange={(e)=>handleChange(e, 'latitude', 0) } value={(lonlat.latitude && lonlat.latitude.length > 0) ? lonlat.latitude[0] : ''}>
            <Select.Option value="">--</Select.Option>
            <Select.Option value="1">北緯</Select.Option>
            <Select.Option value="-1">南緯</Select.Option>
          </Select>
        </Box>
        <Box pr={2}>
          <TextInput label="度" value={(lonlat.latitude) ? lonlat.latitude[1] : '' } onChange={(e)=>handleChange(e, 'latitude', 1)} trailingVisual="°" sx={{width: 50}} />
        </Box>
        <Box pr={2}>
          <TextInput label="分" value={(lonlat.latitude) ? lonlat.latitude[2]: '' } onChange={(e)=>handleChange(e, 'latitude', 2)} trailingVisual="'"  sx={{width: 50}}/>
        </Box>
        <Box>
          <TextInput label="秒" value={(lonlat.latitude) ? lonlat.latitude[3] : '' } onChange={(e)=>handleChange(e, 'latitude', 3)} trailingVisual="&quot;"  sx={{width: 80}}/>
        </Box>
      </Box>
    </Box>
  )
}

const MySelect = React.forwardRef((props, ref)=> {
  // console.log(props);
  return (
    <Select
      onChange={(e)=>{
        props.setValue(props.name, e.target.value);
      }}
      name={props.name}
      ref={ref}
      value={(props.value) ? props.value.id : ''}
    >
      {props.options.map((v, i)=> (
        <Select.Option key={i} value={v[0]}>{v[1]}</Select.Option>
      ))}
    </Select>
  );
});

/**
   query (fetch) and select, alwas has id and text
*/

const AutocompleteQuery = React.forwardRef((props, ref) => {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState((props.value) ? [props.value] : []);
  const [selected, setSelected] = React.useState((props.value) ? props.value : null);
  //console.log(props, selected, items);
  //console.log('sel', selected, props);
  return (
      <Autocomplete>
        <Autocomplete.Input
          block
          loading={loading}
          name={props.name}
          ref={ref}
          onChange={(e) => {
            setLoading(true);
            const filter = { q: e.target.value, ...props.queryFilter };
            getList(props.fetchResourceName, {filter: filter})
              .then(({json}) => {
                const items = json.data.map( x => ({id: x.id, text: x.display_name}));
                setItems(items);
                setLoading(false);
              });
          }}
          trailingAction={
            <TextInput.Action
              onClick={() => {
                setSelected(null);
                props.setValue(props.name, null, {shouldDirty: true});
              }}
              icon={XIcon}
              aria-label="Clear input"
              sx={{color: 'fg.subtle'}}
            />
          }
          value={(selected) ? selected.text : ''}
        />
        <Autocomplete.Overlay width="xxlarge">
          <Autocomplete.Menu
            items={items}
            selectedItemIds={(selected) ? [selected.id]: []}
            selectionVariant="single"
            onSelectedChange={(values)=>{
              setSelected(values[0]);
              //if (props.afterSelect) {
              //    props.afterSelect(values[0].id);
              //  }
              props.setValue(props.name, values[0], {shouldDirty: true});
            }}
            filterFn={(x) => x} // filter occurred in backend server
          />
        </Autocomplete.Overlay>
      </Autocomplete>
  );
});

const MyAutocomplete = React.forwardRef((props, ref) => {
  return (
    <Autocomplete>
      <AutocompleteWithContextInternal
        fwdRef={ref}
        items={props.items}
        value={props.value}
        setValue={props.setValue}
        name={props.name}
      />
    </Autocomplete>
  )
})


const AutocompleteWithContextInternal = ((props) => {
  //console.log('int', props);
  const autocompleteContext = React.useContext(Autocomplete.Context);
  //console.log(autocompleteContext);
  if (autocompleteContext === null) {
    throw new Error('AutocompleteContext returned null values')
  }

  const { setInputValue } = autocompleteContext;
  const [filterText, setFilterText] = React.useState(props.value)

  const mySetValue = ((type_, val) => {
    // console.log('set value', type_, val);
    setFilterText?.(val);
    props.setValue(props.name, val, {shouldDirty: true});
    setInputValue(val);
  });
  return (
    <Autocomplete.Context.Provider
      value={{...autocompleteContext, autocompleteSuggestion: '', setAutocompleteSuggestion: () => false}}
    >
      <Autocomplete.Input
        name={props.name}
        ref={props.fwdRef}
        value={filterText}
        onChange={(event) => { mySetValue('input', event.target.value); }}
        block
        trailingAction={
          <TextInput.Action
            onClick={() => { mySetValue('clear', '', ); }}
            icon={XIcon}
            aria-label="Clear input"
            sx={{color: 'fg.subtle'}}
          />
        }
      />
      <Autocomplete.Overlay width="xxlarge">
        <Autocomplete.Menu
          items={props.items}
          selectedItemIds={[]}
          selectionVariant="single"
          onSelectedChange={(values)=>{
            const val = values[0].text.split(' / ')[0];
            mySetValue('select', val);
          }}
        />
      </Autocomplete.Overlay>
    </Autocomplete.Context.Provider>
  )
});

/**
   DEPRICATED
   text as value, not selected item,
   not query & fetch, give all items
*/
const AutocompleteFreeText = React.forwardRef((props, ref) => {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState(props.items);

  const getRealValue = (item) => {
    if (item.hasOwnProperty('id') && item.hasOwnProperty('text')) {
      const text = item.text;
      if (text.indexOf(' / ') >= 0 ) {
        return text.split(' / ')[0];
      }
      return text;
    }
  };

  const [selectedText, setSelectedText] = React.useState((props.value) ? getRealValue(props.value) : '');
  // console.log(props, selected, items);
  //console.log(selectedText);
  return (
      <Autocomplete>
        <Autocomplete.Input
          block
          loading={loading}
          name={props.name}
          ref={ref}
          onChange={(e) => {
            props.setValue(props.name, e.target.value, {shouldDirty: true});
          }}
          trailingAction={
            <TextInput.Action
              onClick={() => {
                setSelectedText('');
                props.setValue(props.name, '', {shouldDirty: true});
              }}
              icon={XIcon}
              aria-label="Clear input"
              sx={{color: 'fg.subtle'}}
            />
          }
          value={selectedText}
        />
        <Autocomplete.Overlay width="xxlarge">
          <Autocomplete.Menu
            items={items}
            selectedItemIds={[]}
            selectionVariant="single"
            onSelectedChange={(values)=>{
              //console.log(values);
              setSelectedText(getRealValue(values[0]));
              //if (props.afterSelect) {
              //    props.afterSelect(values[0].id);
              //  }
              props.setValue(props.name, getRealValue(values[0]), {shouldDirty: true});
            }}
          />
        </Autocomplete.Overlay>
      </Autocomplete>
  );
});


export default function CollectionForm() {
  const params = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = React.useReducer(reducer, initialArg);

  const initHelpers = (form) => {
    let helpers = {}
    for( const i in form.biotopes) {
      const biotope = form.biotopes[i];
      helpers[`biotopes__${biotope.name}`] = {
        choices: biotope.options.map( x => ({id: x.id, text: `${x.value} / ${x.description}`}))
      }
    }
    for( const i in form.unit_measurement_or_facts) {
      const mof = form.unit_measurement_or_facts[i];
      helpers[`unit_measurement_or_facts__${mof.name}`] = {
        choices: mof.options.map( x => ({id: x.id, text: `${x.value} / ${x.description}`}))
      }
    }
    const namedAreas = form.named_areas.map(x => `named_areas__${x.name}`);
    const helperNames = ['collector', 'taxon'].concat(namedAreas);
    for (const name of helperNames) {
      helpers[name] = {
        choices: [],
        loading: false,
        //disabled: false,
      };
    }
    return helpers;
  }

  React.useEffect(() => {
    let resp = null;
    if (!params.collectionId) {
      resp = getFormOptions('collections');
    } else {
      resp = getOne('collections', params.collectionId);
    }
    resp.then(({ json }) => {
      // console.log(json.collector);
      console.log('🐣 fetch', json);

      // helper
      let helpers = initHelpers(json.form);
      if (json.data.longitude_decimal) {
        helpers.longitude_dms = convertDDToDMS(json.data.longitude_decimal);
      }
      if (json.data.latitude_decimal) {
        helpers.latitude_dms = convertDDToDMS(json.data.latitude_decimal);
      }

      // for useFieldArray auto added id override original id
      json.data.units.forEach(function (part, index) {
        this[index].unit_id = part.id;
      },json.data.units);
      json.data.identifications.forEach(function (part, index) {
        this[index].identification_id = part.id;
      },json.data.identifications);

      dispatch({type: 'INIT_SUCCESS', data: json.data, helpers: helpers, form: json.form});
    })
      .catch(error => {
        dispatch({type: 'GET_ONE_ERROR', error: error});
      });

  }, []);

  console.log('state', state);

  const CollectionHookForm = ({defaultValues, formWidgets}) => {
    const { register, handleSubmit, watch, control, setValue, formState: { errors, dirtyFields } } = useForm({
      defaultValues: defaultValues,
    });

    const {
      fields: unitFields,
      append: unitAppend,
      remove: unitRemove
    } = useFieldArray({ control, name: "units" });
    const {
      fields: idFields,
      append: idAppend,
      remove: idRemove
    } = useFieldArray({ control, name: "identifications" });

    const doSubmit = data => {
      console.log('submit', data);
      console.log('dirty', dirtyFields);
      let payload = {};
      for (const name in dirtyFields) {
        payload[name] = data[name];
      }
      // console.log(payload, data);
      updateOrCreate('collections', payload, data.id || null)
        .then((json) => {
          // console.log('return ', json);
          const label = (data.id) ? '儲存': '新增';
          dispatch({type: 'SHOW_FLASH', text: `${label}成功 - ${new Date()}`});
          if (!data.id) {
            //navigate(`/collections`, {replace: true});
            window.location.replace('/collections');
          } else {
            //navigate(`/collections/${data.id}`);
            window.location.replace(`/collections/${data.id}`);
          }
        })
        .catch(error => {
          dispatch({type: 'SHOW_FLASH', text: `${error}`, isError: true });
        });
    }

    const rest = {
      control: control,
      errors: errors,
      setValue: setValue,
      dirtyFields: dirtyFields,
    }

    //console.log(watch("field_number"));
    // console.log('dirty: ', dirtyFields);
    return (
      <form onSubmit={handleSubmit(doSubmit)}>
        <Box
          borderWidth="0px"
          borderStyle="solid"
          borderColor="border.default"
          borderRadius={0}
          display="grid"
          gridGap={3}
          sx={{maxWidth: 960}}
        >
          <PhokFlash data={state.flash} onClose={(e) => {dispatch({type: 'HIDE_FLASH'})}}/>
          <PhokHeading text="採集事件" size={3} />
          <Box display="flex">
            <Box flexGrow={3} pr={3}>
              <PhokControl name="collector" label="採集者" as={AutocompleteQuery} asProps={{block: true, fetchResourceName: 'people'}} {...rest} />
            </Box>
            <Box flexGrow={1} pr={3}>
              <PhokControl name="field_number" label="採集號" asProps={{block: true}} {...rest} />
            </Box>
            <Box flexGrow={1}>
              <PhokControl name="collect_date" label="採集日期" asProps={{block: true, type: 'date'}} {...rest} />
            </Box>
          </Box>
          <Box display="flex">
            <Box flexGrow={1} pr={3}>
              <PhokControl name="companion_text" label="隨同人員" as={Textarea} asProps={{block: true, rows: 2}} {...rest} />
            </Box>
            <Box flexGrow={1}>
              <PhokControl name="companion_text_en" label="隨同人員(英文)" as={Textarea} asProps={{block: true, rows: 2}} {...rest} />
            </Box>
          </Box>
          <PhokHeading text="地點" size={2} />
          <Box
            display="grid"
            gridTemplateColumns="1fr"
            gridRowGap={3}
          >
            {formWidgets.named_areas.map((na, index) => {
              return (
                <Box
                  borderWidth="0px"
                  borderStyle="solid"
                  borderColor="border.default"
                  borderRadius={2}
                  key={index}>
                  <PhokControl name={`named_areas.${na.name}`} label={na.label} as={AutocompleteQuery} asProps={{ block: true, fetchResourceName: 'named_areas', queryFilter: {area_class_id: na.id}}} {...rest}/>

                </Box>
              )
            })}
          </Box>
          <Box display="flex">
            <Box flexGrow={1}>
              <PhokControl name="locality_text" label="地點描述" as={Textarea} asProps={{ block: true, rows: 2}} {...rest} />
            </Box>
          </Box>
          <Box display="flex">
            <Box flexGrow={1} pr={3}>
      <PhokControl name="altitude" label="海拔 (公尺)" as={TextInput} asProps={{block: true}} {...rest} />
            </Box>
            <Box flexGrow={1}>
              <PhokControl name="altitude2" label="海拔2 (公尺)" as={TextInput} asProps={{block: true}} {...rest}/>
            </Box>
          </Box>
          <Box display="flex">
            <Box flexGrow={1} pr={3}>
              <PhokControl name="longitude_decimal" label="經度 (十進位)" as={TextInput} asProps={{block: true}} {...rest} />
              <PhokControl name="latitude_decimal" label="緯度 (十進位)" as={TextInput} asProps={{block: true}} {...rest}/>
            </Box>
            <Box flexGrow={1} pr={3}>
              <PhokControl name="longitude_text" label="經度 (verbatim)" as={TextInput} asProps={{block: true}} {...rest}/>
              <PhokControl name="latitude_text" label="緯度 (verbatim)" as={TextInput} asProps={{block: true}} {...rest}/>
            </Box>
            <Box flexGrow={1}>
              <DMSConverter longitudeDMS={state.helpers.longitude_dms} latitudeDMS={state.helpers.latitude_dms} setValue={rest.setValue} />
            </Box>
          </Box>

          <PhokHeading text="環境" size={3} />
          <Box
            display="grid"
            gridTemplateColumns="1fr"
            gridRowGap={3}
          >
            {formWidgets.biotopes.map((biotope, index) => {
              return (
                <Box
                  borderWidth="0px"
                  borderStyle="solid"
                  borderColor="border.default"
                  borderRadius={2}
                  key={index}>
                  {/*
                  <PhokControl name={`biotopes.${biotope.name}`} label={biotope.label} as={AutocompleteFreeText} asProps={{ block: true, items: state.helpers[`biotopes__${biotope.name}`].choices }} {...rest} />
                   */}
                  <PhokControl name={`biotopes.${biotope.name}`} label={biotope.label} {...rest} as={MyAutocomplete} asProps={{ block: true, items: state.helpers[`biotopes__${biotope.name}`].choices }} {...rest} />
                </Box>
              )
            })}
          </Box>
          <PhokHeading text="其他" size={3} />
          <Box display="flex">
            <Box>
              <PhokControl
                name="project"
                label="計畫"
                as={ React.forwardRef((props, ref)=> {
                  // console.log(props);
                  return (
                    <Select sx={{width: 70}} onChange={(e)=>{}} name="project" ref={ref} value={(props.value) ? props.value.id : ''} >
                      <Select.Option value="">-- select --</Select.Option>
                      {formWidgets.projects.map((project, index) => {
                        return (<Select.Option key={index} value={project.id}>{project.name}</Select.Option>)
                      })}
                    </Select>
                  );
                })}
                {...rest}
              />
            </Box>
          </Box>
          <PhokHeading text="鑑定" size={3} />
          <Box width="100px">
            <Button leadingIcon={PlusIcon} type="button" onClick={() => {idAppend({sequence: idFields.length, date:''});}}>新增鑑定</Button>
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gridGap={3}
          >
            {idFields.map((identification, index) => {
              // console.log(x);
              return (
                <Box
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="border.default"
                  borderRadius={2}
                  p={2}
                  key={identification.id}>
                  <PhokControl name={`identifications.${index}.sequence`} label="編號" {...rest} />
                  <PhokControl name={`identifications.${index}.taxon`} label="學名" as={AutocompleteQuery} asProps={{ block: true, fetchResourceName: 'taxa' }} {...rest} />
                  <PhokControl name={`identifications.${index}.identifier`} label="鑑定者" as={AutocompleteQuery} asProps={{ block: true, fetchResourceName: 'people'}} {...rest} />
                  <PhokControl name={`identifications.${index}.date`} label="鑑定日期" asProps={{type: 'date'}} {...rest} />
                  <Box width="35px" pt={3}>
                    <Confirm onOk={() => {
                      //idRemove(index);
                      deleteOne('identifications', identification.identification_id)
                        .then(x=>{
                          // console.log(x, 'ok');
                          // navigate(`/collections/${params.collectionId}`, replace=true)
                          window.location.reload();
                        });
                    }} appendText="，修改過的資料要要先儲存！" />
                  </Box>
                </Box>
              )})}
          </Box>
          <PhokHeading text="標本" size={3} />
          <Box width="100px">
            <Button leadingIcon={PlusIcon} type="button" onClick={() => {unitAppend({accession_number: '', preparation_date: ''});}}>新增標本</Button>
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gridGap={3}
          >
            {unitFields.map((unit, index) => {
              // console.log(unit);
              return (
                <Box
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="border.default"
                  borderRadius={2}
                  p={2}
                  key={unit.id}>
                  <img src={unit.image_url} />
                  {/*
                  <PhokControl
                    name={`units.${index}.kind_of_unit`}
                    label="類別"
                    as={MySelect}
                    asProps={{ options: [
                      ['HS', 'Herbiarim Sheet'],
                      ['leaf', 'leaf'],
                      ['leg', 'leg'],
                    ] }}
                    {...rest}
                  />
                   */}
                  <PhokControl name={`units.${index}.accession_number`} label="館號" {...rest} />
                  <PhokControl name={`units.${index}.preparation_date`} label="壓製日期" asProps={{type: 'date'}} {...rest} />
                  {/*
                  <PhokControl
                    name={`units.${index}.preparation_type`}
                    label="Preparation Type"
                    as={MySelect}
                    asProps={{ options: [
                      ['S', 'Specimens/Tissues'],
                      ['DNA', 'gDNA'],
                    ] }}
                    {...rest}
                    />
                   */}
                  {formWidgets.unit_measurement_or_facts.map((mof, mof_index) => {
                    return (
                      <Box
                        borderWidth="0px"
                        borderStyle="solid"
                        borderColor="border.default"
                        borderRadius={2}
                        key={mof.id}>
                        <PhokControl name={`units.${index}.measurement_or_facts.${mof.name}`} label={mof.label} as={MyAutocomplete} asProps={{ block: true, items: state.helpers[`unit_measurement_or_facts__${mof.name}`].choices }} {...rest} />
                      </Box>
                    );
                  })}
                  <Box width="35px" pt={3}>
                    <Confirm onOk={() => {
                      //unitRemove(index);
                      deleteOne('units', unit.unit_id)
                        .then(x=>{
                          // console.log(x, 'ok');
                          // navigate(`/collections/${params.collectionId}`, replace=true)
                          window.location.reload();
                        });
                    }} appendText="，修改過的資料要要先儲存！"/>
                  </Box>
                </Box>
              )})}
          </Box>
        </Box>
        <Box mt={3}>
      <Button type="submit" variant="outline" size="medium">{(params.collectionId) ? '儲存' : '新增'}</Button>
          {/* <Button type="button" variant="default" size="medium">儲存並且離開</Button> */}
        </Box>
      </form>
    );
  };
  return (
    <>
      <Pagehead>Collection</Pagehead>
      <Box
        borderWidth="0px"
        borderStyle="solid"
        borderColor="border.default"
        borderRadius={2}
        p={1}
        m={1}
        display="grid"
        gridGap={3}
        sx={{maxWidth: 960}}
      >
        {(()=> {
          if (state.loading === true) {
            return <Spinner />;
          } else if (state.error) {
            return <Text color="danger.fg">{state.error}</Text>;
          } else {
            return <CollectionHookForm
                     defaultValues={state.data}
                     formWidgets={state.form}
                   />
          }
        })()}
      </Box>
    </>
  );
}
