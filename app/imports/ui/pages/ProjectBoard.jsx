import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, CardContent, Container, Header } from 'semantic-ui-react';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  
  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

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

  getList = id => this.state[this.idList[id]];

  onDragEnd = result => {
    const { source, destination } = result;
    console.log(source);
    console.log(destination);

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index,
      );

      let state = { items };
      console.log(state);

      if (source.droppableId === 'progress') {
        state = { progress: items };
      } else if (source.droppableId === 'done') {
        state = { done: items };
      }

      this.setState(state);

    } else {
      const columnA = source.droppableId;
      const columnB = destination.droppableId;

      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination,
      );

      this.setState({
        [columnA]: result.[columnA],
        [columnB]: result.[columnB],
      });
    }
  };

  render() {
    return (
      <Container>
        <Header as='h1' textAlign='center'>Project</Header>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Card.Group textAlign='center'>
            <Card>
              <Card.Content>
                <Card.Header>To Do</Card.Header>
              </Card.Content>
              <Card.Content className='cardPanel'>
                <Droppable droppableId="todo">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                    >
                      {provided.placeholder}
                      {this.state.todo.map(({ id, header, text }, index) => (
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
                    </div>
                  )}
                </Droppable>
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
            </Card>
          </Card.Group>
        </DragDropContext>
      </Container>
    );
  }

}

export default ProjectBoard;
