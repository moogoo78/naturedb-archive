import React, { useState } from 'react';
import { useForm } from 'react-final-form';
import {
//  required,
  Button,
  SaveButton,
  TextInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  DateInput,
  useCreate,
  useNotify,
  FormWithRedirect,
  useRefresh,
  useRedirect,
} from 'react-admin';

import IconContentAdd from '@material-ui/icons/Add';
import IconContentEdit from '@material-ui/icons/Edit';
import IconCancel from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';

function IdentificationQuickDialog({onChange, record}) {
  const [showDialog, setShowDialog] = useState(false);
  const [create, { loading }] = useCreate('identifications');
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const form = useForm();

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };

  const handleSubmit = async values => {
    create(
      { payload: { data: values } },
      {
        onSuccess: ({ data }) => {
          //console.log(data, 'aaaa', data.id);
          setShowDialog(false);
          //form.change('collection_id', parseInt(collectionId, 10));
          onChange();
          notify('add identification to collection');
          //redirect(`/collection-specimens/${record.unit_id}`)
          refresh();
        },
        onFailure: ({ error }) => {
          notify(error.message, 'error');
        }
      }
    );
  };

  const editOrNew = (source) => {
    return (record) ? source : `${source}__new`;
  }

  return (
    <>
      <Button onClick={handleClick} label={(record) ? "EDIT" : "CREATE"}>
        {(record) ? <IconContentEdit /> : <IconContentAdd />}
      </Button>
      <Dialog
        fullWidth
        open={showDialog}
        onClose={handleCloseClick}
        aria-label="Create Identification"
      >
        <DialogTitle>Identification</DialogTitle>
        <FormWithRedirect
          resource="identifications"
          save={handleSubmit}
          render={({
            handleSubmitWithRedirect,
            pristine,
            saving,
            record,
          }) => (
            <>
              <DialogContent>
                <Box display="flex">
                  <Box flex={1}>
                    <ReferenceInput label="物種" source={editOrNew("taxon_id")} reference="taxa" fullWidth allowEmpty>
                      <AutocompleteInput optionText="display_name" />
                    </ReferenceInput>
                  </Box>
                </Box>
                <Box display="flex">
                  <Box flex={1}>
                    <ReferenceInput label="鑒定者" source={editOrNew("identifier_id")} reference="people" fullWidth allowEmpty>
                      <AutocompleteInput optionText="full_name" />
                    </ReferenceInput>
                  </Box>
                </Box>
                <Box display="flex">
                  <Box flex={1} mr="1em">
                    <DateInput
                      label="採集日期"
                      source={editOrNew("date")}
                      fullWidth
                    />
                  </Box>
                  <Box flex={1} ml="1em">
                    <TextInput
                      label="採集日期(格式不完整)"
                      source={editOrNew("date_text")}
                      fullWidth
                    />
                  </Box>
                </Box>
                <Box display="flex">
                  <Box flex={1}>
                    <NumberInput
                      label="鑑定等級/順序"
                      source={editOrNew("sequence")}
                    />
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  label="ra.action.cancel"
                  onClick={handleCloseClick}
                  disabled={loading}
                >
                  <IconCancel />
                </Button>
                <SaveButton
                  handleSubmitWithRedirect={
                    handleSubmitWithRedirect
                  }
                  pristine={pristine}
                  saving={saving}
                  disabled={loading}
                />
              </DialogActions>
            </>
          )}
        />
      </Dialog>
    </>
  );
}

export default IdentificationQuickDialog;
