import React, {useEffect, useState} from 'react';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import {
  useParams,
} from "react-router-dom";

import { getOne } from 'Utils';

const CollectionEdit = () => {
  let params = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    getOne('collections', params.collectionId)
      .then(({ json }) => {
        console.log('getOne', json);
        setData(json);
      });
    }, []);

  return (
    <>
      {(data !== null) ?
       <Box
         component="form"
         noValidate
         autoComplete="off"
         sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
       >
       <Box display="flex">
       <Box flex={2} mr="1em">
         <Typography variant="h5" gutterBottom>採集事件</Typography>
         <Box display="flex">
           <Box flex={2} mr="0.5em">
             <TextField
               id="collector_id"
               variant="standard"
               label="採集者"
             />
             <TextField
               id="field_number"
               variant="standard"
               label="採集號"
               value={data.field_number}
               onChange={(e) => {setData((ps) => ({...ps, field_number: e.target.value}))}}
             />
             <TextField
               id="collect_date"
               variant="standard"
               label="採集日期"
               value={data.collect_date}
               onChange={(e) => {setData((ps) => ({...ps, collect_date: e.target.value}))}}
             />
           </Box>
           <Typography variant="h5" gutterBottom>採集地點</Typography>
           <Box flex={2} mr="0.5em">
           </Box>
         </Box>
       </Box>
       </Box>
       </Box>
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
