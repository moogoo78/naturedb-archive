import React  from 'react';

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';

const CollectionListToolbar = ({dispatch, state}) => {
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
      >篩選條件</Button>
      <Menu
        id="filter-menu"
        anchorEl={state.filterMenuAnchorEl}
        open={open}
        onClose={()=> dispatch({type: 'CLOSE_FILTER_MENU'}) }
        MenuListProps={{
          'aria-labelledby': 'filter-button',
        }}
      >
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'accession_number'})}>館號</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'collector'})}>採集者</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'field_number'})}>採集號</MenuItem>
        <MenuItem onClick={()=> dispatch({type: 'ADD_FILTER', item: 'collect_date'})}>採集日期</MenuItem>
      </Menu>
    </>
  )
}

export { CollectionListToolbar }
