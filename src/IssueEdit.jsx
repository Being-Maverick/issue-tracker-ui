import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Col, Panel, FormControl, FormGroup, Form, ControlLabel, Button, ButtonToolbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import withToast from './withToast.jsx';
import store from './store.js';
import UserContext from './UserContext.js';

class IssueEdit extends React.Component {
    static async fetchData(match, search, showError){
        const query = `query issue($id: Int!){
            issue(id: $id){
                id title status owner
                created effort due description
            }
        }`;

        const { params: { id } } = match;
        const result = await graphQLFetch(query, { id: parseInt(id) }, showError);
        return result;
    }

    constructor(){
        super();
        const issue = store.initialData ? store.initialData.issue : null;
        delete store.initialData
        this.state = {
            issue,
            invalidFields: {},
            showingValidation: false,
        }
        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onValidityChange = this.onValidityChange.bind(this);
    }

    componentDidMount(){
        const {issue} = this.state;
        if (issue == null) this.loadData();
    }

    componentDidUpdate(prevProps){
        const prevId = prevProps.match.params.id;
        const id = this.props.match.params.id;
        if(prevId !== id){
            this.loadData();
        }
    }

    onChange(event, originalValue){
        const { name, value: textValue } = event.target;
        const value = originalValue === undefined ? textValue : originalValue;
        this.setState(prevState => ({
            issue: { ...prevState.issue, [name] : value } 
        }));
    }

    onValidityChange(event, valid) {
        const { name } = event.target;
        this.setState((prevState) => {
            const invalidFields = { ...prevState.invalidFields, [name]: !valid };
            if (valid) delete invalidFields[name];
            return { invalidFields };
        });
    }

    showValidation(){
        this.setState({showingValidation: true});
    }

    dismissValidation(){
        this.setState({showingValidation: false});
    }

    async handleSubmit(e){
        e.preventDefault();
        this.showValidation();
        const { issue, invalidFields } = this.state ;
        if(Object.keys(invalidFields).length != 0) return;

        const query = `mutation IssueUpdate($id: Int!, $changes: IssueUpdateInputs!){
            issueUpdate(id: $id, changes: $changes){
                id title status owner 
                effort created due description
            }
        }`;

        const { id, created, ...changes} = issue;
        const {showError, showSuccess} = this.props;
        const data = await graphQLFetch(query, { id, changes }, showError);
        if(data){
            this.setState({ issue: data.issueUpdate });
            showSuccess("Updated alert successfully");
        }
    }

    async loadData(){

        const { match, showError } = this.props;
        const data = await IssueEdit.fetchData(match, null, showError);
        this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
    }

    render(){
        const { issue }  = this.state;
        if(issue == null || Object.keys(issue).length == 0) return null;
        const id = this.state.issue.id;
        /* const propsId = this.props.match.params.id;
         if(id == null){
            if(propsId != null){
                return <h3>{`Issue with id ${propsId} not found`}</h3>
            }
            return null;
        } */

        const { invalidFields, showingValidation} = this.state;
        let validationMessage;

        if (Object.keys(invalidFields).length !== 0 && showingValidation) {
            validationMessage = (
                <Alert bsStyle="danger" onDismiss={() => this.dismissValidation()}>
                    Please correct invalid fields before submitting.
                </Alert>
            );
        }

        const user = this.context;
        const { title, status, created, due, effort, description, owner } = this.state.issue;
        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title> {`Editing issue: ${id}`} </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form horizontal onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Created</Col>
                            <Col sm={9}>
                                <FormControl.Static>
                                    {
                                        created.toDateString()
                                    }
                                </FormControl.Static>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Status</Col>
                            <Col sm={9}>
                                <FormControl componentClass="select" name="status" value={status} onChange={this.onChange}>
                                    <option value="New">New</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Closed">Closed</option>
                                </FormControl>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Owner</Col>
                            <Col sm={9}>
                                <FormControl componentClass={TextInput} name="owner" value={owner} onChange={this.onChange} key={id}/>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Effort</Col>
                            <Col sm={9}>
                                <FormControl componentClass={NumInput} name="effort" value={effort} onChange={this.onChange} key={id}/>
                            </Col>
                        </FormGroup>
                        <FormGroup validationState={invalidFields.due ? 'error' : null}>
                            <Col componentClass={ControlLabel} sm={3}>Due</Col>
                            <Col sm={9}>
                                <FormControl componentClass={DateInput} name="due" onValidityChange={this.onValidityChange} value={due} onChange={this.onChange} key={id}/>
                                <FormControl.Feedback/>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Title</Col>
                            <Col sm={9}>
                                    <FormControl componentClass={TextInput} name="title" value={title} onChange={this.onChange} key={id}/>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Description</Col>
                            <Col sm={9}>
                                <FormControl componentClass={TextInput} tag="textarea" name="description" value={description} rows={4} cols={50} onChange={this.onChange} key={id}/>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col smOffset={3} sm={6}>
                                <ButtonToolbar>
                                    <Button disabled={!user.signedIn} bsStyle="primary" type="submit">Submit</Button>
                                    <LinkContainer to="/issues">
                                        <Button bsStyle="link">Back</Button>
                                    </LinkContainer>
                                </ButtonToolbar>
                            </Col>
                        </FormGroup>
                    </Form>
                    <FormGroup>
                        <Col sm={9} smOffset={3}>{validationMessage}</Col>
                    </FormGroup>
                </Panel.Body>
                <Panel.Footer>
                    <Link to={`/edit/${id - 1}`}>Prev</Link>
                            {' | '}
                    <Link to={`/edit/${id + 1}`}>Next</Link>
                </Panel.Footer>
            </Panel>
        )
    }
}

IssueEdit.contextType = UserContext;

const IssueEdithWithToast = withToast(IssueEdit);
IssueEdithWithToast.fetchData = IssueEdit.fetchData;
export default IssueEdithWithToast;