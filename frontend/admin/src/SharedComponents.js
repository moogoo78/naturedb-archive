import React from 'react';

import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const DialogButtonToolbar = ({status, hasId, onDelete, onDeleteYes, onDeleteNo, onCancel, onSubmit}) => {
  switch (status) {
  case 'init':
    return (
      <>
        {(hasId) ? <Grid container justifyContent="flex-start"><Button variant="contained" color="error" onClick={onDelete}>刪除</Button></Grid> : null}
        <Button onClick={onCancel}>取消</Button>
        <Button variant="contained" onClick={onSubmit}>儲存</Button>
      </>);
  case 'clicked':
    return (
      <>
        <Typography sx={{p:1}}>確定要刪除?</Typography>
        <Button variant="outlined" onClick={onDeleteNo}>否</Button>
        <Button variant="contained" onClick={onDeleteYes}>是</Button>
      </>
    );
  default:
      throw new Error('Unknown');
  }
}
const AlertDisplay = ({ data, onCancel, onOk }) => {
  if ( data.isOpen ) {
    switch (data.display) {
    case 'flash':
      return (
        <Alert variant="outlined" severity="success" onClose={onCancel}>
          { data.content}
        </Alert>
      );
    case 'dialog':
      return (
        <Dialog open={data.isOpen} onClose={data.onCancel}>
          <DialogTitle>確定刪除?</DialogTitle>
          {/*
          <DialogContent>
            <DialogContentText>
              sure?
            </DialogContentText>
          </DialogContent>
           */}
          <DialogActions>
            <Button onClick={ onCancel }>取消</Button>
            <Button onClick={ onOk } autoFocus>
              刪除
            </Button>
          </DialogActions>
        </Dialog>
      );
    default:
      throw new Error('Unknown type');
    }
  } else {
    return null;
  }
}

export {
  DialogButtonToolbar,
  AlertDisplay,
}
