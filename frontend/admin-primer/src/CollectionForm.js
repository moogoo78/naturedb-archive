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
  Textarea,
} from '@primer/react';

import {
  useParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";

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
  }
  const NatureText = ({name, type, ...props}) => {
    if (type === 'textarea') {
      return <Textarea block name={name} onChange={handleChange} {...props}/>
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

  const renderFormContent = () => {
    return (
      <>
        <FormHeading text="採集事件" size={3} />
        <Box display="flex">
      {renderFormItem({label:"採集者", grow:{3}, pr:{2},component:
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

      </>
    )
  }

  console.log((state.loading===true) ? '🥚': '🐔' + ' state', state, value);

  let Content = null;
  if (state.loading === true) {
    Content = <Spinner />;
  } else if (state.error !== '') {
    Content = <Text color="danger.fg">{state.error}</Text>;
  } else {
    Content = renderFormContent();
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
        {Content}
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
