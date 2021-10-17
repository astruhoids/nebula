import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, CardContent, Container, Header } from 'semantic-ui-react';

const getItems = (count, offset = 0) => Array.from({ length: count }, (v, k) => k).map(k => ({
  id: `item-${k + offset}`,
  content: `item ${k + offset}`,
}));

// a little function to help us with reordering the result
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

  state = {
    items: getItems(10),
    selected: getItems(5, 10),
  };

  id2List = {
    droppable: 'items',
    droppable2: 'selected',
  };

  getList = id => this.state[this.id2List[id]];

  onDragEnd = result => {
    const { source, destination } = result;

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

      if (source.droppableId === 'droppable2') {
        state = { selected: items };
      }

      this.setState(state);
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination,
      );

      this.setState({
        items: result.droppable,
        selected: result.droppable2,
      });
    }
  };

  render() {
    const list = [
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

    return (
      <Container>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Card.Group>
            <Card>
              <Card.Content>
                <Card.Header>To Do</Card.Header>
              </Card.Content>
              <Card.Content className='cardPanel'>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                    >
                      {this.state.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card>
                                <Card.Content>
                                  <Card.Header>{item.id}</Card.Header>
                                </Card.Content>
                                <Card.Content>
                                  {item.content}
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
                <Card.Header>In Progress</Card.Header>
              </CardContent>
              <Card.Content className='cardPanel'>
                <Droppable droppableId="droppable2">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                    >
                      {this.state.selected.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card>
                                <Card.Content>
                                  <Card.Header>{item.id}</Card.Header>
                                </Card.Content>
                                <Card.Content>
                                  {item.content}
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
