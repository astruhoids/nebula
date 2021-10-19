import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Header, Grid, Icon, List, Accordion } from 'semantic-ui-react';
import { STLViewer } from 'react-stl-obj-viewer';

const ViewInformation = ({ part }) => {
  const [open, setOpen] = React.useState(false);
  const [stlView, setStlView] = React.useState(false);

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button size="mini" icon="info" />}
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
              <List>
                <List.Item><Button href={part.pdf} target='_blank' rel='noreferrer'><Icon name='file pdf'/>Open PDF</Button></List.Item>
                <List.Item>
                  <Accordion>
                    <Accordion.Title>
                      <Button onClick={() => setStlView(!stlView)}><Icon name='eye'/>Preview STL</Button>
                    </Accordion.Title>
                    <Accordion.Content active={stlView}>
                      <STLViewer
                        url={part.stl}
                        width={400}
                        height={400}
                        modelColor='#00acb1'
                        backgroundColor='#EAEAEA'
                      />
                    </Accordion.Content>
                  </Accordion>
                </List.Item>
              </List>
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
