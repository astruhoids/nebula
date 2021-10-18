import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Grid, Header, Image, Button, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

/** After the user clicks the "Signout" link in the NavBar, log them out and display this page. */
export default class Signout extends React.Component {
  render() {
    Meteor.logout();
    return (
      <Container>
        <Grid textAlign="center" verticalAlign="middle" style={{ height: '75vh' }} centered columns={2}>
          <Grid.Column>
            <Segment stacked>
              <Image src='images/nebula-logo.png' centered />
              <Header as="h2" textAlign="center" style={{ paddingBottom: '25px' }}>
                You are signed out
              </Header>
              <Link to="/signin">
                <Button fluid content="Log Back In" style={{ backgroundColor: '#3c78d8', color: '#FFFFFF' }}/>
              </Link>
            </Segment>
          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}
