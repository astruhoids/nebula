import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'semantic-ui-react';

const ViewInformation = ({ header, text }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button>View Info.</Button>}
    >
      <Modal.Header>{header}</Modal.Header>
      <Modal.Content>
        {text}
      </Modal.Content>
      <Modal.Actions>
        <Button color='red' onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          content='Create'
          labelPosition='right'
          icon='checkmark'
          onClick={() => setOpen(false)}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
};
ViewInformation.propTypes = {
  header: PropTypes.string,
  text: PropTypes.string,
};

export default ViewInformation;
