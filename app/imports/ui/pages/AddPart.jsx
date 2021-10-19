import React from 'react';
import { Grid, Segment, Header, Form, Loader, Image } from 'semantic-ui-react';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';
import PropTypes from 'prop-types';
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
      pdf: 'https://astruhoidsnebula.s3.us-west-1.amazonaws.com/2445_Camera_Mount/2445_Camera_Mount.pdf',
      stl: 'https://astruhoidsnebula.s3.us-west-1.amazonaws.com/2445_Camera_Mount/2445_Camera_Mount.stl',
      notes: '',
      status: statusValues[0],
      loading: false,
    };
  }

  clear() {
    this.setState({
      name: '',
      quantity: 0,
      assignee: [],
      designer: '',
      mechanism: [],
      pdf: 'https://astruhoidsnebula.s3.us-west-1.amazonaws.com/2445_Camera_Mount/2445_Camera_Mount.pdf',
      stl: 'https://astruhoidsnebula.s3.us-west-1.amazonaws.com/2445_Camera_Mount/2445_Camera_Mount.stl',
      notes: '',
      status: statusValues[0],
      loading: false,
    });
  }

  // On submit, insert the data.
  submit() {
    const { name, quantity, assignee, mechanism, notes, designer, status, pdf, stl } = this.state;
    this.setState({ loading: true });
    Parts.collection.insert({ name, quantity, assignee, mechanism, notes, designer, status, pdf, stl },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error').then(() => this.clear());
        } else {
          swal('Success', `${name} added successfully`, 'success').then(() => this.clear());
        }
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
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data...</Loader>;
  }

  renderPage() {
    const { name, quantity, assignee, mechanism, notes, loading, mechanisms, assignees, designer, designers } = this.state;
    return <Grid container centered>
      <Grid.Column>
        <Header as="h2" textAlign="center">Add Part</Header>
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
