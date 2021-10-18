import React from 'react';
import { Meteor } from 'meteor/meteor';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, CardContent, Container, Header, Progress, Loader, Form } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
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

  list = [
    {
      id: 'issue1',
      header: 'issue1',
      text: 'stuff',
    },
    {
      id: 'issue2',
      header: 'issue2',
      text: 'stuff',
    },
    {
      id: 'issue3',
      header: 'issue3',
      text: 'stuff',
    },
    {
      id: 'issue4',
      header: 'issue4',
      text: 'stuff',
    },
    {
      id: 'issue5',
      header: 'issue5',
      text: 'stuff',
    },
  ];

  state = {
    value: '',
    search: '',
    todo: this.list,
    progress: [
      {
        id: 'test1',
        header: 'test1',
        text: 'test1',
      },
      {
        id: 'test3',
        header: 'test3',
        text: 'test3',
      },
    ],
    done: [
      {
        id: 'test2',
        header: 'test2',
        text: 'test2',
      },
    ],
  };

  idList = {
    todo: 'todo',
    progress: 'progress',
    done: 'done',
  };

  totalIssues = _.sum([this.state.todo.length, this.state.progress.length, this.state.done.length])

  // Grabbing list based on the id
  getList = id => this.state[this.idList[id]];

  // When user stops dragging (aka releases card)
  onDragEnd = result => {
    const { source, destination } = result;

    // Card dropped in an invalid location
    if (!destination) {
      return;
    }

    // Card was dropped in the same column it came from
    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index,
      );

      // Setting the reordered list to be the new list
      // By default it checks the todo column
      let state = { items };

      if (source.droppableId === 'progress') {
        state = { progress: items };
      } else if (source.droppableId === 'done') {
        state = { done: items };
      }

      this.setState({ state });

      // Card is placed in a different column from origin
    } else {
      // Recording column source and destination names
      const columnA = source.droppableId;
      const columnB = destination.droppableId;

      // Calling move to actually move the cards around
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination,
      );

      // Based on which columns were affected, update dynamically with the cards moved
      this.setState({

        [columnA]: result[columnA],
        [columnB]: result[columnB],
      });
    }
  };

  handleSearch = (e, { value }) => this.setState({ value })

  updateSearch(e) {
    this.setState({ search: e.target.value });
  }

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  // render() {
  //   return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  // }

  render() {
    const { value } = this.state;

    const options = [
      { key: 'assignee', text: 'Assignee', value: 'assignee' },
      { key: 'mechanism', text: 'Mechanism', value: 'mechanism' },
      { key: 'designer', text: 'Designer', value: 'designer' },
    ];

    const partsToDo = _.filter(this.props.parts, (part => part.progress === 'To Do'));
    this.setState({ todo: this.state.todo.concat(partsToDo) });
    console.log(this.state.todo.concat(partsToDo));

    return (
      <Container>
        <Header as='h1' textAlign='center' style={{ paddingTop: '15px', color: 'white' }}>Project</Header>
        <Form size='large'>
          <Form.Group widths='equal'>
            <Form.Select
              placeholder='Select Filter'
              value={value}
              onChange={this.handleSearch}
              options={options}
            />
            <Form.Input
              onChange={this.updateSearch.bind(this)}
              name='search'
              className='icon'
              icon='search'
              placeholder='Search Parts'
            />
          </Form.Group>
        </Form>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Card.Group className='cardGroup'>
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
                      {this.state.todo.map((id, index) => (
                        <Draggable
                          key={id}
                          draggableId={id}
                          index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard key={id} part={id} />
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
                  percent={((this.state.todo.length / this.totalIssues) * 100).toFixed(1)}
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
                      {this.state.progress.map(({ id, header, text }, index) => (
                        <Draggable
                          key={id}
                          draggableId={id}
                          index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card>
                                <Card.Content>
                                  <Card.Header>{header}</Card.Header>
                                </Card.Content>
                                <Card.Content>
                                  {text}
                                </Card.Content>
                              </Card>
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
                  percent={((this.state.progress.length / this.totalIssues) * 100).toFixed(1)}
                  progress warning
                />
              </Card.Content>
            </Card>
            <Card>
              <CardContent>
                <Card.Header>Done</Card.Header>
              </CardContent>
              <Card.Content className='cardPanel'>
                <Droppable droppableId='done'>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      style={{ height: '400px' }}
                    >
                      {this.state.done.map(({ id, header, text }, index) => (
                        <Draggable
                          key={id}
                          draggableId={id}
                          index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card>
                                <Card.Content>
                                  <Card.Header>{header}</Card.Header>
                                </Card.Content>
                                <Card.Content>
                                  {text}
                                </Card.Content>
                              </Card>
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
                  percent={((this.state.done.length / this.totalIssues) * 100).toFixed(1)}
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
  parts: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe(Parts.userPublicationName);
  const ready = subscription.ready();
  const parts = Parts.collection.find({}).fetch();
  return {
    parts,
    ready,
  };
})(ProjectBoard);
