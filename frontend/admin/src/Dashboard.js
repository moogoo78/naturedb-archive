import * as React from "react";
//import { Card, CardContent, CardHeader, Box, Typography, Paper } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const Dashboard = () => {

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        padding: theme.spacing(1),
        margin: theme.spacing(1),
        width: theme.spacing(20),
        height: theme.spacing(6),
      },
    },
    title: {
      fontSize: 14,
    },
  }));

  const classes = useStyles();
  return (
  <>
    <Card>
      <CardHeader title="Admin Dashboard" />
      <CardContent>
        <Typography variant="h4" component="h3">Dataset Stats</Typography>
        <Typography variant="textPrimary" component="h4">HAST</Typography>
        <div className={classes.root}>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              採集號
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              標本數
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              館號
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              物種數
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
        </div>
        <Typography variant="textPrimary" component="h4">HAST: Phodophyta</Typography>
        <div className={classes.root}>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              採集號
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              標本數
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              館號
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
          <Paper elevation={2}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              物種數
            </Typography>
            <Typography variant="h5" component="h2">
              --
            </Typography>
          </Paper>
        </div>
      </CardContent>
    </Card>
  </>
  );
}

export default Dashboard
