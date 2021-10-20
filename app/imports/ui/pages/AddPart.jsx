import React from 'react';
import { Grid, Segment, Header, Form, Loader, Container } from 'semantic-ui-react';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { STLViewer } from 'react-stl-obj-viewer';
import { config, S3 } from 'aws-sdk';
import { Parts, statusValues } from '../../api/parts/Parts';

/** Renders the Page for adding a document. */
class AddPart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      quantity: 0,
      assignee: [],
      designer: '',
      mechanism: [],
      pdf: '',
      stl: '',
      notes: '',
      status: statusValues[0],
      loading: false,
    };

    this.submit = this.submit.bind(this);
  }

  clear() {
    this.setState({
      name: '',
      quantity: 0,
      assignee: [],
      designer: '',
      mechanism: [],
      pdf: '',
      stl: '',
      notes: '',
      status: statusValues[0],
      loading: false,
    });
  }

  // On submit, insert the data.
  async submit() {
    const { name, quantity, assignee, mechanism, notes, designer, status } = this.state;
    this.setState({ loading: true });
    const uploads = await this.uploadFiles(this.state.files);
    Promise.all(uploads).then((files) => {
      const pdf = files.find(file => file.key.split('.').pop().toLowerCase() === 'pdf').Location;
      const stl = files.find(file => file.key.split('.').pop().toLowerCase() === 'stl').Location;
      Parts.collection.insert({ name, quantity, assignee, mechanism, notes, designer, status, pdf, stl },
        (error) => {
          if (error) {
            swal('Error', error.message, 'error').then(() => this.clear());
          } else {
            swal('Success', `${name} added successfully`, 'success').then(() => this.clear());
            this.setState({ redirectToReferrer: true });
          }
        });
    });
  }

  componentDidUpdate() {
    if (!this.state.mechanisms && !this.state.assignees && !this.state.designers) {
      this.setState({
        mechanisms: _.flatten(_.uniq(this.props.parts.map(part => part.mechanism))).map((mech, index) => ({ key: `mechanism_${index}`, text: mech, value: mech })),
        assignees: _.flatten(_.uniq(this.props.parts.map(part => part.assignee))).map((assign, index) => ({ key: `assignee_${index}`, text: assign, value: assign })),
        designers: _.uniq(this.props.parts.map(part => part.designer)).map((assign, index) => ({ key: `designer_${index}`, text: assign, value: assign })),
      });
    }
  }

  render() {
    if (this.state.redirectToReferrer) {
      return <Redirect to='/board' />;
    }

    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data...</Loader>;
  }

  loadModel(e) {
    const files = e.target.files;
    this.setState({ files });
    for (let i = 0; i < files.length; i++) {
      const type = files[i].name.split('.').pop();
      if (type.toLowerCase() === 'stl') {
        this.setState({ stlFile: files[i] });
      }
    }
  }

  async uploadFiles(files) {
    const promises = [];
    config.update({ region: 'us-west-1' });
    const s3 = new S3({
      accessKeyId: Meteor.settings.public.s3.accessKeyId,
      secretAccessKey: Meteor.settings.public.s3.secretAccessKey,
      apiVersion: '2006-03-01',
    });
    let upload;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.name.split('.').pop();
      const params = {
        Bucket: 'astruhoidsnebula',
        Key: `${this.state.name.replaceAll('\\g', '_')}.${type}`, // File name you want to save as in S3
        Body: file,
      };

      // eslint-disable-next-line no-await-in-loop
      upload = await s3.upload(params, function (err) {
        if (err) {
          throw err;
        }
      });

      promises.push(upload.promise());

      upload.on('httpUploadProgress', (progress) => {
        this.setState({ loadingProgress: (Math.round((progress.loaded / progress.total) * 100)), loaded: i });
      });
    }
    return promises;
  }

  renderPage() {
    const { name, quantity, assignee, mechanism, notes, loading, mechanisms, assignees, designer, designers } = this.state;
    return <Grid container centered>
      <Grid.Column>
        <Header as="h2" textAlign="center" style={{ paddingTop: '15px', color: 'white' }}>Add Part</Header>
        <Segment>
          <Form loading={loading} onSubmit={() => this.submit()}>
            <Form.Input name='name'
              label='Name'
              placeholder='Camera Mount'
              value={name}
              onChange={(e) => this.setState({ name: e.target.value })} />
            <Form.Input name='quantity'
              label='Quantity'
              placeholder='1'
              value={quantity}
              onChange={(e) => this.setState({ quantity: e.target.value })}/>
            <Form.Dropdown name='designer'
              label='Designer'
              search
              selection
              allowAdditions
              options={designers}
              placeholder='John Smith'
              value={designer}
              onAddItem={(e, { value }) => this.setState({ designers: designers.concat([{ key: `designer_${designers.length}`, text: value, value: value }]) })}
              onChange={(e, { value }) => this.setState({ designer: value })}/>
            <Form.Dropdown name='assignee'
              label='Assignee'
              multiple
              search
              selection
              allowAdditions
              options={assignees}
              placeholder='John Smith'
              value={assignee}
              onAddItem={(e, { value }) => this.setState({ assignees: assignees.concat([{ key: `assignee_${assignees.length}`, text: value, value: value }]) })}
              onChange={(e, { value }) => this.setState({ assignee: value })}/>
            <Form.Dropdown name='mechanism'
              label='Mechanism'
              multiple
              search
              selection
              allowAdditions
              options={mechanisms}
              placeholder='Arm'
              value={mechanism}
              onAddItem={(e, { value }) => this.setState({ mechanisms: mechanisms.concat([{ key: `mechanism_${mechanisms.length}`, text: value, value: value }]) })}
              onChange={(e, { value }) => this.setState({ mechanism: value })}/>
            <Form.TextArea name='notes'
              label='Notes'
              placeholder='Additional notes here...'
              value={notes}
              onChange={(e) => this.setState({ notes: e.target.value })}/>
            <Form.Input
              type='file'
              multiple
              label='Add STL and Schematic PDF'
              accept='.pdf,.stl'
              onChange={e => this.loadModel(e)}
            />
            { this.state.stlFile ?
              <Container style={{ marginTop: '2rem' }}>
                <Grid centered>
                  <STLViewer
                    file={this.state.stlFile}
                    width={800}
                    height={500}
                    modelColor='#00acb1'
                    backgroundColor='#EAEAEA'
                  />
                </Grid>
              </Container>
              : ''}
            <Form.Button content='Submit' type='submit' />
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>;
  }
}

AddPart.propTypes = {
  parts: PropTypes.array,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe(Parts.publicationName);
  const ready = subscription.ready();
  const parts = Parts.collection.find({}).fetch();
  return {
    ready,
    parts,
  };
})(AddPart);
