import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Button, Container } from 'semantic-ui-react';

/** A simple static component to render some text for the landing page. */
class Landing extends React.Component {
  render() {
    return (
      <Container fluid>
        <Grid verticalAlign='middle' textAlign="center" className="landing-page">
          <Grid.Column>
            <h3 className="landing-header2">Manage Your Projects With</h3>
            <h1 className="landing-header1">Nebula</h1>
            <Link to='/signin'>
              <Button size='huge' className="landing-page-button">Get Started</Button>
            </Link>
          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}

export default Landing;
