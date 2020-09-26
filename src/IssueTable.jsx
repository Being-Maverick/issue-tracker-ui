import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button, Glyphicon, Tooltip, OverlayTrigger, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import UserContext from './UserContext.js';

class IssueRowPlain extends React.Component {

  onClose(e) {
    const {closeIssue, index} = this.props;
    e.preventDefault();
    closeIssue(index);
  }
    
  onDelete(e) {
    const {deleteIssue, index} = this.props;
    e.preventDefault();
    deleteIssue(index);
  }

  render(){
    const {
      issue, location: { search },
    } = this.props;
    const user = this.context;
    const disabled = !user.signedIn;
    const selectLocation = { pathname: `/issues/${issue.id}`, search };
    const closeTooltip = (
      <Tooltip id="close-tooltip" placement="top">Close Issue</Tooltip>
    );

    const deleteTooltip = (
      <Tooltip id="delete-tooltip" placement="top">Delete Issue</Tooltip>
    );

    const editTooltip = (
      <Tooltip id="edit-tooltip" placement="top">Edit Issue</Tooltip>
    );

    const tableRow = (
        <tr>
          <td>{issue.id}</td>
          <td>{issue.status}</td>
          <td>{issue.owner}</td>
          <td>{issue.created.toDateString()}</td>
          <td>{issue.effort}</td>
          <td>{issue.due ? issue.due.toDateString() : ' '}</td>
          <td>{issue.title}</td>
          <td>
            <LinkContainer to={`/edit/${issue.id}`}>
              <OverlayTrigger delayShow={1000} overlay={editTooltip}>
                <Button bsSize="small">
                  <Glyphicon glyph="edit"/>
                </Button>
              </OverlayTrigger>
            </LinkContainer>
            {'  '}
            <OverlayTrigger delayShow={1000} overlay={closeTooltip}>
              <Button disabled={disabled} bsSize="small" onClick={this.onClose}> <Glyphicon glyph="remove"/> </Button>
            </OverlayTrigger>
            {'  '}
            <OverlayTrigger delayShow={1000} overlay={deleteTooltip}>
              <Button disabled={disabled} bsSize="small" onClick={this.onDelete}> <Glyphicon glyph="trash"/> </Button>
            </OverlayTrigger>
          </td>
        </tr>
      );

      return (
        <LinkContainer to={selectLocation}>
          {tableRow}
        </LinkContainer>
      )
  }
}

IssueRowPlain.contextType = UserContext;
const IssueRow = withRouter(IssueRowPlain);
delete IssueRow.contextType;

export default class IssueTable extends React.Component {
  render() {
    const issueRows = this.props.issues.map((issue, idx) => <IssueRow issue={issue} key={idx} closeIssue={this.props.closeIssue} deleteIssue={this.props.deleteIssue} index={idx} />);
    return (
      <Table bordered condensed hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
            <th>Effort</th>
            <th>Due Date</th>
            <th>Title</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
                    issueRows
                }
        </tbody>
      </Table>
    );
  }
}
