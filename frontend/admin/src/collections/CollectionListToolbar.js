import React  from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers';
import FilterListIcon from '@mui/icons-material/FilterList';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PrintIcon from '@mui/icons-material/Print';
import TextField from '@mui/material/TextField';

import {
  getList,
} from '../Utils';

const BASE_URL = process.env.BASE_URL;

const CollectionListFilterMenu = ({dispatch, state}) => {
  const open = Boolean(state.filterMenuAnchorEl);
  return (
    <>
      <Button
        id="filter-button"
        aria-controls={open ? 'filter-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(e)=> {
          dispatch({type: 'OPEN_FILTER_MENU', anchor: e.currentTarget})
        } }
        startIcon={<FilterListIcon />}
        variant=""
      >加入篩選條件</Button>
      <Menu
        id="filter-menu"
        anchorEl={state.filterMenuAnchorEl}
        open={open}
        onClose={()=> dispatch({type: 'CLOSE_FILTER_MENU'}) }
        meunlistprops={{
          'aria-labelledby': 'filter-button',
        }}
      >
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'taxon'})}>學名/中文名</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'accession_number'})}>館號</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'collector'})}>採集者</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'field_number'})}>採集號</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'collect_date'})}>採集日期</MenuItem>
      </Menu>
      <Button
        onClick={(e)=> {
          const ids = state.selection.join(',');
          window.open(`${BASE_URL}/print-label?ids=${ids}`, '_blank');
        }}
        startIcon={<PrintIcon />}
        variant=""
      >列印</Button>
    </>
  )
}

/**
 * options: [name]: [options, input]
 * data: [key, value]
 */
const CollectionListFilterBox = ({dispatch, index, data, options}) => {
  switch (data[0]) {
    case 'accession_number':
  return (
    <TextField
      label="館號"
      variant="filled"
      value={data[1] || ''}
      onChange={(e) => {
        dispatch({type:'SET_FILTER', name:'accession_number' , value:e.target.value, index: index});
      }}/>);
  case 'collector':
    return (
      <Autocomplete
        options={options.collector[0] || []}
        isOptionEqualToValue={(option, value) => option.id === value.id }
        getOptionLabel={(option) => (option && option.display_name ) ? option.display_name : ''}
        value={(data[1])}
        onChange={(e, v, reason) => {
          // console.log('ON CHANGE', reason, v);
          dispatch({type: 'SET_FILTER', index: index, value: v});
        }}
        onInputChange={(e, v, reason) => {
          // console.log('ON INPUT', reason, v, data.collector);
          console.log('input', reason);
          if (reason === 'input') {
            getList('people', { filter: { q: v } })
              .then(({json}) => {
                //const value = lector;
                //if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                //json.data.push(value);
                //}
                dispatch({type: 'SET_OPTION', name: 'collector', options: json.data, input: v} );
              });
          }
        }}
      //inputValue={state.collectorInput || ''}
        renderInput={(params) => (
          <TextField
            {...params}
            label="採集者"
            variant="filled"/>)}
      />);
  case 'field_number':
    return (
      <TextField
        label="採集號"
        variant="filled"
        value={data[1] || ''}
        onChange={(e) => {
          dispatch({type:'SET_FILTER', name:'field_number' , value:e.target.value, index: index});
        }}/>);
  case 'taxon':
    return (
      <Autocomplete
        options={options.taxon[0] || []}
        isOptionEqualToValue={(option, value) => option.id === value.id }
        getOptionLabel={(option) => (option && option.display_name ) ? option.display_name : ''}
        value={(data[1])}
        onChange={(e, v, reason) => {
          // console.log('ON CHANGE', reason, v);
          dispatch({type: 'SET_FILTER', index: index, value: v});
        }}
        onInputChange={(e, v, reason) => {
          // console.log('ON INPUT', reason, v, data.collector);
          console.log('input', reason);
          if (reason === 'input') {
            getList('taxa', { filter: { q: v } })
              .then(({json}) => {
                //const value = lector;
                //if (value && (json.data.find((x) => x.id === value.id)) === undefined) {
                //json.data.push(value);
                //}
                dispatch({type: 'SET_OPTION', name: 'taxon', options: json.data, input: v} );
              });
          }
        }}
      //inputValue={state.collectorInput || ''}
        renderInput={(params) => (
          <TextField
            {...params}
            label="學名/中文名"
            variant="filled"/>)}
      />);
  case 'collect_date':
    return (
      <>
      <Grid container spacing={1}>
      <Grid item>
      <DatePicker
        disableFuture
        label="採集日期"
        openTo="year"
        clearable={true}
        views={['year', 'month', 'day']}
        value={(data[1]) ? data[1][0]: null}
        inputFormat="yyyy-MM-dd"
        mask='____-__-__'
        onChange={(selectDate, input)=> {
          if (!isNaN(selectDate)) {
            dispatch({type: 'SET_FILTER_DATE_RANGE', index: index, value: selectDate, isRangeStart: true});
          } else {
            console.log('collect_date: invalid Date', selectDate, input);
          }
        }}
        renderInput={(params) => <TextField {...params} variant="standard"/>}
      /> </Grid>
              <Grid item>
      <DatePicker
        disableFuture
        label="採集日期2"
        openTo="year"
        clearable={true}
        views={['year', 'month', 'day']}
        value={(data[1]) ? data[1][1]: null}
        inputFormat="yyyy-MM-dd"
        mask='____-__-__'
        onChange={(selectDate, input)=> {
          if (!isNaN(selectDate)) {
            if (data[1] && data[1][0]) {
              // 第一個有設才可以設
              dispatch({type: 'SET_FILTER_DATE_RANGE', index: index, value: selectDate, isRangeEnd: true});
            }
          } else {
            console.log('collect_date: invalid Date', selectDate, input);
          }
        }}
        renderInput={(params) => <TextField {...params} variant="standard"/>}
        />
      </Grid>
      </Grid>
      </>
    );
  }
}

export { CollectionListFilterMenu, CollectionListFilterBox }
