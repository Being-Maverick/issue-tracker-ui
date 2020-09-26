import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';

export default class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.issueAdd;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      due: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000),
    };
    this.props.createIssue(issue);
    form.owner.value = ''; form.title.value = '';
  }

  render() {
    return (
      <Form inline name="issueAdd" onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Owner: </ControlLabel>
          {' '}
          <FormControl type="text" name="owner"/>
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Title: </ControlLabel>
          {' '}
          <FormControl type="text" name="title"/>
        </FormGroup>
        {' '}
        <Button bsStyle="primary" type="submit">Add</Button>
      </Form>
    );
  }
}
