import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter, NavLink } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, CardContent, Container, Header, Progress, Loader, Form, Button, Grid } from 'semantic-ui-react';
import _ from 'lodash';
import { Parts } from '../../api/parts/Parts';
import TaskCard from '../components/TaskCard';
import SearchFilters from '../components/SearchFilters';

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
    this.state = { value: '', search: '', loaded: false, todo: [], progress: [], review: [], done: [] };
  }

  /** Updating the issues from the Parts Collection */
  updateIssues() {
    const todoParts = [];
    const progressParts = [];
    const reviewParts = [];
    const doneParts = [];

    this.props.parts.forEach((part) => {
      if (part.key === undefined || part.key === null) {
        // Assigning the key to be the part's _id
        // eslint-disable-next-line no-param-reassign
        part.key = part._id;
      }
      switch (part.status) {
      case 'To Do':
        todoParts.push(part);
        break;
      case 'In Progress':
        progressParts.push(part);
        break;
      case 'For Review':
        reviewParts.push(part);
        break;
      case 'Done':
        doneParts.push(part);
        break;
        // no default
      }
    });

  // sorts by field index normally, except moves -1s (new entries) to the back/bottom of list
    const sortIndex = (a, b) => {
      if (a.index === -1 && b.index === -1) {
        return 0;
      }
      if (a.index === -1) {
        return 1;
      }
      if (b.index === -1) {
        return -1;
      }
      return a.index - b.index;
    }

    // Update the states and mark that the issues have been loaded
    this.setState({
      loaded: true,
      todo: todoParts.sort(sortIndex),
      progress: progressParts.sort(sortIndex),
      review: reviewParts.sort(sortIndex),
      done: doneParts.sort(sortIndex),
    });
  }

  /** Checking if the component successfully updated */
  componentDidUpdate() {
    // If the issues weren't loaded as well as the props, we call UpdateIssues() to load them.
    if (!this.state.loaded && this.props.parts && this.props.ready) {
      this.updateIssues();
    }
  }

  /** Handle user selection/input for filters */
  handleChange = (e, { value }) => this.setState({ value })

  handleSearch = (e) => this.setState({ search: e.target.value })

  handleSearchClear = () => this.setState({ search: '', value: '' })

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready && this.props.parts) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  // Updates part indices when dragging and reordering cols
  updateIndices(partArrays) {
    partArrays.forEach((arr) => {
      arr.map((part, i) => {
        Parts.collection.update(part._id, { $set: { index: i } });
      });
    });
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

    // Converts droppableIds to valid status per the PartsCollection
    const toStatusValue = id => {
      switch (id) {
      case 'todo': return 'To Do';
      case 'progress': return 'In Progress';
      case 'review': return 'For Review';
      case 'done': return 'Done';
      default:
          // do nothing
      }
    };

    // When user stops dragging (aka releases card)
    const onDragEnd = result => {
      const { source, destination, draggableId } = result;

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

        this.setState({ [source.droppableId]:items }, () => this.updateIndices([items]));

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
        }, () => this.updateIndices([output[columnA], output[columnB]]));

        // Edit part status when switching columns
        Parts.collection.update(draggableId, { $set: { status: toStatusValue(destination.droppableId) }})
      }
    };

    // Variables for filters
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

    // Get filter options for assignees that are currently in the project
    const assigneeOptions = _.uniqWith(this.props.parts.map(assignee => ({
      key: `${assignee.assignee}`,
      text: `${assignee.assignee}`,
      value: `${assignee.assignee}`,
    })), _.isEqual);

    // Filter results based on selected mechanism or assignee
    if (this.state.value !== '' || this.state.value.length !== 0) {
      for (let i = 0; i < this.state.value.length; i++) {
        if (mechOptions.some(e => e.key === this.state.value)) {
          todoParts = this.state.todo.filter(part => part.mechanism.includes(this.state.value));
          progressParts = this.state.progress.filter(part => part.mechanism.includes(this.state.value));
          reviewParts = this.state.review.filter(part => part.mechanism.includes(this.state.value));
          doneParts = this.state.done.filter(part => part.mechanism.includes(this.state.value));
        } else if (assigneeOptions.some(e => e.key === this.state.value)) {
          todoParts = this.state.todo.filter(part => part.assignee.includes(this.state.value));
          progressParts = this.state.progress.filter(part => part.assignee.includes(this.state.value));
          reviewParts = this.state.review.filter(part => part.assignee.includes(this.state.value));
          doneParts = this.state.done.filter(part => part.assignee.includes(this.state.value));
        }
      }
    }

    // Filter results based on search text
    todoParts = todoParts.filter(
      (part) => part.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1,
    );
    reviewParts = reviewParts.filter(
      (part) => part.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1,
    );
    progressParts = progressParts.filter(
      (part) => part.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1,
    );
    doneParts = doneParts.filter(
      (part) => part.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1,
    );

    return (
      <Container fluid>
        <Header as='h1' textAlign='center' style={{ paddingTop: '15px', color: 'white' }}>Project</Header>
        <DragDropContext onDragEnd={onDragEnd}>
          <Card.Group centered>
            <SearchFilters
              onChange={this.handleSearch.bind(this)}
              mechOptions={mechOptions}
              callbackfn={opt => (
                <Form.Checkbox
                  key={opt.key}
                  label={opt.text}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={this.handleChange}
                />
              )}
              assigneeOptions={assigneeOptions}
              onClick={this.handleSearchClear}/>
            <Card>
              <Card.Content>
                <Card.Header>
                  <Grid>
                    <Grid.Row>
                      <Grid.Column floated="left" width={11}>
                        To Do
                      </Grid.Column>
                      {this.props.currentUser ?
                      (<Grid.Column floated="left" >
                        <Button 
                          as={NavLink}
                          to='add'
                          size='mini'
                          icon='plus' />
                      </Grid.Column>) : ''}
                    </Grid.Row>
                  </Grid>
                </Card.Header>
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
                <Card.Header style={{ marginBottom: '0.5rem' }}>In Progress</Card.Header>
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
                <Card.Header style={{ marginBottom: '0.5rem' }}>For Review</Card.Header>
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
                <Card.Header style={{ marginBottom: '0.5rem' }}>Done (Advisor Only)</Card.Header>
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
      </Container >
    );
  }
}

ProjectBoard.propTypes = {
  currentUser: PropTypes.bool.isRequired,
  parts: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

const Project = withTracker(() => {
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

export default withRouter(Project);
