import React from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const DialogButtonToolbar = ({status, hasId, onDelete, onDeleteYes, onDeleteNo, onCancel, onSubmit}) => {
  switch (status) {
  case 'init':
    return (
      <>
        {(hasId) ? <Grid container justifyContent="flex-start"><Button variant="contained" color="error" onClick={onDelete}>刪除</Button></Grid> : null}
        <Button onClick={onCancel}>取消</Button>
        <Button variant="contained" onClick={onSubmit}>送出</Button>
      </>);
  case 'clicked':
    return (
      <>
        <Typography sx={{p:1}}>確定要刪除?</Typography>
        <Button variant="outlined" onClick={onDeleteNo}>取消</Button>
        <Button variant="contained" onClick={onDeleteYes}>是</Button>
      </>
    );
  default:
      throw new Error('Unknown');
  }
}

export {
  DialogButtonToolbar
}
