import React, {useEffect, useState} from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
// for search
import TextField from '@mui/material/TextField';

import { styled } from '@mui/material/styles';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';

import {
  Link as RouterLink,
} from "react-router-dom";

import { getList } from '../Utils';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 50,
  },
  {
    field: 'last_taxon_text',
    headerName: '學名/中文名',
    minWidth: 350,
  },
  {
    field: 'display_name',
    headerName: '採集者',
    // description': 'Collector'
    // width, minWidth, valueGetter, renderCell
    minWidth: 200,
  },
  {
    field: 'field_number',
    headerName: '採集號',
  },
  {
    field: 'collect_date',
    headerName: '採集日期',
  },
  {
    field: 'units',
    headerName: '標本/館號',
    renderCell: (params) => {
      const specimens = params.value.map((x, i) => (
        <Grid container alignItems="center" columnSpacing={1} key={i}>
          <Grid item>
            <img src={x.image_url} height="50" style={{objectFit: 'contain'}}/>
          </Grid>
          <Grid item>
            <Typography variant='body2'>{x.accession_number}</Typography>
          </Grid>
        </Grid>
      ));
      return (
        <>
          {specimens}
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginLeft: 16 }}
            component={RouterLink}
            to={`/collections/${params.row.id}`}
          >
            Edit
        </Button>
        </>)
    },
    minWidth: 200,
  },
];


const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  '& .ant-empty-img-1': {
    fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
  },
  '& .ant-empty-img-2': {
    fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
  },
  '& .ant-empty-img-3': {
    fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
  },
  '& .ant-empty-img-4': {
    fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
  },
  '& .ant-empty-img-5': {
    fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
    fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
  },
}));

function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <svg
        width="120"
        height="100"
        viewBox="0 0 184 152"
        aria-hidden
        focusable="false"
      >
        <g fill="none" fillRule="evenodd">
          <g transform="translate(24 31.67)">
            <ellipse
              className="ant-empty-img-5"
              cx="67.797"
              cy="106.89"
              rx="67.797"
              ry="12.668"
            />
            <path
              className="ant-empty-img-1"
              d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
            />
            <path
              className="ant-empty-img-2"
              d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
            />
            <path
              className="ant-empty-img-3"
              d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
            />
          </g>
          <path
            className="ant-empty-img-3"
            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
          />
          <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
          </g>
        </g>
      </svg>
      <Box sx={{ mt: 1 }}>No Rows</Box>
    </StyledGridOverlay>
  );
}

const CollectionList = () => {
  const [result, setResult] = useState(null);
  const [rowsState, setRowsState] = useState({
    isLoading: false,
    pageSize: 20,
    pageIndex: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (props) => {
    // console.log('fetchData', props);
    let params = {};
    const pageIndex = (props && props.hasOwnProperty('pageIndex')) ? props['pageIndex']: rowsState['pageIndex'];
    const pageSize = (props && props.hasOwnProperty('pageSize')) ? props['pageSize'] : rowsState['pageSize'];
    if (props) {
      if (props.hasOwnProperty('pageSize')) {
        params['range'] = [0, pageSize];
      } else if (props.hasOwnProperty('pageIndex')) {
        params['range'] = [(pageIndex) * pageSize, (pageIndex + 1) * pageSize];
      }
    }
    // re-count total only if filter change
    if (result && result['total'] >= 0) {
      params['total'] = result['total'];
    }
    getList('collections', params)
      .then(({ json }) => {
        console.log('getList', json);
        setResult(json);
        setRowsState({
          isLoading: false,
          pageIndex: pageIndex,
          pageSize: pageSize,
        });
      });
  }

  const handlePageChange = (pageIndex) => {
    setRowsState((ps) => ({
      ...ps,
      isLoading: true
    }))
    fetchData({pageIndex:pageIndex});
  }
  const handlePageSizeChange = (pageSize) => {
    setRowsState((ps) => ({
      ...ps,
      isLoading: true
    }))
    fetchData({pageIndex:0, pageSize: pageSize});
  }

  return (
    <div style={{ height: 550, width: '100%' }}>
      {(result !== null) ?
       <>
         <Typography>{`query elapsed: ${result.elapsed.toFixed(2)} secs`}</Typography>
         <DataGrid
           loading={rowsState.isLoading}
           components={{
             Toolbar: CustomToolbar,
             LoadingOverlay: LinearProgress,
             NoRowsOverlay: CustomNoRowsOverlay,
           }}
           columns={columns}
           rows={result.data}
           rowCount={result.total}
           pagination
           pageSize={rowsState.pageSize}
           rowsPerPageOptions={[20, 50, 100]}
           paginationMode='server'
           onPageChange={(page) => handlePageChange(page)}
           onPageSizeChange={(pageSize) => handlePageSizeChange(pageSize)}
         /></> : 'loading...'}
    </div>
  )
}

export { CollectionList }
