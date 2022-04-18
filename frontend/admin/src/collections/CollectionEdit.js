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
// import DatePicker from '@mui/x-date-pickers/DatePicker'; import error ?
import { DatePicker } from '@mui/x-date-pickers';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

import {
  useParams,
} from "react-router-dom";

import {
  getOne,
  getList,
  convertDDToDMS,
  convertDMSToDD,
} from '../Utils';

  const NAMED_AREA_MAP = {
    1: 'country',
    2: 'stateProvince',
    4: 'county',
    3: 'municipality',
    5: 'national_park',
    6: 'locality',
  };

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

const CollectionEdit = () => {
  let params = useParams();
  const [data, setData] = React.useState(null);
  const [collectorOptions, setCollectorOptions] = React.useState([]);
  const [namedAreaOptions, setNamedAreaOptions] = React.useState({
    country:[],
    stateProvince: [],
    municipality: [],
    county: [],
    national_park: [],
    locality: [],
  });

  React.useEffect(() => {
    getOne('collections', params.collectionId)
      .then(({ json }) => {
        console.log('getOne', json);
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
        setData(json);
        setCollectorOptions([json.collector]);
        setNamedAreaOptions({
          country: [json.named_areas.country.value,],
        });
      });
    }, []);

  const handleCollectorChange = (event) => {
    const params = {
      filter: {
        q: event.target.value
      }
    }
    getList('people', params)
      .then(({json}) => {
        setCollectorOptions(json.data);
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

  const handleChange = (event) => {
    // console.log(event.target.value, event.target.id);
    const key = event.target.id;
    const value = event.target.value;
    const regex = /(longitude|latitude)_(direction|degree|minute|second)/g;
    const match = regex.exec(key);
    // console.log(key, value, '----', match, event);
    if (key === 'longitude_decimal') {
      const dms_lon = convertDDToDMS(value);
      console.log(dms_lon, 'xx')
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
      setData((ps) => ({...ps, [event.target.id]: event.target.value}));
    }
  }

  return (
    <>
      {(data !== null) ?
       <>
         <Typography variant="h4">Collection</Typography>
         <Grid container spacing={2}>
           <Grid item xs={9}>
             <Paper elevation={0}>
               <Grid container rowSpacing={2} columnSpacing={2}>
                 <Grid item xs={12}><Typography variant="h5">採集事件</Typography></Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="collector"
                     options={collectorOptions}
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name}
                     value={data.collector}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="採集者"
                         onChange={handleCollectorChange}
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
                     onChange={handleChange}
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
                     onChange={handleChange}
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
                     onChange={handleChange}
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
                     onChange={handleChange}
                   />
                 </Grid>
                 {/*<Grid item xs={12}><Typography variant="h6">地點</Typography></Grid>*/}
                 <Grid item xs={6}>
                   <Autocomplete
                     id="named_area__country"
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name || ''}
                     options={namedAreaOptions.country || []}
                     value={data.named_areas.country.value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="國家"
                         variant="standard"
                         onChange={(e) => handleNamedAreaChange(e, 1)}
                       />)}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="named_area__stateProvince"
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name || ''}
                     options={namedAreaOptions.stateProvince || []}
                     value={data.named_areas.stateProvince.value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="省/州"
                         variant="standard"
                         onChange={(e) => handleNamedAreaChange(e, 2)}
                       />)}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="named_area__county"
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name || ''}
                     options={namedAreaOptions.county || []}
                     value={data.named_areas.county.value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="縣市"
                         variant="standard"
                         onChange={(e) => handleNamedAreaChange(e, 4)}
                       />)}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="named_area__municipality"
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name || ''}
                     options={namedAreaOptions.municipality || []}
                     value={data.named_areas.municipality.value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="鄉鎮"
                         variant="standard"
                         onChange={(e) => handleNamedAreaChange(e, 3)}
                       />)}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="named_area__national_park"
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name || ''}
                     options={namedAreaOptions.national_park || []}
                     value={data.named_areas.national_park.value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="國家公園"
                         variant="standard"
                         onChange={(e) => handleNamedAreaChange(e, 5)}
                       />)}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="named_area__locality"
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name || ''}
                     options={namedAreaOptions.locality || []}
                     value={data.named_areas.locality.value}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="地名"
                         variant="standard"
                         onChange={(e) => handleNamedAreaChange(e, 6)}
                       />)}
                   />
                 </Grid>
                 <Grid item xs={12}>
                   <TextField
                     id="locality_text"
                     variant="standard"
                     label="地點描述"
                     multiline
                     fullWidth
                     rows={3}
                     value={data.locality_text}
                     onChange={handleChange}
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <TextField
                     id="altitude"
                     variant="standard"
                     label="海拔"
                     fullWidth
                     value={data.altitude || ''}
                     onChange={handleChange}
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <TextField
                     id="altitude2"
                     variant="standard"
                     label="海拔2"
                     fullWidth
                     value={data.altitude2 || ''}
                     onChange={handleChange}
                   />
                 </Grid>
                 <Grid item xs={8}>
                 </Grid>
                 <Grid item xs={3}>
                   <TextField
                     id="longitude_decimal"
                     variant="standard"
                     label="經度(十進位)"
                     fullWidth
                     value={data.longitude_decimal || ''}
                     onChange={handleChange}
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <FormControl fullWidth>
                     <InputLabel id="longitude_direction-label">東西經</InputLabel>
                     <Select
                       labelId="longitude_direction-label"
                       id="longitude_direction"
                       value={data.longitude_direction}
                       label="東西經"



                       
                       onChange={handleChange}
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
                     value={data.longitude_degree || ''}
                     onChange={handleChange}
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
                     type="number"
                     value={data.longitude_minute || ''}
                     onChange={handleChange}
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
                     type="number"
                     value={data.longitude_second || ''}
                     onChange={handleChange}
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
                     onChange={handleChange}
                     value={data.latitude_decimal || ''}
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <FormControl fullWidth>
                     <InputLabel id="demo-simple-select-label">緯度</InputLabel>
                     <Select
                       labelId="demo-simple-select-label"
                       id="latitude_direction"
                       value={data.latitude_direction}
                       label="緯度"
                       onChange={handleChange}
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
                     value={data.latitude_degree || ''}
                     onChange={handleChange}
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
                     value={data.latitude_minute || ''}
                     type="number"
                     onChange={handleChange}
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
                     type="number"
                     value={data.latitude_second || ''}
                     onChange={handleChange}
                     InputProps={{
                       endAdornment: <InputAdornment position="end">"</InputAdornment>,
                     }}
                   />
                 </Grid>
                 <Grid item xs={6}>
                 </Grid>
                 <Grid item xs={12}>
                 </Grid>
               </Grid>
               <Grid item xs={12}><Typography variant="h6">other</Typography></Grid>
               <Grid item xs={12}>
       <Accordion>
           <AccordionSummary
             expandIcon={<ExpandMoreIcon />}
             aria-controls="panel2a-content"
             id="panel2a-header"
           >
             <Typography>鑑定</Typography>
           </AccordionSummary>
           <AccordionDetails>
             <Typography>

             </Typography>
           </AccordionDetails>
       </Accordion>
       </Grid>
      </Paper>
       </Grid>
           <Grid item xs={3}>
             <Paper>
               img
         </Paper>
         </Grid>
         </Grid>
       </>
     : <Typography>Loading...</Typography> }
    </>
  )
}

export { CollectionEdit }

/*
         <Grid container>
           <Grid item sx={}></Grid>
           <Grid item>{data.collect_date}</Grid>
                </Grid>
*/
