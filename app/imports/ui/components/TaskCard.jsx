import React from 'react';
import { Card, Grid } from 'semantic-ui-react';
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
                {(this.state.showBtn) ? (<ViewInformation part={this.props.part} />) : <></>}
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
};

export default TaskCard;
