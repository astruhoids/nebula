import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, CardContent, Container, Header, Progress, Loader, Form, Dropdown } from 'semantic-ui-react';
import _ from 'lodash';
import { Parts } from '../../api/parts/Parts';
import TaskCard from '../components/TaskCard';

/**
 * Called when card is reorder within the same column.
 *
 * @param {*} list Array of cards
 * @param {*} startIndex Beginning index of array
 * @param {*} endIndex End index of array
 * @returns Mutated array of the new order for the list
 */
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Called when a card is moved to a different column from its origin.
 * Clones both the source and target's list of cards and mutates it to the
 * desired location.
 *
 * @param {*} source The name of the column a card came from
 * @param {*} target The name of the column a card shall go
 * @param {*} droppableSource Reference to the card's source
 * @param {*} droppableTarget Reference to the card's target
 * @returns An object-array that has the modified list of say column A and B.
 */
const move = (source, target, droppableSource, droppableTarget) => {
  // Cloning arrays and recording what has been removed from the source
  const sourceClone = Array.from(source);
  const targetClone = Array.from(target);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  // Inserting the removed card to the target column
  targetClone.splice(droppableTarget.index, 0, removed);

  // Storing result to object for both source and target
  const result = {
    [droppableSource.droppableId]: sourceClone,
    [droppableTarget.droppableId]: targetClone,
  };

  return result;
};

class ProjectBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '', loaded: false, todo: [], progress: [], review: [], done: [] };
  }

  handleChange = (e, { value }) => this.setState({ value })

  updateSearch(e) {
    this.setState({ search: e.target.value });
  }

  /** Updating the issues from the Parts Collection */
  updateIssues() {
    const partsToDo = this.props.parts.filter((part) => {
      if (part.key === undefined || part.key === null) {
        // Assigning the key to be the part's _id
        // eslint-disable-next-line no-param-reassign
        part.key = part._id;
      }

      return part.status === 'To Do';
    });
    // Will need to make variables for progress, review, and done
    const partsReview = this.props.parts.filter((part) => {
      if (part.key === undefined || part.key === null) {
        // Assigning the key to be the part's _id
        // eslint-disable-next-line no-param-reassign
        part.key = part._id;
      }

      return part.progress === 'Review';
    });
    // Update the states and mark that the issues have been loaded
    this.setState({ loaded: true, todo: partsToDo, review: partsReview });
  }

  /** Checking if the component successfully updated */
  componentDidUpdate() {
    // If the issues weren't loaded as well as the props, we call UpdateIssues() to load them.
    if (!this.state.loaded && this.props.parts && this.props.ready) {
      this.updateIssues();
    }
  }

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready && this.props.parts) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  renderPage() {
    const idList = {
      todo: 'todo',
      progress: 'progress',
      review: 'review',
      done: 'done',
    };
    // Grabbing list based on the id
    const getList = id => this.state[idList[id]];

    const totalIssues = _.sum([this.state.todo.length, this.state.progress.length, this.state.done.length]);

    // When user stops dragging (aka releases card)
    const onDragEnd = result => {
      const { source, destination } = result;

      // Card dropped in an invalid location
      if (!destination) {
        return;
      }

      // Card was dropped in the same column it came from
      if (source.droppableId === destination.droppableId) {
        const items = reorder(
          getList(source.droppableId),
          source.index,
          destination.index,
        );

        // Setting the reordered list to be the new list
        // By default it checks the todo column
        let list = { items };

        if (source.droppableId === 'progress') {
          list = { progress: items };
        } else if (source.droppableId === 'done') {
          list = { done: items };
        }

        this.setState({ list });

        // Card is placed in a different column from origin
      } else {
        // Recording column source and destination names
        const columnA = source.droppableId;
        const columnB = destination.droppableId;

        // Calling move to actually move the cards around
        const output = move(
          getList(source.droppableId),
          getList(destination.droppableId),
          source,
          destination,
        );

        // Based on which columns were affected, update dynamically with the cards moved
        this.setState({
          [columnA]: output[columnA],
          [columnB]: output[columnB],
        });
      }
    };

    // Variables for filter
    const { value } = this.state;
    let todoParts = this.state.todo;
    let progressParts = this.state.progress;
    let reviewParts = this.state.review;
    let doneParts = this.state.done;

    // Get filter options for mechanisms that are currently in the project
    const mechOptions = _.uniqWith(this.props.parts.map(mech => ({
      key: `${mech.mechanism}`,
      text: `${mech.mechanism}`,
      value: `${mech.mechanism}`,
    })), _.isEqual);

    if (this.state.value === '' || this.state.value.length === 0) {
      todoParts = this.state.todo;
      progressParts = this.state.progress;
      reviewParts = this.state.review;
      doneParts = this.state.done;
    } else {
      let filteredTodo = [];
      let filteredProgress = [];
      let filteredReview = [];
      let filteredDone = [];
      for (let i = 0; i < this.state.value.length; i++) {
        // Filter the results to selected value
        filteredTodo = this.state.todo.filter(part => part.mechanism.includes(this.state.value));
        filteredProgress = this.state.progress.filter(part => part.mechanism.includes(this.state.value));
        filteredReview = this.state.review.filter(part => part.mechanism.includes(this.state.value));
        filteredDone = this.state.done.filter(part => part.mechanism.includes(this.state.value));
      }
      todoParts = filteredTodo;
      progressParts = filteredProgress;
      reviewParts = filteredReview;
      doneParts = filteredDone;
    }

    return (
      <Container fluid>
        <Header as='h1' textAlign='center' style={{ paddingTop: '15px', color: 'white' }}>Project</Header>
        <Dropdown
          placeholder='Mechanism'
          value={value}
          clearable
          options={mechOptions}
          selection
          onChange={this.handleChange}
        />
        <DragDropContext onDragEnd={onDragEnd}>
          <Card.Group centered>
            <Card>
              <Card.Content>
                <Card.Header>To Do</Card.Header>
              </Card.Content>
              <Card.Content className='cardPanel'>
                <Droppable droppableId="todo">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      style={{ height: '400px' }}
                    >

                      {todoParts.map((part, index) => (
                        <Draggable
                          key={part._id}
                          draggableId={part._id}
                          index={index}>
                          {(providedItem) => (
                            <div
                              ref={providedItem.innerRef}
                              {...providedItem.draggableProps}
                              {...providedItem.dragHandleProps}
                            >
                              <TaskCard part={part} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card.Content>
              <Card.Content>
                <Progress className="no-margin"
                  percent={((this.state.todo.length / totalIssues) * 100).toFixed(1)}
                  progress error
                />
              </Card.Content>
            </Card>
            <Card>
              <CardContent>
                <Card.Header>In Progress</Card.Header>
              </CardContent>
              <Card.Content className='cardPanel'>
                <Droppable droppableId='progress'>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      style={{ height: '400px' }}
                    >
                      {progressParts.map((part, index) => (
                        <Draggable
                          key={part._id}
                          draggableId={part._id}
                          index={index}>
                          {(providedItem) => (
                            <div
                              ref={providedItem.innerRef}
                              {...providedItem.draggableProps}
                              {...providedItem.dragHandleProps}
                            >
                              <TaskCard part={part} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card.Content>
              <Card.Content>
                <Progress className="no-margin"
                  percent={((this.state.progress.length / totalIssues) * 100).toFixed(1)}
                  progress warning
                />
              </Card.Content>
            </Card>
            <Card>
              <CardContent>
                <Card.Header>For Review</Card.Header>
              </CardContent>
              <Card.Content className='cardPanel'>
                <Droppable droppableId='review'>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      style={{ height: '400px' }}
                    >
                      {reviewParts.map((part, index) => (
                        <Draggable
                          key={part._id}
                          draggableId={part._id}
                          index={index}>
                          {(providedItem) => (
                            <div
                              ref={providedItem.innerRef}
                              {...providedItem.draggableProps}
                              {...providedItem.dragHandleProps}
                            >
                              <TaskCard part={part} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card.Content>
              <Card.Content>
                <Progress className="no-margin"
                  percent={((this.state.review.length / totalIssues) * 100).toFixed(1)}
                  progress color={'olive'}
                />
              </Card.Content>
            </Card>
            <Card>
              <CardContent>
                <Card.Header>Done (Advisor Only)</Card.Header>
              </CardContent>
              <Card.Content className='cardPanel'>
                <Droppable droppableId='done' isDropDisabled={!this.props.currentUser}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      style={{ height: '400px' }}
                    >
                      {doneParts.map((part, index) => (
                        <Draggable
                          key={part._id}
                          draggableId={part._id}
                          index={index}
                          isDragDisabled={!this.props.currentUser}
                        >
                          {(providedItem) => (
                            <div
                              ref={providedItem.innerRef}
                              {...providedItem.draggableProps}
                              {...providedItem.dragHandleProps}
                            >
                              <TaskCard part={part} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card.Content>
              <Card.Content>
                <Progress className="no-margin"
                  percent={((this.state.done.length / totalIssues) * 100).toFixed(1)}
                  progress success
                />
              </Card.Content>
            </Card>
          </Card.Group>
        </DragDropContext>
      </Container>
    );
  }
}

ProjectBoard.propTypes = {
  currentUser: PropTypes.bool.isRequired,
  parts: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  // Check if the current user is in the admin role
  const currentUser = Roles.userIsInRole(Meteor.userId(), 'admin');
  const subscription = Meteor.subscribe(Parts.publicationName);
  const ready = subscription.ready();
  const parts = Parts.collection.find({}).fetch();
  return {
    currentUser,
    parts,
    ready,
  };
})(ProjectBoard);
