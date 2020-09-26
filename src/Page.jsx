import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Grid, Col, Navbar, Nav, NavDropdown, NavItem, Glyphicon, MenuItem } from 'react-bootstrap';
import Contents from './Contents.jsx';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import Select from './Select.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import UserContext from './UserContext.js';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';

function NavigationBar({ user, onUserChange }){
    return (
        <Navbar>
            <Navbar.Header>
                <Navbar.Brand>Issue Tracker</Navbar.Brand>
            </Navbar.Header>
            <Nav>
                <LinkContainer exact to="/">
                    <NavItem>Home</NavItem>
                </LinkContainer>
                <LinkContainer to="/issues">
                    <NavItem>Issues</NavItem>
                </LinkContainer>
                <LinkContainer to="/report">
                    <NavItem>Report</NavItem>
                </LinkContainer>
            </Nav>
            <Col sm={5}>
                <Navbar.Form>
                    <Select/>
                </Navbar.Form>
            </Col>
            <Nav pullRight>
                <IssueAddNavItem user={user}/>
                <SignInNavItem user={user} onUserChange={onUserChange}/>
                <NavDropdown id="user-dropdown" title={<Glyphicon glyph="option-vertical"/>} noCaret>
                    <LinkContainer to="/about">
                        <MenuItem>About</MenuItem>
                    </LinkContainer>
                </NavDropdown>
            </Nav>
        </Navbar>
    );
}

function Footer(){
    return (
        <small>
            <hr />
            <p className="text-center">
                Link to
                {' '}
                <a href="">
                    Github Repository
                </a>
            </p>
        </small>
    )
}

export default class Page extends React.Component{

    constructor(props) {
        super();
        const user = store.userData ? store.userData.user : null;
        delete store.userData
        this.state = { user };
        this.onUserChange = this.onUserChange.bind(this);
    }

    static async fetchData(cookie){
        const query = `query { user {
            signedIn givenName
        }}`;
        const data = await graphQLFetch(query, null, null, cookie);
        return data;
    }

    async componentDidMount() {
        const { user } = this.state;
        if(user == null){
            const data = await Page.fetchData();
            this.setState({user: data.user});
        }
    }

    onUserChange(user) {
        this.setState({ user });
    }

    render(){
        const { user } = this.state;
        if(user == null) return null;
        return (
            <div>
                <NavigationBar user={user} onUserChange={this.onUserChange}/>
                <Grid fluid>
                    <UserContext.Provider value={user}>
                        <Contents/>
                    </UserContext.Provider>
                </Grid>
                <Footer/>
            </div>
        );
    }
}