import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Header, Grid } from 'semantic-ui-react';

const ViewInformation = ({ part }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button>View Info.</Button>}
    >
      <Modal.Header>{part.name} - Status: {part.progress}</Modal.Header>
      <Modal.Content>
        <Grid stackable columns={2}>
          <Grid.Column width={4}>
            <Modal.Description>
              <Header>Details:</Header>
              <Modal.Content><b>Quantity:</b> {part.quantity}</Modal.Content>
              <Modal.Content><b>Mechanism:</b> {part.mechanism}</Modal.Content>
              <Modal.Content><b>Assigned To:</b> {part.assignee}</Modal.Content>
              <Modal.Content><b>Designer:</b> {part.designer}</Modal.Content>
              <Header>Description:</Header>
              <Modal.Content>{part.notes}</Modal.Content>
            </Modal.Description>
          </Grid.Column>
          <Grid.Column widht={12}>
            <Modal.Description>
              <Header>Files Attached:</Header>
              <iframe src={part.pdf} width='100%'></iframe>
              {part.stl}
            </Modal.Description>
          </Grid.Column>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={() => setOpen(false)}>
          Close
        </Button>
      </Modal.Actions>
    </Modal >
  );
};
ViewInformation.propTypes = {
  part: PropTypes.object.isRequired,
};

export default ViewInformation;
