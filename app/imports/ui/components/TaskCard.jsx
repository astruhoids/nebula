import React from 'react';
import { Card } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

/** Is shown on the project page. Represents a task to create a part */
class TaskCard extends React.Component {
  render() {
    return (
      <Card className="taskCard">
        <Card.Content>
          <Card.Header>{this.props.part.name}</Card.Header>
          <Card.Meta>Quantity: {this.props.part.quantity}</Card.Meta>
          <Card.Description>
            Assigned to: {this.props.part.assignee}
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

TaskCard.propTypes = {
  part: PropTypes.object.isRequired,
};

export default withRouter(TaskCard);
