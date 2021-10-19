import React from 'react';
import { Button, Card, CardContent, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';

/** Is shown on the project page. Card to display search options */
class SearchFilters extends React.Component {
  render() {
    return (
      <Card>
        <CardContent>
          <Form>
            <Form.Group grouped>
              <Form.Input
                onChange={this.props.onChange}
                name="search"
                className="icon"
                icon="search"
                placeholder="Search Parts"
              />
              <label>Mechanism</label>
              {this.props.mechOptions.map(this.props.callbackfn)}
              <label>Assigned to...</label>
              {this.props.assigneeOptions.map(this.props.callbackfn)}
            </Form.Group>
          </Form>
        </CardContent>
        <Card.Content extra>
          <Button
            basic
            color="red"
            fluid
            icon="delete"
            size="tiny"
            content="Clear Search Filters"
            onClick={this.props.onClick}
          />
        </Card.Content>
      </Card>
    );
  }
}

SearchFilters.propTypes = {
  onChange: PropTypes.any,
  mechOptions: PropTypes.arrayOf(PropTypes.any),
  callbackfn: PropTypes.func,
  assigneeOptions: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func,
};

export default SearchFilters;
