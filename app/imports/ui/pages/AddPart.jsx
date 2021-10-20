import React from 'react';
import { Grid, Segment, Header, Form, Loader, Container, Progress } from 'semantic-ui-react';
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
      assignees: [],
      designer: '',
      designers: [],
      mechanism: [],
      mechanisms: [],
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
    const { name, quantity, assignee, mechanism, notes, designer, status, files } = this.state;
    if (name && quantity && assignee && mechanism && designer && status && files) {
      this.setState({ loading: true });
      const uploads = await this.uploadFiles(this.state.files);
      Promise.all(uploads).then((f) => {
        const pdf = f.find(file => file.Key.split('.').pop().toLowerCase() === 'pdf').Location;
        const stl = f.find(file => file.Key.split('.').pop().toLowerCase() === 'stl').Location;
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
    } else {
      swal('Error', 'Please enter all the required fields', 'error');
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
        Key: `${this.state.name}.${type}`, // File name you want to save as in S3
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

  componentDidMount() {
    const mechanisms = _.uniq(_.flatten(this.props.parts.map(part => part.mechanism))).map((mech, index) => ({ key: `mechanism_${index}`, text: mech, value: mech }));
    const assignees = _.uniq(_.flatten(this.props.parts.map(part => part.assignee))).map((assign, index) => ({ key: `assignee_${index}`, text: assign, value: assign }));
    const designers = _.uniq(this.props.parts.map(part => part.designer)).map((assign, index) => ({ key: `designer_${index}`, text: assign, value: assign }));
    this.setState({ mechanisms, assignees, designers });
  }

  renderPage() {
    const { name, quantity, assignee, mechanism, notes, loading, designer, mechanisms, assignees, designers } = this.state;
    return <Grid container centered>
      <Grid.Column>
        <Header as="h2" textAlign="center" style={{ paddingTop: '15px', color: 'white' }}>Add Part</Header>
        <Segment>
          { this.state.loadingProgress ?
            <Progress percent={this.state.loadingProgress} indicating />
            : ''}
          <Form loading={loading} onSubmit={() => this.submit()}>
            <Form.Input name='name'
              required
              label='Name'
              placeholder='Camera Mount'
              value={name}
              onChange={(e) => this.setState({ name: e.target.value })} />
            <Form.Input name='quantity'
              required
              label='Quantity'
              placeholder='1'
              value={quantity}
              onChange={(e) => this.setState({ quantity: e.target.value })}/>
            <Form.Dropdown name='designer'
              required
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
              required
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
              required
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
              required
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
                    key={this.state.stlFile.name}
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
