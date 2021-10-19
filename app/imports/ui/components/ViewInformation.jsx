import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Header, Grid, Icon } from 'semantic-ui-react';

const ViewInformation = ({ part }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button size="mini" icon="info"/>}
    >
      <Modal.Header>{part.name}</Modal.Header>
      <Modal.Content>
        <Grid stackable columns={2}>
          <Grid.Column width={4}>
            <Modal.Description>
              <Header>Details:</Header>
              <Modal.Content>Quantity: {part.quantity}</Modal.Content>
              <Modal.Content>Assigned To: {part.assignee}</Modal.Content>
              <Header>Description:</Header>
              <Modal.Content>{part.text}</Modal.Content>
            </Modal.Description>
          </Grid.Column>
          <Grid.Column widht={12}>
            <Modal.Description>
              <Header>Files Attached:</Header>
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
