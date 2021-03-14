import React, { ElementType, ReactElement } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { SpacingProps } from '@material-ui/system';
import { clone, setWith, curry } from 'lodash/fp';

import { Select } from 'components/Inputs';

const setIn = curry((path, value, obj) =>
  setWith(clone, path, value, clone(obj)),
);

export interface FormDialogProps {
  /**
   * content
   */
  content?: string;
  /**
   * fields
   */
  fields: Array<{
    id: string | number;
    name: string;
    options?: Array<{ id: string | number; name: string }>;
    type?: 'date' | 'dateTime' | 'number' | 'select' | 'string' | 'text';
  }>;
  /**
   * mutation function
   */
  mutation: (input: { [key: string]: unknown }) => void;
  /**
   * open button
   */
  openButton?: ElementType;
  /**
   * title
   */
  title: string;
}

/**
 * A dialog box with a form
 */
const FormDialog = ({
  content,
  fields,
  mutation,
  openButton,
  title,
  ...props
}: FormDialogProps & SpacingProps): ReactElement => {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const OpenButton = openButton;

  const handleUpdate = () => {
    mutation({ variables: { input: state } });
    handleClose();
  };

  const handleChange = (id, event) =>
    setState(setIn(state, id, event.target.value));

  return (
    <Box {...props}>
      {openButton && <OpenButton onClick={handleClickOpen} />}
      {!openButton && (
        <Button color="primary" variant="outlined">
          Open
        </Button>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
          {fields.map(({ id, name, options }) => (
            <>
              {options && <Select label={name} options={options} />}
              {!options && (
                <TextField
                  fullWidth
                  id={id as string}
                  label={name}
                  margin="dense"
                  onChange={(event) => handleChange(id, event)}
                />
              )}
            </>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdate} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormDialog;
