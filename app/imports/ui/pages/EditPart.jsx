import React from 'react';
import { Grid, Loader, Header, Segment, Form } from 'semantic-ui-react';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect } from 'react-router';
import { Parts, statusValues } from '../../api/parts/Parts';

/** Renders the Page for editing a single document. */
class EditPart extends React.Component {

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
      status: '',
      loading: true,
      redirectToReferrer: false,
    };

    this.submit = this.submit.bind(this);
  }

  // On successful submit, insert the data.
  submit() {
    const { name, quantity, assignee, mechanism, notes, designer, status, pdf, stl } = this.state;
    const { _id } = this.props.part;
    Parts.collection.update(_id, { $set: { name, quantity, assignee, mechanism, notes, designer, status, pdf, stl } }, (error) => {
      if (error) {
        swal('Error', error.message, 'error');
      } else {
        swal('Success', 'Item updated successfully', 'success');
        this.setState({ redirectToReferrer: true });
      }
    });
    console.log(assignee, mechanism);
  }

  componentDidUpdate() {
    if (this.props.ready && this.state.loading) {
      const { part } = this.props;
      this.setState({
        name: part.name,
        quantity: part.quantity,
        assignee: part.assignee,
        designer: part.designer,
        mechanism: part.mechanism,
        pdf: part.pdf,
        stl: part.stl,
        notes: part.notes,
        status: part.status,
        loading: false,
        mechanisms: _.flatten(_.uniq(this.props.parts.map(p => p.mechanism))).map((mech, index) => ({ key: `mechanism_${index}`, text: mech, value: mech })),
        assignees: _.flatten(_.uniq(this.props.parts.map(p => p.assignee))).map((assign, index) => ({ key: `assignee_${index}`, text: assign, value: assign })),
        designers: _.uniq(this.props.parts.map(p => p.designer)).map((assign, index) => ({ key: `designer_${index}`, text: assign, value: assign })),
      });
    }
  }

  // If the subscription(s) have been received, render the page, otherwise show a loading icon.
  render() {
    if (this.state.redirectToReferrer) {
      return <Redirect to='/board' />;
    }

    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  renderPage() {
    const { name, quantity, assignee, mechanism, notes, mechanisms, assignees, designer, designers } = this.state;

    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center" style={{ paddingTop: '15px', color: 'white' }}>Edit Stuff</Header>
          <Segment>
            <Form onSubmit={() => this.submit()}>
              <Form.Input name='name'
                label='Name'
                placeholder='Camera Mount'
                value={name}
                onChange={(e) => this.setState({ name: e.target.value })} />
              <Form.Input name='quantity'
                label='Quantity'
                placeholder='1'
                value={quantity}
                onChange={(e) => this.setState({ quantity: e.target.value })} />
              <Form.Dropdown name='designer'
                label='Designer'
                options={designers || []}
                search
                selection
                allowAdditions
                placeholder='John Smith'
                value={designer}
                onAddItem={(e, { value }) => this.setState({ designers: designers.concat([{ key: `designer_${designers.length}`, text: value, value: value }]) })}
                onChange={(e, { value }) => this.setState({ designer: value })} />
              <Form.Dropdown name='assignee'
                label='Assignee'
                options={assignees || []}
                multiple
                search
                selection
                allowAdditions
                placeholder='John Smith'
                value={assignee}
                onAddItem={(e, { value }) => this.setState({ assignees: assignees.concat([{ key: `assignee_${assignees.length}`, text: value, value: value }]) })}
                onChange={(e, { value }) => this.setState({ assignee: value })} />
              <Form.Dropdown name='mechanism'
                label='Mechanism'
                options={mechanisms || []}
                multiple
                search
                selection
                allowAdditions
                placeholder='Arm'
                value={mechanism}
                onAddItem={(e, { value }) => this.setState({ mechanisms: mechanisms.concat([{ key: `mechanism_${mechanisms.length}`, text: value, value: value }]) })}
                onChange={(e, { value }) => this.setState({ mechanism: value })} />
              <Form.TextArea name='notes'
                label='Notes'
                placeholder='Additional notes here...'
                value={notes}
                onChange={(e) => this.setState({ notes: e.target.value })} />
              <Form.Button content='Submit' type='submit' />
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

EditPart.propTypes = {
  part: PropTypes.object,
  parts: PropTypes.array,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(({ match }) => {
  const documentId = match.params._id;
  const subscription = Meteor.subscribe(Parts.publicationName);
  const ready = subscription.ready();
  const parts = Parts.collection.find({}).fetch();
  const part = parts.find(({ _id }) => _id === documentId);
  return {
    part,
    parts,
    ready,
  };
})(EditPart);
