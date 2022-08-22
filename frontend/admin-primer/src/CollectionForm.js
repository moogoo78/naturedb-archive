import React from 'react';

import {
  Autocomplete,
  Box,
  Heading,
  FormControl,
  Spinner,
  Pagehead,
  Text,
  TextInput,
  TextInputWithTokens,
  Textarea,
} from '@primer/react';
import {
  useParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";
import {
  useFormikContext,
  useFormik,
  Formik,
  Form,
  Field,
  ErrorMessage,
} from 'formik';
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


const NatureHeading = ({text, size}) => {
  return (
    <Box display="flex">
      <Heading sx={{fontSize: size, color:"#a1a1a1"}}>{ text }</Heading>
    </Box>
  );
};

const Fieldset = ({ name, label, ...rest }) => (
  <FormControl>
    <FormControl.Label>{label}</FormControl.Label>
    <Field id={name} name={name} {...rest} />
    <ErrorMessage name={name} />
  </FormControl>
);

const NatureItem = ({label, component, grow, ...props}) => {
  return (
    <Box flexGrow={ grow || 1 } {...props}>
     <FormControl>
        <FormControl.Label>{label}</FormControl.Label>
        {component}
        </FormControl>
    </Box>
  );
}

const reducer = (state, action) => {
  switch (action.type) {
  case 'GET_ONE_SUCCESS':
    return {
      ...state,
      loading: false,
      data: action.data,
      helpers: action.helpers,
      error: ''
    }
  case 'GET_ONE_ERROR':
    return {
      ...state,
      loading: false,
      error: action.error,
    }
  case 'SET_DATA':
    // console.log('set data', action);
    return {
      ...state,
      data: {
        ...state.data,
        [action.name]: action.value
      }
    }
  default:
    throw new Error();
  }
}

export default function CollectionForm() {

  const params = useParams();
  const initialArg = {
    loading: true,
    alert: {
      display: '',
      isOpen: false,
      content: '',
      onCancel: null,
      onOk: null,
    },
    error: '',
    data: {},
    helpers: {
      collectorSelect: {
        input: null,
        choices: [],
      },
    }
  };
  const [state, dispatch] = React.useReducer(reducer, initialArg);

  React.useEffect(() => {
    getOne('collections', params.collectionId)
      .then(({ json }) => {
        if (json.collector) {
          json.collector = {
            id: json.collector.id,
            text: json.collector.display_name,
          }
        }
        json.collectorx = [{text: 'radio-input-component', id: 4}];
        console.log('🐣 init', json);
        dispatch({type: 'GET_ONE_SUCCESS', data: json, helpers: {}});
      })
      .catch(error => {
        //dispatch({type: 'GET_ONE_ERROR', error: error});
      });
  }, []);

  const CollectorField = ({ setFieldValue, items, tokens, ...rest}) => {
    //console.log(items, value);
    console.log(rest, tokens);
    let sel = [];
    for (let x in tokens) {
      console.log(x);
    }
    return (
      <FormControl>
        <FormControl.Label id="collector-label">採集者</FormControl.Label>
        <Autocomplete>
          <Autocomplete.Input block as={TextInputWithTokens} tokens={tokens}/>
          <Autocomplete.Overlay anchorSide="inside-bottom">
            <Autocomplete.Menu
              items={[
              {text: 'main', id: 0},
              {text: 'autocomplete-tests', id: 1},
              {text: 'a11y-improvements', id: 2},
              {text: 'button-bug-fixes', id: 3},
              {text: 'radio-input-component', id: 4},
              {text: 'release-1.0.0', id: 5},
              {text: 'text-input-implementation', id: 6},
              {text: 'visual-design-tweaks', id: 7}
              ]}
              selectedItemIds={sel}
              onSelectedChange={(values)=>{
                setFieldValue('collectorx', values);
                console.log(values);s
              }}
              aria-labelledby="collector-label"
              selectionVariant="single"
            />
          </Autocomplete.Overlay>
        </Autocomplete>
      </FormControl>
    )
  }
  console.log(state);
  const renderForm = () => {
    return (
      <Formik
        initialValues={state.data}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(false);
          }, 1000);
        }}
      >
        {props => {
          console.log(props);
          return (
            <form onSubmit={props.handleSubmit}>
              {/*
              <input
                type="text"
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                value={props.values.name}
                name="name"
              />
              {props.errors.name && <div id="feedback">{props.errors.name}</div>}
               */}
              <NatureHeading text="採集事件" size={3} />
              <Box display="flex">
                <Box flexGrow={3} pr={3}>
                  {/*<Fieldset name="collector" label="採集者" as={CollectorField} setFieldValue={props.setFieldValue} items={[{id:1, text:'foo'}, {id: 2, text:'bar'}]}j />*/}
                  {/*<Fieldset name="collector" label="採集者" as={CollectorField} items={[{id:1, text:'foo'}, {id: 2, text:'bar'}]} setFieldValue={props.setFieldValue}j/>*/}
                  <CollectorField setFieldValue={props.setFieldValue} tokens={props.values.collectorx} />
                </Box>
                <Box flexGrow={1} pr={3}>
                  <Fieldset name="field_number" label="採集號" as={TextInput} block />
                </Box>
                <Box flexGrow={1}>
                  <Fieldset name="collect_date" label="採集日期" as={TextInput} type="date" block />
                </Box>
              </Box>
              <button type="submit">Submit</button>
            </form>
          )
        }}
      </Formik>
    );
  }

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
            return renderForm();
          }
        })()}
      </Box>
    </>
  );
};

function CollectitonForrm () {
  const params = useParams();
  //console.log(params.collectionId)
  const initialArg = {
    loading: true,
    alert: {
      display: '',
      isOpen: false,
      content: '',
      onCancel: null,
      onOk: null,
    },
    error: '',
    data: {},
    helpers: {
      collectorSelect: {
        input: null,
        choices: [],
      },
    }
  };

  const [state, dispatch] = React.useReducer(reducer, initialArg);
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    getOne('collections', params.collectionId)
      .then(({ json }) => {
        console.log('🐣 init');
        dispatch({type: 'GET_ONE_SUCCESS', data: json, helpers: {}});
      })
      .catch(error => {
        //dispatch({type: 'GET_ONE_ERROR', error: error});
      });
  }, []);

  const FormHeading = ({text, size}) => {
    return (
      <Box display="flex">
        <Heading sx={{fontSize: size, color:"#a1a1a1"}}>{ text }</Heading>
      </Box>
    )
  }

  const renderFormItem = ({label, component, grow, ...props}) => {
    return (
      <Box flexGrow={ grow || 1 } {...props}>
        <FormControl>
          <FormControl.Label>{label}</FormControl.Label>
          {component}
        </FormControl>
      </Box>
    );
j  }
  const NatureText = ({name, type, ...other}) => {

    if (type === 'textarea') {
      return <Textarea block name={name} onChange={handleChange} />
    } else {
      return (
        <TextInput block name={name} type={type || 'text'} onChange={handleChange} />
      )
    }
  }

  const handleChange = (event)  => {
    /*
    dispatch({
      type: 'SET_DATA',
      name: event.target.name,
      value: event.target.value
    })
    */
    setValue(event.target.value);
  }

  const renderForm = () => {

    const formik = useFormik({
      initialValues: {
        field_number: '',
        lastName: '',
       email: '',
      },
      onSubmit: values => {
        alert(JSON.stringify(values, null, 2));
      },
    });

    return (
      <form onSubmit={formik.handleSubmit}>
        <FormHeading text="採集事件" size={3} />
        <Box display="flex">
          {renderFormItem({label:"採集者", grow:3, pr:2,component:
            <Autocomplete>
              <Autocomplete.Input block/>
              <Autocomplete.Overlay anchorSide="inside-bottom">
                <Autocomplete.Menu
                  items={[
                    {text: 'css', id: 0},
                    {text: 'css-in-js', id: 1},
                    {text: 'styled-system', id: 2},
                    {text: 'javascript', id: 3},
                    {text: 'typescript', id: 4},
                    {text: 'react', id: 5},
                    {text: 'design-systems', id: 6}
                  ]}
                  selectedItemIds={[]}
                />
              </Autocomplete.Overlay>
            </Autocomplete>
                          })}
        </Box>
      </form>
    )
  }

  console.log((state.loading===true) ? '🥚': '🐔' + ' state', state, value);

  let Content = null;
  if (state.loading === true) {
    Content = <Spinner />;
  } else if (state.error !== '') {
    Content = <Text color="danger.fg">{state.error}</Text>;
  } else {
    //Content = renderForm();
    Content = SignupForm();
  }
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
        sx={{maxWidth: 1200}}
      >
        <SignupForm />
      </Box>
    </>
  );
}


/*
          <FormItem label="採集號" component={<TextInput name="field_number" onChange={handleChange}/>} />
          <FormItem label="採集日期" pl={2} component={
            <NatureText name="field_number" type="date" />
          }/>
        </Box>
        <Box display="flex">
          <FormItem label="隨同人員" sx={{ pr: 2 }} component={
            <NatureText name="companion" type="textarea" rows={2} />
          }/>
          <FormItem label="隨同人員(英文)" component={
            <NatureText name="companion" type="textarea" rows={2} />
          }/>
        </Box>
        <FormHeading text="地點" size={2} />
        <Box display="flex">
          <FormItem label="地點描述" grow={2} component={
            <NatureText name="locality" type="textarea" rows={2} />
          }/>
        </Box>
        <Box display="flex">
        </Box>
*/
