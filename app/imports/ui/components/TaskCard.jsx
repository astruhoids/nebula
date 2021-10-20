import React from 'react';
import { Card, Grid, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ViewInformation from '../components/ViewInformation';

/** Is shown on the project page. Represents a task to create a part */
class TaskCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showBtn: false };
  }

  render() {
    return (
      <Card
        className="taskCard"
        onMouseEnter={() => this.setState({ showBtn: true })}
        onMouseLeave={() => this.setState({ showBtn: false })}
      >
        <Card.Content>
          <Grid>
            <Grid.Row>
              <Grid.Column floated="left" width={11}>
                <Card.Header as="h3" style={{ marginBottom: '0.2rem' }}>
                  {this.props.part.name}
                </Card.Header>
                <Card.Meta style={{ marginBottom: '0.2rem' }}>Quantity: {this.props.part.quantity}</Card.Meta>
                <Card.Description>
                  Assigned to: {this.props.part.assignee}
                </Card.Description>
              </Grid.Column>
              <Grid.Column floated="left">
                {(this.state.showBtn) ? (
                  <>
                    <Grid.Row>
                      <ViewInformation part={this.props.part} deleteItem={this.props.deleteItem} userAdmin={this.props.currentUser}/>
                    </Grid.Row>
                    {this.props.currentUser ?
                      (<Grid.Row
                        style={{ marginTop: '0.4rem' }}>
                        <Button
                          as={NavLink}
                          to={`edit/${this.props.part._id}`}
                          size='mini' icon='edit'
                        />
                      </Grid.Row>)
                      :
                      ''
                    }
                  </>
                ) : <></>
                }
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    );
  }
}

TaskCard.propTypes = {
  part: PropTypes.object.isRequired,
  currentUser: PropTypes.bool.isRequired,
  deleteItem: PropTypes.func.isRequired,
};

export default withTracker(() => {
  // Check if the current user is in the admin role
  const currentUser = Roles.userIsInRole(Meteor.userId(), 'admin');
  return {
    currentUser,
  };
})(TaskCard);
