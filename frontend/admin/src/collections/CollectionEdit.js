import React from 'react';

import TextField from '@mui/material/TextField';
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
} from '../Utils';

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

  React.useEffect(() => {
    getOne('collections', params.collectionId)
      .then(({ json }) => {
        console.log('getOne', json);
        setData(json);
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
  return (
    <>
      {(data !== null) ?
       <>
         <Typography variant="h4">Collection</Typography>
         <Grid container spacing={2}>
           <Grid item xs={9}>
             <Paper elevation={0}>
               <Grid container spacing={1}>
                 <Grid item xs={12}><Typography variant="h6">採集事件</Typography></Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     id="collector"
                     options={collectorOptions}
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     getOptionLabel={(option) => option.display_name}
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
                     onChange={(e) => {setData((ps) => ({...ps, field_number: e.target.value}))}}
                   />
                 </Grid>
                 <Grid item xs={3}>
                   <DatePicker
                     disableFuture
                     label="採集號"
                     openTo="year"
                     clearable={true}
                     views={['year', 'month', 'day']}
                     value={data.collect_date}
                     inputFormat="yyyy-MM-dd"
                     mask='____-__-__'
                     onChange={(value) => setData((ps) => ({...ps, collect_date: value}))}
                     renderInput={(params) => <TextField {...params} variant="standard"/>}
          />
                 </Grid>
                 <Grid item xs={12}><Typography variant="subtitle">地點</Typography></Grid>
                 <Grid item xs={6}>
                   <Autocomplete
                     disablePortal
                     id="country"
                     options={[]}
                     sx={{ width: 300 }}
                     renderInput={(params) => <TextField {...params} label="採集者" variant="standard" />}
                   />
                   <TextField
                     id="locality_country"
                     variant="standard"
                     label="國家"
                     value={""}
                     onChange={(e) => {setData((ps) => ({...ps, country: e.target.value}))}}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <TextField
                     id="locality_stateProvince"
                     variant="standard"
                     label="省份/直轄市"
                     value={""}
                     onChange={(e) => {setData((ps) => ({...ps, country: e.target.value}))}}
                   />
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
