import React, { useState } from 'react';
import { useForm } from 'react-final-form';
import {
//  required,
  Button,
  SaveButton,
  TextInput,
  useCreate,
  useNotify,
  FormWithRedirect,
  useRefresh,
  useRedirect,
} from 'react-admin';
import IconContentAdd from '@material-ui/icons/Add';
import IconCancel from '@material-ui/icons/Cancel';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

function UnitQuickCreateButton({ onChange, collectionId }) {
    const [showDialog, setShowDialog] = useState(false);
    const [create, { loading }] = useCreate('units');
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
                //console.log(data, 'aaaa', collectionId, data.id);
                    setShowDialog(false);
                    // Update the comment form to target the newly created post
                    // Updating the ReferenceInput value will force it to reload the available posts
                form.change('collection_id', parseInt(collectionId, 10));
                onChange();
                notify('add unit in collection');
                redirect(`/collections/${collectionId}`)
                refresh();
                },
                onFailure: ({ error }) => {
                    notify(error.message, 'error');
                }
            }
        );
    };

    return (
        <>
            <Button onClick={handleClick} label="Add Unit">
                <IconContentAdd />
            </Button>
            <Dialog
                fullWidth
                open={showDialog}
                onClose={handleCloseClick}
                aria-label="Create Unit"
            >
                <DialogTitle>Create Unit</DialogTitle>

                <FormWithRedirect
                    resource="units"
                    save={handleSubmit}
                    render={({
                        handleSubmitWithRedirect,
                        pristine,
                        saving
                    }) => (
                        <>
                          <DialogContent>
                                <TextInput
                                    source="accession_number__from_collection"
                                    fullWidth
                                />
                                <TextInput
                                    source="duplication_number__from_collection"
                                    fullWidth
                                />
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

export default UnitQuickCreateButton;
