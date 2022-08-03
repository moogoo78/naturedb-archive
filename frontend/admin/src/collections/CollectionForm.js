import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Autocomplete from '@mui/material/Autocomplete';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MuiPaper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CachedIcon from '@mui/icons-material/Cached';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

// import DatePicker from '@mui/x-date-pickers/DatePicker'; import error ?
import { DatePicker } from '@mui/x-date-pickers';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

import {
  useParams,
  Link as RouterLink,
} from "react-router-dom";

import { useLocation } from "react-router";

/*
import {
  IdentificationFormDialog
} from './IdentificationFormDialog';
*/
import {
  getOne,
  getList,
  updateOrCreate,
  deleteOne,
  convertDDToDMS,
  convertDMSToDD,
  formatDate,
} from '../Utils';

import {
  DialogButtonToolbar
} from '../SharedComponents';

const DMS_MAP = {
  direction: 0,
  degree: 1,
  minute: 2,
  second: 3
}

const Paper = styled(MuiPaper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  borderRadius: '10px',
  border: '1px solid #d8d8d8',
  color: theme.palette.text.secondary,
}));

const init = (initialArg) => {
  return initialArg;
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
  case 'SET_LIST_DATA':
    let tmpList = [...state.data[action.list]];
    tmpList[action.index][action.name] = action.value;
    return {
      ...state,
      data: {
        ...state.data,
        [action.list]: tmpList,
      }
    };
  case 'SET_UNIT_MOF':
    let tmpUnits = [...state.data.units];
    tmpUnits[state.helpers.unitsIndex].measurement_or_facts[action.index].value = action.value;
    // console.log(tmpUnits, 'set', action.value);
    return {
      ...state,
      data: {
        ...state.data,
        units: tmpUnits,
      }
      };
  case 'SET_HELPER':
    // console.log(action.input, action.opitons, action.value);
    if (action.value !== undefined) {
      return {
        ...state,
        helpers: {
          ...state.helpers,
          [action.name]: action.value
        }
      }
    } else if (action.name.indexOf('identifications__') >= 0) {
      // console.log(action, '!!');
      let tmp = state.helpers.identifications;
      const klist = action.name.split('__');
      tmp[klist[1]][klist[2]].options = action.options;
      tmp[klist[1]][klist[2]].input = action.input;
      return {
        ...state,
        helpers: {
          ...state.helpers,
          identifications: tmp,
        }
      }
    } else if (action.input !== undefined && action.options !== undefined) {
      return {
        ...state,
        helpers: {
          ...state.helpers,
          [action.name]: {
            ...state.helpers[action.name],
            input: action.input,
            options: action.options
          }
        }
      }
    }
  case 'SET_ALERT':
    return {
      ...state,
      alert: {
        ...alert,
        text: action.text,
        time: (action.time) ? action.time : undefined,
        isDisplay: action.isDisplay,
      }
    }
  case 'SET_DIALOG_NEW':
    if ( action.name === 'identifications' ) {
      let tmpData = [...state.data.identifications];
      let tmpHelpers = [...state.helpers.identifications];
      tmpData.push({sequence: tmpData.length});
      tmpHelpers.push({
        taxonSelect: {input: '', options: []},
        identifierSelect: {input: '', options: []},
      });
      return {
        ...state,
        data: {
          ...state.data,
          identifications: tmpData,
        },
        helpers: {
          ...state.helpers,
          identifications: tmpHelpers,
          identificationsIndex: tmpData.length - 1,
        }
      };
    } else if ( action.name === 'units' ){
      let tmpData = [...state.data.units];
      const mofs = [];
      for (const x in state.data.form_options.measurement_or_facts) {

        mofs.push({
          name: x,
          id: state.data.form_options.measurement_or_facts[x].id,
          label: state.data.form_options.measurement_or_facts[x].label,
          value: null,
        });
      }
      tmpData.push({
        measurement_or_facts:mofs,
        accession_number: '',
      });
      // console.log(tmpData, 'xxx');
      return {
        ...state,
        data: {
          ...state.data,
          units: tmpData,
        },
        helpers: {
          ...state.helpers,
          //units: tmpHelpers,
          unitsIndex: tmpData.length - 1,
        }
      };
    }
  case 'SET_DIALOG_CANCEL':
    if ( action.name === 'identifications' ) {
      let tmpData = [...state.data.identifications];
      let tmpHelpers = [...state.helpers.identifications];
      if (tmpData[state.helpers.identificationsIndex] &&
          tmpData[state.helpers.identificationsIndex].id === undefined &&
          !action.notPop
         ) {
        tmpData.pop();
        tmpHelpers.pop();
      }
      return {
        ...state,
        data: {
          ...state.data,
          identifications: tmpData,
        },
        helpers: {
          ...state.helpers,
          identifications: tmpHelpers,
          identificationsIndex: -1,
        }
      };
    } else if ( action.name === 'units' ) {
      let tmpData = [...state.data.units];
      if (tmpData[state.helpers.unitsIndex] &&
          tmpData[state.helpers.unitsIndex].id === undefined &&
         !action.notPop) {
        tmpData.pop();
      }
      return {
        ...state,
        data: {
          ...state.data,
          units: tmpData,
        },
        helpers: {
          ...state.helpers,
          unitsIndex: -1,
        }
      };
    }
  case 'SET_GEO_DATA':
    const regex = /(longitude|latitude)_(direction|degree|minute|second)/g;
    const match = regex.exec(action.name);
    // console.log(action.name, action.value, match);
    if (action.name === 'longitude_decimal') {
      const dms_lon = convertDDToDMS(action.value);
      return {
        ...state,
        data: {
          ...state.data,
          longitude_direction: dms_lon[0],
          longitude_degree: dms_lon[1].toString(),
          longitude_minute: dms_lon[2].toString(),
          longitude_second: dms_lon[3].toString(),
          longitude_decimal: action.value,
        }
      }
    } else if (action.name === 'latitude_decimal') {
      const dms_lat = convertDDToDMS(action.value);
      return {
        ...state,
        data: {
          ...state.data,
          latitude_direction: dms_lat[0],
          latitude_degree: dms_lat[1].toString(),
          latitude_minute: dms_lat[2].toString(),
          latitude_second: dms_lat[3].toString(),
          latitude_decimal: action.value,
        }
      }
    } else if (match) {
      //console.log(match[1], match[2], action.name, action.value);
      // validate
      if (['minute', 'second'].indexOf(match[2]) >= 0) {
        if (parseInt(action.value) >= 60 || parseInt(action.value) <= -1) {
          return {
            ...state
          };
        }
      } else if ((action.name === 'longitude_degree') &&
                 (parseInt(action.value) >= 180 || parseInt(action.value) <= -1)) {
        return {
          ...state
        };
      } else if ((action.name === 'latitude_degree') &&
                 (parseInt(action.value) >= 90 || parseInt(action.value) <= -1)) {
        return {
          ...state
        };
      }

      if (match[1] === 'longitude') {
        let dms = [
          state.data.longitude_direction,
          state.data.longitude_degree,
          state.data.longitude_minute,
          state.data.longitude_second
        ];
        const index = DMS_MAP[match[2]];
        dms[index] = action.value;
        const lon_dd = convertDMSToDD(dms);
        return {
          ...state,
          data: {
            ...state.data,
            longitude_decimal: lon_dd,
            [action.name]: action.value
          }
        }
      } else if (match[1] === 'latitude') {
        let dms = [
          state.data.latitude_direction,
          state.data.latitude_degree,
          state.data.latitude_minute,
          state.data.latitude_second
        ];
        const index = DMS_MAP[match[2]];
        dms[index] = action.value;
        const lat_dd = convertDMSToDD(dms);
        return {
          ...state,
          data: {
            ...state.data,
            latitude_decimal: lat_dd,
            [action.name]: action.value
          }
        }
      } else {
        return {
          ...state
        };
      }
    }
  default:
    throw new Error();
  }
}

const CollectionForm = () => {
  let params = useParams();
  let location = useLocation();

  const initialArg = {
    loading: true,
    alert: {
      isDisplay: false,
      text: '',
      time: null,
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

  const [state, dispatch] = React.useReducer(reducer, initialArg, init);

  React.useEffect(() => {
    init();
  }, []);

  const init = () => {
    if (!params.collectionId) {
      const initialHelpers = {
        collectorSelect: {
          input: '',
          options: [],
        },
        identificationsIndex: -1,
        identifications: [],
        idSequenceOptions: [0],
        unitsIndex: -1,
        deleteConfirmStatus: 'init',
      }
      const initData = {
        named_areas: [],
        identifications: [],
        units: [],
        biotopes: [],
      }
      dispatch({type: 'GET_ONE_SUCCESS', data: initData, helpers: initialHelpers});
    } else {
      getOne('collections', params.collectionId)
        .then(({ json }) => {
          // console.log('getOne', json);
          if (json.longitude_decimal) {
            const dms_lon = convertDDToDMS(json.longitude_decimal);
            json.longitude_direction = dms_lon[0];
            json.longitude_degree = dms_lon[1];
            json.longitude_minute = dms_lon[2];
            json.longitude_second = dms_lon[3];
            const dms_lat = convertDDToDMS(json.latitude_decimal);
            json.latitude_direction = dms_lat[0];
            json.latitude_degree = dms_lat[1];
            json.latitude_minute = dms_lat[2];
            json.latitude_second = dms_lat[3];
          }
          //setData(json);
          const identifications = json.identifications.map((x)=> {
            return {
              taxonSelect: {
                input: (x.taxon) ? x.taxon.display_name : '',
                options: (x.taxon) ? [x.taxon] : [],
              },
              identifierSelect: {
                input: (x.identifier) ? x.identifier.display_name : '',
                options: (x.identifier) ? [x.identifier] : [],
              }
            }
          });
          const idSequenceOptions = [];
          for (let i=0; i < 10 ; i++) {
            idSequenceOptions.push(i+1);
          }
          const initialHelpers = {
            collectorSelect: {
              input: json.collector.display_name || '',
              options: [json.collector],
            },
            identificationsIndex: -1,
            identifications: identifications,
            idSequenceOptions: idSequenceOptions,
            unitsIndex: -1,
            deleteConfirmStatus: 'init',
            // units: units,
            /*...namedAreas,*/
          }
          console.log('🐣 init');
          dispatch({type: 'GET_ONE_SUCCESS', data: json, helpers: initialHelpers});
        })
        .catch(error => {
          dispatch({type: 'GET_ONE_ERROR', error: error});
        });
    }
  }

  const handleChangeByID = (event) => {
    dispatch({
      type: 'SET_DATA',
      name: event.target.id,
      value: event.target.value
    })
  }

  const handleSubmitCont = (event) => {
    doSubmit();
    dispatch({type: 'SET_ALERT', text:'已儲存', time: new Date(), isDisplay: true});
  }

  const handleSubmit = (event) => {
    doSubmit();
  };

  const doSubmit = () => {
    const data = state.data;
    let cleaned = {
      collector_id: (data.collector) ? data.collector.id : null,
      collect_date: formatDate(data.collect_date),
      field_number: data.field_number || '',
      companion_text: data.companion_text || '',
      companion_text_en: data.companion_text_en || '',
      named_areas: data.named_areas.map((x) => [x.id, x.value ? x.value.id : null]),
      latitude_decimal: data.latitude_decimal,
      longitude_decimal: data.longitude_decimal,
      altitude: data.altitude,
      altitude2: data.altitude2,
      locality_text: data.locality_text,
      biotopes: data.biotopes.map((x) => [x.id, x.value ? [x.value.id, x.value.value_en, x.value.option_id] : null]),
      identifications: data.identifications.map((x)=> {
        return {
          id: x.id,
          identifier_id: x.identifier ? x.identifier.id : null,
          date: formatDate(x.date),
          date_text: x.date_text,
          taxon_id:  x.taxon ? x.taxon.id : null,
          sequence: x.sequence,
        };
      }),
      units: data.units.map((x) => {
        return {
          id: x.id,
          accession_number: x.accession_number,
          preparation_date: formatDate(x.preparation_date),
          measurement_or_facts: x.measurement_or_facts.map((mof) => [mof.id, mof.value ? [mof.value.id, mof.value.value_en, mof.value.option_id] : null]),
        }
      }),
    }
    console.log('update or create:', cleaned);

    let itemId = null;
    if (params?.collectionId) {
      itemId = params.collectionId;
    }
    updateOrCreate('collections', cleaned, itemId)
      .then((json) => {
        console.log('return ', json);
        //if (isReload === true) {
        //  window.location.reload();
        //}
      });
  }


  console.log((state.loading===true) ? '🥚': '🐔' + ' state', state);

  const {data, helpers} = state;

  const intValue = (value) => {
    if (value || value === 0) {
      return parseInt(value, 10);
    } else {
      return '';
    }
  }

  return (
    <>
      {state.loading === true ? 'Loading...'
       : (state.error !== '' ? `⛔ ${state.error}`
          :
          <>
            {(helpers.identificationsIndex >= 0) ?
             <Dialog open={(helpers.identificationsIndex >= 0) ? true : false} onClose={() => {dispatch({'type': 'SET_HELPER', name: 'identificationsIndex', value: -1});}}>
               <DialogTitle>鑑定記錄 - {data.identifications[helpers.identificationsIndex].sequence+1}</DialogTitle>
               <DialogContent>
                 <DialogContentText>
                 </DialogContentText>
                 <Grid container spacing={2}>
                   <Grid item xs={12}>
                     <Autocomplete
                       id="taxon"
                       options={helpers.identifications[helpers.identificationsIndex].taxonSelect.options}
                       isOptionEqualToValue={(option, value) => option.id === value.id}
                       getOptionLabel={(option) => option.display_name}
                       value={data.identifications[helpers.identificationsIndex].taxon || null}
                       onChange={(e, v, reason) => {
                         dispatch({type: 'SET_LIST_DATA', name: 'taxon', value: v, list:'identifications', index: helpers.identificationsIndex});
                       }}
                       onInputChange={(e, v, reason) => {
                         // console.log('ON INPUT', reason, v, data.collector);
                         getList('taxa', { filter: { q: v } })
                           .then(({json}) => {
                             const value = data.identifications[helpers.identificationsIndex].taxon;
                             if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                               json.data.push(value);
                             }
                             dispatch({type: 'SET_HELPER', name: `identifications__${helpers.identificationsIndex}__taxonSelect`, options: json.data, input: v});
                           });
                       }}
                       inputValue={helpers.identifications[helpers.identificationsIndex].taxonSelect.input}
                       renderInput={(params) => (
                         <TextField
                           {...params}
                           label="學名"
                           fullWidth
                           variant="standard"/>)}
                     />
                   </Grid>
                   <Grid item xs={12}>
                     <Autocomplete
                       id="identifier"
                       options={helpers.identifications[helpers.identificationsIndex].identifierSelect.options}
                       isOptionEqualToValue={(option, value) => option.id === value.id}
                       getOptionLabel={(option) => option.display_name}
                       value={data.identifications[helpers.identificationsIndex].identifier || null}
                       onChange={(e, v, reason) => {
                         dispatch({type: 'SET_LIST_DATA', name: 'identifier', value: v, list:'identifications', index: helpers.identificationsIndex});
                       }}
                       onInputChange={(e, v, reason) => {
                         // console.log('ON INPUT', reason, v, data.collector);
                         getList('people', { filter: { q: v } })
                           .then(({json}) => {
                             const value = data.identifications[helpers.identificationsIndex].identifier;
                             if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                               json.data.push(value);
                             }
                             dispatch({type: 'SET_HELPER', name: `identifications__${helpers.identificationsIndex}__identifierSelect`, options: json.data, input: v});
                           });
                       }}
                       inputValue={helpers.identifications[helpers.identificationsIndex].identifierSelect.input}
                       renderInput={(params) => (
                          <TextField
                            {...params}
                            label="鑑定者"
                            variant="standard"/>)}
                     />
                   </Grid>
                   <Grid item xs={5}>
                     <DatePicker
                       disableFuture
                       label="鑑定日期"
                       openTo="year"
                       clearable={true}
                       views={['year', 'month', 'day']}
                       value={data.identifications[helpers.identificationsIndex].date || null}
                       inputFormat="yyyy-MM-dd"
                       mask='____-__-__'
                       onChange={(selectDate, input)=> {
                         if (!isNaN(selectDate)) {
                           dispatch({type: 'SET_LIST_DATA', name: 'date', value: selectDate, list:'identifications', index: helpers.identificationsIndex});
                         } else {
                           console.log('collect_date: invalid Date', selectDate, input);
                         }
                       }}
                       renderInput={(params) => <TextField {...params} variant="standard" fullWidth />}
                     />
                   </Grid>
                   <Grid item xs={5}>
                     <TextField
                       id="verbatim-identification-date"
                       label="日期格式不完整"
                       fullWidth
                       variant="standard"
                       value={data.identifications[helpers.identificationsIndex].date_text || ''}
                       onChange={(e)=> {
                         dispatch({type: 'SET_LIST_DATA', name: 'date_text', value: e.target.value, list:'identifications', index: helpers.identificationsIndex});
                       }}
                     />
                   </Grid>
                   <Grid item xs={2}>
                     <TextField
                       label="鑑定次數"
                       select
                       fullWidth
                       variant="standard"
                       value={parseInt(data.identifications[helpers.identificationsIndex].sequence, 10) + 1}
                       onChange={(e)=> {
                         dispatch({type: 'SET_LIST_DATA', name: 'sequence', value: parseInt(e.target.value)-1, list:'identifications', index: helpers.identificationsIndex});
                       }}
                     >
                       {helpers.idSequenceOptions.map((x) => (
                         <MenuItem key={x} value={x}>
                           {x}
                         </MenuItem>
                       ))}
                     </TextField>
                   </Grid>
                 </Grid>
               </DialogContent>
               <DialogActions>
                 <DialogButtonToolbar
                   status={helpers.deleteConfirmStatus}
                   hasId={(data.identifications[helpers.identificationsIndex].id) ? true : false}
                   onDeleteYes={() => {
                     if (data.identifications[helpers.identificationsIndex].id) {
                       deleteOne('identifications', data.identifications[helpers.identificationsIndex].id).then((resp)=> {
                         window.location.reload();
                       });

                     }
                   }}
                   onDeleteNo={() => {
                     dispatch({type:'SET_HELPER', name:'deleteConfirmStatus', value: 'init'});
                   }}
                   onDelete={() => {
                     dispatch({type:'SET_HELPER', name:'deleteConfirmStatus', value: 'clicked'});
                   }}
                   onCancel={() => {
                     dispatch({type: 'SET_DIALOG_CANCEL', name: 'identifications'});
                   }}
                   onSubmit={() => {
                     dispatch({type: 'SET_DIALOG_CANCEL', name: 'identifications', notPop: true}); 
                   }}
                 />
               </DialogActions>
             </Dialog> : null}
            {(helpers.unitsIndex >= 0) ?
             <Dialog open={(helpers.unitsIndex >= 0) ? true : false} onClose={() => {dispatch({'type': 'SET_HELPER', name: 'unitsIndex', value: -1});}}>
               <DialogTitle>標本記錄 - {data.units[helpers.unitsIndex].accession_number}</DialogTitle>
               <DialogContent>
                 <DialogContentText>
                 </DialogContentText>
                 <Grid container spacing={2}>
                   <Grid item xs={12}>
                     <TextField
                       id="unit-accession_number"
                       label="館號"
                       fullWidth
                       variant="standard"
                       value={data.units[helpers.unitsIndex].accession_number}
                       onChange={(e)=> {
                         dispatch({type: 'SET_LIST_DATA', name: 'accession_number', value: e.target.value, list:'units', index: helpers.unitsIndex});
                       }}
                     />
                   </Grid>
                   <Grid item xs={12}>
                     <Typography variants="subtitle1">物候</Typography>
                     <Stack spacing={1}>
                       {data.units[helpers.unitsIndex].measurement_or_facts.map((x, i)=> {
                         //console.log(x);
                         let inputValue = '';
                         if (x.value) {
                           inputValue = x.value.value_en;
                         }
                         return (
                           <Autocomplete
                             freeSolo
                             key={i}
                             id={x.name}
                             isOptionEqualToValue={(option, value) => option.id === value.option_id}
                             getOptionLabel={(option) => `${option.value_en} (${option.value})`}
                             options={data.form_options.measurement_or_facts[x.name].options}
                             value={(x.value && x.value.option_id) ? x.value : null}
                             inputValue={inputValue}
                             onChange={(e, v, reason) => {
                               //console.log('SEL', v);
                               dispatch({type: 'SET_UNIT_MOF', value: v, index: i});
                             }}
                             onInputChange={(e, v, reason) => {
                               //console.log('INP', v);
                               if (reason === 'input') {
                                 dispatch({type: 'SET_UNIT_MOF', value: {...x.value, value_en: v}, index: i});
                               }
                             }}
                             renderInput={(params) => (
                               <TextField
                                 {...params}
                                 label={data.form_options.measurement_or_facts[x.name].label}
                                 variant="standard"
                               />)}
                           />)
                       })}
                     </Stack>
                   </Grid>
                   <Grid item xs={12}>
                     <DatePicker
                       disableFuture
                       label="壓製日期"
                       openTo="year"
                       clearable={true}
                       views={['year', 'month', 'day']}
                       value={data.units[helpers.unitsIndex].preparation_date || null}
                       inputFormat="yyyy-MM-dd"
                       mask='____-__-__'
                       onChange={(selectDate, input)=> {
                         // console.log(selectDate, input, 'ee');
                         if (!isNaN(selectDate)) {
                           dispatch({type: 'SET_LIST_DATA', name: 'preparation_date', value: selectDate, list:'units', index: helpers.unitsIndex});
                         } else {
                           console.log('unit preparation: invalid Date', selectDate, input);
                         }
                       }}
                       renderInput={(params) => <TextField {...params} variant="standard"/>}
                     />
                   </Grid>
                 </Grid>
               </DialogContent>
               <DialogActions>
                 <DialogButtonToolbar
                   status={helpers.deleteConfirmStatus}
                   hasId={(data.units[helpers.unitsIndex].id) ? true : false}
                   onDeleteYes={() => {
                     console.log('TODO DELETE');
                   }}
                   onDeleteNo={() => {
                     dispatch({type:'SET_HELPER', name:'deleteConfirmStatus', value: 'init'});
                   }}
                   onDelete={() => {
                     dispatch({type:'SET_HELPER', name:'deleteConfirmStatus', value: 'clicked'});
                   }}
                   onCancel={() => {
                     dispatch({type: 'SET_DIALOG_CANCEL', name: 'units'});
                   }}
                   onSubmit={() => {
                     dispatch({type: 'SET_DIALOG_CANCEL', name: 'units', notPop: true}); 
                   }}
                 />
               </DialogActions>
             </Dialog> : null}

            <Breadcrumbs aria-label="breadcrumb" sx={{ pb:2 }}>
              <Link underline="hover" color="inherit" href="/">
                HAST
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href="/collections"
                >
                Collections
              </Link>
              <Typography color="text.primary">採集號: {data.field_number}</Typography>
            </Breadcrumbs>
            {state.alert.isDisplay ?
             <Alert variant="outlined" severity="success" onClose={()=>{dispatch({type: 'SET_ALERT', isDisplay: false})}}>
               {`${state.alert.text} - ${state.alert.time}`}
             </Alert> : null}
            {location.state?.filterList.length > 0 ?
             <Button
               variant="outlined"
               startIcon={<KeyboardBackspaceIcon />}
               to="/collections"
               state={{filterList: location.state.filterList}}
               component={RouterLink}
             >
              回去剛才的查詢
             </Button> : null}
            {/*<Typography variant="h4">Collection</Typography>*/}
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <Paper elevation={0}>
                  <Grid container rowSpacing={2} columnSpacing={2}>
                    <Grid item xs={12}><Typography variant="h5">採集事件</Typography></Grid>
                    <Grid item xs={6}>
                      <Autocomplete
                        id="collector"
                        options={helpers.collectorSelect.options}
                        isOptionEqualToValue={(option, value) => option.id === value.id }
                        getOptionLabel={(option) => (option && option.display_name ) ? option.display_name : ''}
                        value={(data.collector && data.collector.id ) ? data.collector : null}
                        onChange={(e, v, reason) => {
                          //console.log('ON CHANGE', reason, v);
                          dispatch({type: 'SET_DATA', name: 'collector', value: v});
                        }}
                        onInputChange={(e, v, reason) => {
                          // console.log('ON INPUT', reason, v, data.collector);
                          getList('people', { filter: { q: v } })
                            .then(({json}) => {
                              const value = data.collector;
                              if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                                json.data.push(value);
                              }
                              dispatch({type: 'SET_HELPER', name: 'collectorSelect', options: json.data, input: v});
                            });
                        }}
                        inputValue={helpers.collectorSelect.input}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="採集者"
                            variant="standard"/>)}
                            />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        id="field_number"
                        variant="standard"
                        label="採集號"
                        fullWidth
                        value={data.field_number}
                        onChange={handleChangeByID}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <DatePicker
                        disableFuture
                        label="採集日期"
                        openTo="year"
                        clearable={true}
                        views={['year', 'month', 'day']}
                        value={data.collect_date || null}
                        inputFormat="yyyy-MM-dd"
                        mask='____-__-__'
                        onChange={(selectDate, input)=> {
                          console.log('collect_date: change', selectDate, input);
                          if (!isNaN(selectDate)) {
                            dispatch({type: 'SET_DATA', name: 'collect_date', value: selectDate});
                          } else {
                            console.log('collect_date: invalid Date', selectDate, input);
                          }
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard"/>}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        id="companion_text"
                        variant="standard"
                        label="隨同人員"
                        multiline
                        fullWidth
                        rows={3}
                        value={data.companion_text || ''}
                        onChange={handleChangeByID}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        id="companion_text_en"
                        variant="standard"
                        label="隨同人員(英)"
                        multiline
                        fullWidth
                        rows={3}
                        value={data.companion_text_en || ''}
                        onChange={handleChangeByID}
                      />
                    </Grid>
                    <Grid item xs={12}><Typography variant="h6">地點</Typography></Grid>
                    {data.named_areas.map((named_area, i)=> {
                      return (
                        <Grid item xs={6} key={i}>
                          <Autocomplete
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.display_name || ''}
                            filterOptions={(options, {inputValue}) => {
                              if (i > 0 &&
                                  data.named_areas[i-1].value &&
                                  data.named_areas[i].parent_id >= 0) {
                                const parentId = data.named_areas[i-1].value.id;
                                return options.filter((x) => (x.parent_id === parentId) && (x.display_name.toLowerCase().indexOf(inputValue.toLowerCase()) >=0) );
                              } else {
                                return options;
                              }
                            }}
                            /*options={helpers[`${areaName}__Select`].options}*/
                            options={data.form_options.named_areas[named_area.name].options}
                            value={data.named_areas[i].value || null}
                            onChange={(e, v, reason) => {
                              //console.log('ON CHANGE', reason, v);
                              //dispatch({type: 'SET_DATA', name: `named_areas__${i}`, value: v });
                              dispatch({type: 'SET_LIST_DATA', list: 'named_areas', index: i, name: 'value', value: v});
                            }}
                            /*onInputChange={(e, v, reason) => {
                              // console.log('ON INPUT', reason, v);
                              let area_class_id = undefined;
                              console.log(data.named_areas[i].id, 'xx');
                              const params = {
                                filter: {
                                  q: v,
                                  area_class_id: data.named_areas[i].id,
                                }
                              }
                              getList('named_areas', params)
                                .then(({json}) => {
                                  const value = data.named_areas[i].value;
                                  if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                                    json.data.push(value);
                                  }
                                  dispatch({type: 'SET_SELECT', name: `${areaName}__Select`, options: json.data, input: v});
                                });
                            }}
                            inputValue={helpers[`${areaName}__Select`].input}*/
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={`${named_area.label}`}
                                variant="standard"
                              />)}
                          />
                        </Grid>
                      )
                    }) }
                    <Grid item xs={10}>
                      <TextField
                        id="locality_text"
                        variant="standard"
                        label="地點描述"
                        multiline
                        fullWidth
                        rows={3}
                        value={data.locality_text || ''}
                        onChange={handleChangeByID}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Grid container>
                        <Grid item>
                          <TextField
                            id="altitude"
                            variant="standard"
                            label="海拔(低)"
                            fullWidth
                            value={data.altitude || ''}
                            onChange={handleChangeByID}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">m</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            id="altitude2"
                            label="海拔(高)"
                            value={data.altitude2 || ''}
                            onChange={handleChangeByID}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">m</InputAdornment>,
                            }}
                            variant="standard"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        id="longitude_decimal"
                        variant="standard"
                        label="經度(十進位)"
                        fullWidth
                        value={data.longitude_decimal || ''}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <FormControl fullWidth>
                        <InputLabel id="longitude_direction-label">東/西經</InputLabel>
                        <Select
                          labelId="longitude_direction-label"
                          id="longitude_direction"
                          value={data.longitude_direction || ''}
                          label="東/西經"
                          onChange={(e) => {
                            dispatch({type: 'SET_GEO_DATA', name: 'longitude_direction', value: e.target.value});
                          }}
                        >
                          <MenuItem value={""}>--</MenuItem>
                          <MenuItem value={1}>東經</MenuItem>
                          <MenuItem value={-1}>西經</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id="longitude_degree"
                        variant="outlined"
                        label="經度(度)"
                        type="number"
                        value={parseInt(data.longitude_degree,10) || ''}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">°</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id="longitude_minute"
                        variant="outlined"
                        label="經度(分)"
                        value={intValue(data.longitude_minute)}
                        helperText={(parseInt(data.longitude_minute, 10) > 59 || parseInt(data.longitude_minute, 10) < 0 ) ? '超出範圍': ''}
                        error={(parseInt(data.longitude_minute, 10) > 59 || parseInt(data.longitude_minute, 10) < 0 ) ? true: false}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">'</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        id="longitude_second"
                        variant="outlined"
                        label="經度(秒)"
                        value={intValue(data.longitude_second)}
                        helperText={(parseInt(data.longitude_second, 10) > 59 || parseInt(data.longitude_second, 10) < 0 ) ? '超出範圍': ''}
                        error={(parseInt(data.longitude_second, 10) > 59 || parseInt(data.longitude_second, 10) < 0 ) ? true: false}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">"</InputAdornment>,
                     }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        id="latitude_decimal"
                        variant="standard"
                        label="緯度(十進位)"
                        fullWidth
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        value={data.latitude_decimal || ''}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">南/北緯度</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="latitude_direction"
                          value={data.latitude_direction || ''}
                          label="南/北緯度"
                          onChange={(e) => {
                            dispatch({type: 'SET_GEO_DATA', name: 'latitude_direction', value: e.target.value});
                        }}
                        >
                          <MenuItem value={""}></MenuItem>
                          <MenuItem value={1}>北緯</MenuItem>
                          <MenuItem value={-1}>南緯</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id="latitude_degree"
                        label="緯度(度)"
                        type="number"
                        variant="outlined"
                        value={parseInt(data.latitude_degree, 10) || ''}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        InputProps={{
                       endAdornment: <InputAdornment position="end">°</InputAdornment>
                     }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id="latitude_minute"
                        variant="outlined"
                        label="緯度(分)"
                        value={intValue(data.latitude_minute)}
                        helperText={(parseInt(data.latitude_minute, 10) > 59 || parseInt(data.latitude_minute, 10) < 0 ) ? '超出範圍': ''}
                        error={(parseInt(data.latitude_minute, 10) > 59 || parseInt(data.latitude_minute, 10) < 0 ) ? true: false}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        InputProps={{
                       endAdornment: <InputAdornment position="end">'</InputAdornment>
                     }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        id="latitude_second"
                        label="緯度(秒)"
                        variant="outlined"
                        value={intValue(data.latitude_second)}
                        helperText={(parseInt(data.latitude_second, 10) > 59 || parseInt(data.latitude_second, 10) < 0 ) ? '超出範圍': ''}
                        error={(parseInt(data.latitude_second, 10) > 59 || parseInt(data.latitude_second, 10) < 0 ) ? true: false}
                        onChange={(e) => {
                          dispatch({type: 'SET_GEO_DATA', name: e.target.id, value: e.target.value});
                        }}
                        InputProps={{
                       endAdornment: <InputAdornment position="end">"</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}><Typography variant="h6" sx={{mt:3}}>鑑定 & 環境</Typography></Grid>
                  <Grid item xs={12}>
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                      >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>鑑定</Typography>
                        <Typography sx={{ color: 'text.secondary' }}></Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container justifyContent="flex-end"><Button variant="contained" sx={{ mb:2 }} onClick={() => {
                          dispatch({type: 'SET_DIALOG_NEW', name: 'identifications'});
                        }}>新增</Button></Grid>
                        <TableContainer component={Paper}>
                          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell>鑑定次數</TableCell>
                                <TableCell>學名</TableCell>
                                <TableCell>鑑訂者</TableCell>
                                <TableCell>鑑訂日期</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.identifications.map((row, index) => {
                                return(
                                  <TableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                  >
                                    <TableCell component="th" scope="row">
                                      {row.sequence+1}
                                    </TableCell>
                                    <TableCell align="right">{(row.taxon) ? row.taxon.full_scientific_name : ''}</TableCell>
                                    <TableCell align="right">{(row.identifier) ? row.identifier.display_name : ''}</TableCell>
                                    <TableCell align="right">{(row.date_text) ? row.date_text : formatDate(row.date)}</TableCell>
                                    <TableCell align="right"><Button variant="outlined" onClick={() => {
                                      dispatch({type: 'SET_HELPER', name: 'identificationsIndex', value: index});
                                    }}>編輯</Button></TableCell>
                                  </TableRow>
                                )})}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded={false}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                      >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>植群/環境</Typography>
                        <Typography sx={{ color: 'text.secondary' }}></Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1} sx={{ width: 650 }}>
                          {data.biotopes.map((biotope, i)=> {
                            let inputValue = '';
                            if (biotope.value) {
                              inputValue = biotope.value.value_en;
                            }
                            return (
                              <Autocomplete
                                key={i}
                                id={biotope.name}
                                freeSolo
                                isOptionEqualToValue={(option, value) => option.id === value.option_id}
                                getOptionLabel={(option) => `${option.value_en} (${option.value})`}
                                options={data.form_options.biotopes[biotope.name].options}
                                value={(biotope.value && biotope.value.option_id) ? biotope.value : null }
                                inputValue={inputValue}
                                onChange={(e, v, reason) => {
                                  dispatch({type: 'SET_LIST_DATA', list: 'biotopes', index: i, name: 'value', value: v});
                                }}
                                onInputChange={(e, v, reason) => {
                                  //console.log(e, v, 'inpt', reason);
                                  if (['input', 'clear'].includes(reason)) {
                                    dispatch({type: 'SET_LIST_DATA', list: 'biotopes', index: i, name: 'value', value: {...biotope.value, value_en: v}});
                                  }

                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={data.form_options.biotopes[biotope.name].label}
                                    variant="standard"
                                  />)}
                              />)
                          })}
                          {/*
                          {biotopeOptions.map((parameter) => {
                            const key = `biotope__${parameter.name}`;
                            const optionValue = (data.hashOwnProperty(key)) ? data[key] : null;
                            let value = '';
                            let inputValue = '';
                            let label = '';
                            //console.log(key, optionValue);
                            return (
                              <Autocomplete
                                key={key}
                                freeSolo
                                options={parameter.options}
                                isOptionEqualToValue={(option, value) => {
                                  return (option.hasOwnProperty('option') ? option.option.id===value.option.id : false)
                                }}
                                value={optionValue}
                                onChange={(event, newValue) => {console.log('change', newValue);}}
                                getOptionLabel={(option) => {
                                  return `${option[2]} (${option[1]})`;
                                }}
                                onInputChange={(event, newValue) => {console.log('input', newValue);}}
                                renderInput={(params) => <TextField {...params} label={parameter.label} variant="standard" fullWidth />}
                              />
                            )
                          })
                          }
          */}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                  <Grid container justifyContent="flex-end" sx={{pt:2}} spacing={1}>
                    <Grid item>
                      <Button variant="contained" onClick={handleSubmitCont} endIcon={<CachedIcon />}>儲存並繼續編輯</Button>
                    </Grid>
                    <Grid item>
                      <Button variant="contained" onClick={handleSubmit} endIcon={<FormatListBulletedIcon />}>儲存 (回到列表)</Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper>
                  <Typography variant="h5">標本</Typography>
          <Grid container justifyContent="flex-end"><Button size="small" variant="contained" onClick={() => {
            dispatch({type: 'SET_DIALOG_NEW', name: 'units'});
          }}>新增</Button></Grid>
                  {data.units.map((unit, i) => {
                    return (
                      <Card sx={{ my: 1.5 }} key={i}>
                        {(unit.image_url) ?
                         <Link href={unit.image_url.replace('_s.jpg', '_l.jpg')} rel="noopener" target="_blank">
                           <CardMedia
                             component="img"
                             image={unit.image_url.replace('_s.jpg', '_m.jpg')}
                           />
                         </Link> : null }
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="div">
                            館號: {unit.accession_number}
                          </Typography>
                          <Typography variant="subtitle1" color="text.primary">
                            物候
                          </Typography>
                          <TableContainer component="div">
                            <Table aria-label="simple table" size="small" padding="none">
                              <TableBody>
                                {unit.measurement_or_facts.map((x, xid) => {
                                  return (
                                    <TableRow
                                      key={xid}
                                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                      <TableCell component="th" scope="row">
                                        {x.label}
                                      </TableCell>
                                      <TableCell>{ x.value?.value_en } {( x.value && x.value.value_en && x.value.value ) ? <Typography variant="body2" color="text.secondary">{ `(${x.value.value})` }</Typography> : null }</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <Typography>壓製日期: {formatDate(unit.preparation_date)}</Typography>
                          {/* by List
                          <Box sx={{ width: '100%' }}>
                            <List dense={true}>
                              {unit.measurement_or_facts.map((x, xid) => {
                                let display_value = '';
                                if (x.value !== null) {
                                  if (x.value.value_en != null) {
                                    display_value = x.value.value_en;
                                  }
                                  if (x.value.value !== null) {
                                    display_value = `${display_value} (${x.value.value})`;
                                  }
                                }
                                return (
                                  <ListItem key={xid}>
                                    <ListItemText primary={`${x.label}: ${display_value}`} secondary={ null } />
                                  </ListItem>
                                );
                              })}
                            </List>
                            </Box>*/}
                        </CardContent>
                        <CardActions>
                          <Button size="small" variant="outlined" onClick={() => {
                            dispatch({type: 'SET_HELPER', name: 'unitsIndex', value: i})}}>編輯</Button>
                        </CardActions>
                      </Card>
                    )})}
                </Paper>
              </Grid>
            </Grid>
          </>
         )}
    </>
  )
}

export { CollectionForm }
