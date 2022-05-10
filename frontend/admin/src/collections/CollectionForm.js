import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import MuiPaper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import ListItemAvatar from '@mui/material/ListItemAvatar';
// import Avatar from '@mui/material/Avatar';
// import StraightenIcon from '@mui/icons-material/Straighten';

// import DatePicker from '@mui/x-date-pickers/DatePicker'; import error ?
import { DatePicker } from '@mui/x-date-pickers';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

import {
  useParams,
} from "react-router-dom";

/*
import {
  IdentificationFormDialog
} from './IdentificationFormDialog';
*/
import {
  getOne,
  getList,
  convertDDToDMS,
  convertDMSToDD,
} from '../Utils';

const DMS_MAP = {
  direction: 0,
  degree: 2,
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
      loading: false,
      data: action.data,
      helpers: action.helpers,
      error: ''
    }
  case 'GET_ONE_ERROR':
    return {
      loading: false,
      error: action.error,
    }
  case 'SET_DATA':
    console.log('set data', action);
    if (action.name.indexOf('__') === -1) {
      return {
        ...state,
        data: {
          ...state.data,
          [action.name]: action.value
        }
      }
    } else {
      const k = action.name.split('__');
      state.data[k[0]][parseInt(k[1], 10)].value = action.value;
      return {
        ...state,
        data: {
          ...state.data,
        }
      }
    }
  case 'SET_LIST_DATA':{
    let tmpList = state.data[action.list];
    tmpList[action.index][action.name] = action.value;
    return {
      ...state,
      data: {
        ...state.data,
        [action.list]: tmpList,
      }
    }
  }
  case 'SET_HELPER':
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
  default:
    throw new Error();
  }
}
const CollectionForm = () => {
  let params = useParams();
  const initialArg = {
    loading: true,
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
        let taxa = [];
        /*
        for (const i=0; i< data.identifications.length; i++) {
          taxa.push([data.iddentifications[i].taxon]);
          }*/

        /*
        const namedAreas = json.named_areas.reduce( (p, v) => {
          return {
            ...p, [`namedArea__${v.name}__Select`]: {
              options: (v.value) ? [v.value] : [] ,
              input: v.value.display_name
            }
          }}, {});
        */
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

        const initialHelpers = {
          collectorSelect: {
            input: json.collector.display_name,
            options: [json.collector],
          },
          identificationIndex: -1,
          identifications: identifications,
          unitIndex: -1,
          /*...namedAreas,*/
        }
        dispatch({type: 'GET_ONE_SUCCESS', data: json, helpers: initialHelpers});
      })
      .catch(error => {
        dispatch({type: 'GET_ONE_ERROR', error: error});
      });

    }, []);

  const handleChangeByID = (event) => {
    dispatch({
      type: 'SET_DATA',
      name: event.target.id,
      value: event.target.value
    })
  }

    /*
  const handleAutocompleteChange = (event, name) => {
    const params = {
      filter: {
        q: event.target.value
      }
    }
    if (name === 'collector') {
      getList('people', params)
        .then(({json}) => {
          if ((json.data.find((x) => x.id === state.data.collector.id)) === undefined) {
            json.data.push(state.data.collector);
            //setAllOptions({...allOptions, collector: json.data});
            dispatch({type: 'SET_OPTION', name: 'collector', choices: json.data})
          }
        });
    } else if (name === 'taxon') {
      getList('taxa', params)
        .then(({json}) => {
          const d = data.identifications[identificationFlag];
          if ((json.data.find((x) => x.id === d.id)) === undefined) {
            json.data.push(d);
            //setTaxonOptions(json.data);
            //let taxa = options.taxa;
            //setOptions({...data, taxa: taxa});
          }
        });
    }
  }

  const handleTaxonChange = (event) => {
    const params = {
      filter: {
        q: event.target.value
      }
    }
    getList('taxa', params)
      .then(({json}) => {
        setTaxonOptions(json.data);
        //console.log(json);
      })
  }

  const handleNamedAreaChange = (event, area_class_id) => {
    const params = {
      filter: {
        q: event.target.value,
        area_class_id: area_class_id,
      }
    }
    const namedAreaKey = NAMED_AREA_MAP[area_class_id];

    getList('named_areas', params)
      .then(({json}) => {
        setNamedAreaOptions((ps) => ({...ps, [namedAreaKey]: json.data}));
      });
  }
  */
  const handleChange = (event, set_name=null, set_value=null) => {
    console.log(event, set_name, set_value);

    if (event === null) {
      return
    }
    console.log('handleChange', event.target.id, event.target.value, set_name);
    const name = (set_name === null && event) ? (event.target.id) ? event.target.id : '' : set_name;
    const value = (set_value === null && event) ? (event.target.value) ? event.target.value : '' : set_value;
    const regex = /(longitude|latitude)_(direction|degree|minute|second)/g;
    console.log(name, value, 'xxx');
    switch(name) {
    case 'collector_options':
      const params = {filter: {q: value}};
      getList('people', params)
        .then(({json}) => {
          if ((json.data.find((x) => x.id === state.data.collector.id)) === undefined) {
            json.data.push(state.data.collector);
            dispatch({type: 'SET_SELECT', name: 'collectorSelect', options: json.data, input: value})
          }
        });
      break;
    default:
      if (name !== '') {
        console.log('set_data', name, value);
        dispatch({type: 'SET_DATA', name: name, value: value});
      }
      break;
    }

    /*
    const match = regex.exec(key);
    // console.log(key, value, '----', match, event);
    if (key === 'longitude_decimal') {
      const dms_lon = convertDDToDMS(value);
      setData((ps) => ({
        ...ps,
        longitude_direction: dms_lon[0],
        longitude_degree: dms_lon[1].toString(),
        longitude_minute: dms_lon[2].toString(),
        longitude_second: dms_lon[3].toString(),
        longitude_decimal: value,
      }));
    } else if (key === 'latitude_decimal') {
      const dms_lat = convertDDToDMS(value);
      setData((ps) => ({
        ...ps,
        latitude_direction: dms_lat[0],
        latitude_degree: dms_lat[1].toString(),
        latitude_minute: dms_lat[2].toString(),
        latitude_second: dms_lat[3].toString(),
        latitude_decimal: value,
      }));
    } else if (match) {
      console.log(match[2] !== 'direction' , parseInt(value) >=60 , parseInt(value) <= -1, 'xxxx');
      // validate
      if (match[2] !== 'direction' && (
        parseInt(value) >=60 || parseInt(value) <= -1)) {
        return
      }

      if (match[1] === 'longitude') {
        let dms = [
          data.longitude_direction,
          data.longitude_degree,
          data.longitude_minute,
          data.longitude_second
        ];
        const index = DMS_MAP[match[2]];
        dms[index] = value;
        const lon_dd = convertDMSToDD(dms);
        setData((ps) => ({
          ...ps,
          longitude_decimal: lon_dd,
          [key]: value,
        }));
      } else if (match[1] === 'latitude') {
        let dms = [
          data.latitude_direction,
          data.latitude_degree,
          data.latitude_minute,
          data.latitude_second
        ];
        const index = DMS_MAP[match[2]];
        dms[index] = value;
        const lat_dd = convertDMSToDD(dms);
        setData((ps) => ({
          ...ps,
          latitude_decimal: lat_dd,
          [key]: value,
        }));
      }
    } else {
      //setData((ps) => ({...ps, [event.target.id]: event.target.value}));
      dispatch({type: 'SET_DATA', name: key, value: value});
    }
*/
  }
  console.log('🦚 state', state);

  const {data, helpers} = state;

  return (
    <>
      {state.loading === true ? 'Loading...'
       : (state.error !== '' ? `⛔ ${state.error}`
          :
          <>
            {(helpers.identificationIndex >= 0) ?
             <Dialog open={(helpers.identificationIndex >= 0) ? true : false} onClose={() => {dispatch({'type': 'SET_HELPER', name: 'identificationIndex', value: -1});}}>
               <DialogTitle>鑑定記錄 - {data.identifications[helpers.identificationIndex].sequence+1}</DialogTitle>
               <DialogContent>
                 <DialogContentText>
                 </DialogContentText>
                 <Grid container spacing={2}>
                   <Grid item xs={12}>
                     <Autocomplete
                       id="taxon"
                       options={helpers.identifications[helpers.identificationIndex].taxonSelect.options}
                       isOptionEqualToValue={(option, value) => option.id === value.id}
                       getOptionLabel={(option) => option.display_name}
                       value={data.identifications[helpers.identificationIndex].taxon}
                       onChange={(e, v, reason) => {
                         dispatch({type: 'SET_LIST_DATA', name: 'taxon', value: v, list:'identifications', index: helpers.identificationIndex});
                       }}
                       onInputChange={(e, v, reason) => {
                         // console.log('ON INPUT', reason, v, data.collector);
                         getList('taxa', { filter: { q: v } })
                           .then(({json}) => {
                             const value = data.identifications[helpers.identificationIndex].taxon;
                             if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                               json.data.push(value);
                             }
                             dispatch({type: 'SET_HELPER', name: `identifications__${helpers.identificationIndex}__taxonSelect`, options: json.data, input: v});
                           });
                       }}
                       inputValue={helpers.identifications[helpers.identificationIndex].taxonSelect.input}
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
                       options={helpers.identifications[helpers.identificationIndex].identifierSelect.options}
                       isOptionEqualToValue={(option, value) => option.id === value.id}
                       getOptionLabel={(option) => option.display_name}
                       value={data.identifications[helpers.identificationIndex].identifier}
                       onChange={(e, v, reason) => {
                         dispatch({type: 'SET_LIST_DATA', name: 'identifier', value: v, list:'identifications', index: helpers.identificationIndex});
                       }}
                       onInputChange={(e, v, reason) => {
                         // console.log('ON INPUT', reason, v, data.collector);
                         getList('people', { filter: { q: v } })
                           .then(({json}) => {
                             const value = data.identifications[helpers.identificationIndex].identifier;
                             if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                               json.data.push(value);
                             }
                             dispatch({type: 'SET_HELPER', name: `identifications__${helpers.identificationIndex}__identifierSelect`, options: json.data, input: v});
                           });
                       }}
                       inputValue={helpers.identifications[helpers.identificationIndex].identifierSelect.input}
                       renderInput={(params) => (
                          <TextField
                            {...params}
                            label="鑑定者"
                            variant="standard"/>)}
                     />
                   </Grid>
                   <Grid item xs={6}>
                     <DatePicker
                       disableFuture
                       label="鑑定日期"
                       openTo="year"
                       clearable={true}
                       views={['year', 'month', 'day']}
                       value={data.identifications[helpers.identificationIndex].date}
                       inputFormat="yyyy-MM-dd"
                       mask='____-__-__'
                       onChange={(selectDate, input)=> {
                         if (input) {
                           try {
                             const _ = new Date(input).toISOString();
                             dispatch({type: 'SET_DATA', name: 'collect_date', value: input});
                           } catch (error) {
                             console.error(error);
                           }
                          } else if (selectDate) {
                            const y = selectDate.getFullYear();
                            const m = String(selectDate.getMonth()+1).padStart(2, '0');
                            const d = String(selectDate.getDate()).padStart(2, '0');
                            dispatch({type: 'SET_LIST_DATA', name: 'date', value: `${y}-${m}-${d}`, list:'identifications', index: helpers.identificationIndex});
                          }
                       }}
                       renderInput={(params) => <TextField {...params} variant="standard" fullWidth />}
                     />
                   </Grid>
                   <Grid item xs={6}>
                     <TextField
                       id="verbatim-identification-date"
                       label="日期格式不完整"
                       fullWidth
                       variant="standard"
                       value={data.units[helpers.identificationIndex].date_text}
                       onChange={(e)=> {
                         dispatch({type: 'SET_LIST_DATA', name: 'date_text', value: e.target.value, list:'identifications', index: helpers.identificationIndex});
                       }}
                     />
                   </Grid>
                 </Grid>
               </DialogContent>
               <DialogActions>
                 <Button onClick={() => {dispatch({'type': 'SET_HELPER', name: 'identificationIndex', value: -1});}}>取消</Button>
                 <Button variant="contained">送出</Button>
               </DialogActions>
             </Dialog> : null}
            {(helpers.unitIndex >= 0) ?
             <Dialog open={(helpers.unitIndex >= 0) ? true : false} onClose={() => {dispatch({'type': 'SET_HELPER', name: 'unitIndex', value: -1});}}>
               <DialogTitle>標本記錄 - {data.units[helpers.unitIndex].accession_number}</DialogTitle>
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
                       value={data.units[helpers.unitIndex].accession_number}
                       onChange={(e)=> {
                         dispatch({type: 'SET_LIST_DATA', name: 'accession_number', value: e.target.value, list:'units', index: helpers.unitIndex});
                       }}
                     />
                   </Grid>
                 </Grid>
               </DialogContent>
               <DialogActions>
                 <Button onClick={() => {dispatch({'type': 'SET_HELPER', name: 'unitIndex', value: -1});}}>取消</Button>
                 <Button variant="contained">送出</Button>
               </DialogActions>
             </Dialog> : null}
            <Typography variant="h4">Collection</Typography>
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
                        getOptionLabel={(option) => option.display_name}
                        value={data.collector}
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
                        value={data.collect_date}
                        inputFormat="yyyy-MM-dd"
                        mask='____-__-__'
                        onChange={(selectDate, input)=> {
                          // console.log(selectDate, input, 'ee');
                          if (input) {
                            try {
                              const _ = new Date(input).toISOString();
                              dispatch({type: 'SET_DATA', name: 'collect_date', value: input});
                            } catch (error) {
                              console.error(error);
                            }
                          } else if (selectDate) {
                            const y = selectDate.getFullYear();
                            const m = String(selectDate.getMonth()+1).padStart(2, '0');
                            const d = String(selectDate.getDate()).padStart(2, '0');
                            dispatch({type: 'SET_DATA', name: 'collect_date', value: `${y}-${m}-${d}`});
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
                        value={data.companion_text}
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
                        value={data.companion_text_en}
                        onChange={handleChangeByID}
                      />
                    </Grid>
                    <Grid item xs={12}><Typography variant="h6">地點</Typography></Grid>
                    {data.named_areas.map((named_area, i)=> {
                      const areaName = `namedArea__${named_area.name}`;
                      return (
                        <Grid item xs={6} key={i}>
                          <Autocomplete
                            id={areaName}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.display_name || ''}
                            filterOptions={(options, {inputValue}) => {
                              if (i > 0 && data.named_areas[i-1].value) {
                                const parentId = data.named_areas[i-1].value.id;
                                return options.filter((x) => (x.parent_id === parentId) && (x.display_name.toLowerCase().indexOf(inputValue.toLowerCase()) >=0) );
                              } else {
                                return options;
                              }
                            }}
                            /*options={helpers[`${areaName}__Select`].options}*/
                            options={data.form_options.named_areas[named_area.name]}
                            value={data.named_areas[i].value || null}
                            onChange={(e, v, reason) => {
                              //console.log('ON CHANGE', reason, v);
                              dispatch({type: 'SET_DATA', name: `named_areas__${i}`, value: v, });
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
                  </Grid>
                  <Grid item xs={12}><Typography variant="h6">鑑定 & 環境</Typography></Grid>
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
                        <TableContainer component={Paper}>
                          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell>鑑定次數</TableCell>
                                <TableCell>學名</TableCell>
                                <TableCell>鑑訂者</TableCell>
                                <TableCell>鑑訂日期</TableCell>
                                <TableCell>編輯</TableCell>
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
                                    <TableCell align="right">{(row.date_text) ? row.date_text : (row.date || '')}</TableCell>
                                    <TableCell align="right"><Button variant="outlined" onClick={() => {
                                      dispatch({type: 'SET_HELPER', name: 'identificationIndex', value: index});
                                    }}>編輯</Button></TableCell>
                                  </TableRow>
                                )})}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
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
                            //console.log(biotope.name, data.form_options.biotopes[biotope.name], biotope);
                            //console.log(biotope.value);
                            return (
                              <Autocomplete
                                key={i}
                                id={biotope.name}
                                isOptionEqualToValue={(option, value) => option.id === value.option_id}
                                getOptionLabel={(option) => `${option.value_en} (${option.value})` || ''}
                                options={data.form_options.biotopes[biotope.name]}
                                value={(biotope.value && biotope.value.option_id) ? biotope.value : null }
                                onChange={(e, v, reason) => {
                                  //console.log('ON CHANGE', reason, v);
                                  //dispatch({type: 'SET_DATA', name: `named_areas__${i}`, value: v, });
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={`${biotope.label}`}
                                    variant="standard"
                                  />)}
                              />)
                          })}
                          {/*
                          {biotopeOptions.map((parameter) => {
                            const key = `biotope__${parameter.name}`;
                            const optionValue = (data.hasOwnProperty(key)) ? data[key] : null;
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
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper>
                  <Typography variant="h5">標本</Typography>
                  {data.units.map((unit, i) => {
                    const mofList = unit.measurement_or_facts.map((x)=> x.value_en);
                    return (
                      <Card sx={{ my: 1.5 }} key={i}>
                        <CardMedia
                          component="img"
                          image={unit.image_url.replace('_s.jpg', '_m.jpg')}
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="div">
                            館號: {unit.accession_number}
                          </Typography>
                          <Typography variant="subtitle1" color="text.primary">
                            物候
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {mofList.join(' | ')}
                          </Typography>
                          <Typography variant="subtitle1" color="text.primary">
                            Transaction
                          </Typography>
                        </CardContent>
                        <CardActions>
                      <Button size="small" variant="contained" onClick={() => {
                        dispatch({type: 'SET_HELPER', name: 'unitIndex', value: i})}}>編輯</Button>
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
