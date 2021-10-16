import React from 'react';
import { Card, Container, Header } from 'semantic-ui-react';

class ProjectBoard extends React.Component {
  // Issue that is currently being dragged around the screen
  dragging = (e) => {
    // Ensuring it's a proper issue
    if ((/issue\d+/g).test(e.target.id)) {
      e.dataTransfer.setData('text', e.target.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  // When the issue has been dropped in one of the valid drop-fields
  dropped(e) {
    e.preventDefault();
    // Retrieving the content of the issue being dropped
    const location = e.dataTransfer.getData('text');
    if ((/(todo|progress|done)/g).test(e.target.id)) {
      // Appending the issue at the end of the drop-fields childrens
      // eslint-disable-next-line no-undef
      e.target.appendChild(document.getElementById(location));
    }
  }

  // When an issue is dragged over a valid drop-field
  draggedOver(e) {
    e.preventDefault();
    // Setting dropEffect to move so the issues is able to move
    e.dataTransfer.dropEffect = 'move';
  }

  render() {
    return (
      <Container>
        <Header as="h1" textAlign="center">Project Board</Header>
        <Card.Group centered stackable>
          <Card>
            <Card.Header>To-Do</Card.Header>
            <Card.Content
              id='todo'
              className='cardPanel'
              onDragOver={(e) => this.draggedOver(e)}
              onDrop={(e) => {
                this.dropped(e);
              }}
            >
              <Card
                id='issue1'
                draggable
                onDragStart={(e) => this.dragging(e)}
              >
                <Card.Content>
                  <Card.Header>Issue 1</Card.Header>
                </Card.Content>
                <Card.Content>
                  Stuff
                </Card.Content>
              </Card>
              <Card
                id='issue2'
                draggable
                onDragStart={(e) => this.dragging(e)}
              >
                <Card.Content>
                  <Card.Header>Issue 2</Card.Header>
                </Card.Content>
                <Card.Content>
                  Stuff
                </Card.Content>
              </Card>
              <Card
                draggable
                id='issue3'
                onDragStart={(e) => this.dragging(e)}
              >
                <Card.Content>
                  <Card.Header>Issue 3</Card.Header>
                </Card.Content>
                <Card.Content>
                  Stuff
                </Card.Content>
              </Card>
              <Card
                draggable
                id='issue4'
                onDragStart={(e) => this.dragging(e)}
              >
                <Card.Content>
                  <Card.Header>Issue 4</Card.Header>
                </Card.Content>
                <Card.Content>
                  Stuff
                </Card.Content>
              </Card>
              <Card
                draggable
                id='issue5'
                onDragStart={(e) => this.dragging(e)}
              >
                <Card.Content>
                  <Card.Header>Issue 5</Card.Header>
                </Card.Content>
                <Card.Content>
                  Stuff
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>In Progress</Card.Header>
            <Card.Content
              id='progress'
              className='cardPanel'
              onDragOver={(e) => this.draggedOver(e)}
              onDrop={(e) => {
                this.dropped(e);
              }}
            >
              {/* Content */}
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>Completed</Card.Header>
            <Card.Content
              id='done'
              className='cardPanel'
              onDragOver={(e) => this.draggedOver(e)}
              onDrop={(e) => {
                this.dropped(e);
              }}
            >
              {/* Content */}
            </Card.Content>
          </Card>
        </Card.Group>
      </Container>
    );
  }

}

export default ProjectBoard;
