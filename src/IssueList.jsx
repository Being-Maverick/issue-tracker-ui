import React from 'react';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import withToast from './withToast.jsx';
import store from './store.js';
import graphQLFetch from './graphQLFetch.js';
import URLSearchParams from 'url-search-params';
import { LinkContainer } from 'react-router-bootstrap';
import { Panel, Button, Pagination } from 'react-bootstrap';

const SECTION_SIZE = 5;

function PageLink({params, page, activePage, children}){
  params.set('page', page);
  if(page === 0){
    return React.cloneElement(children, {disabled: true});
  }
  return(
    <LinkContainer isActive={() => page === activePage} to={{search: `?${params.toString()}`}}>
    {children}
    </LinkContainer>
  );
}

class IssueList extends React.Component {

  static async fetchData(match, search, showError){
    const params = new URLSearchParams(search);
    
    const vars = { hasSelection: false, selectedId: 0};
    if (params.get('status')) vars.status = params.get('status');
    
    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;

    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

    let page = parseInt(params.get('page'), 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    const { params : {id} } = match;
    const idInt = parseInt(id, 10);
    if(!Number.isNaN(idInt)){
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }

    const query = `query issueList(
      $status: StatusType
      $effortMin: Int
      $effortMax: Int
      $hasSelection: Boolean!
      $selectedId: Int!
      $page: Int
      ){
          issueList (
            status: $status
            effortMin: $effortMin
            effortMax: $effortMax
            page: $page
            ){
              issues{
                id title status owner
                created effort due
              }
              pages
        }
        issue(id: $selectedId) @include (if: $hasSelection){
          id description
        }
      }`;
      
    const data = await graphQLFetch(query, vars, showError);  
    return data;
  }

  constructor(props) {
    super();
    const initialData = store.initialData || { issueList: {} };
    const {
      issueList: { issues, pages }, issue: selectedIssue,
    } = initialData;
    delete store.initialData;
    this.state = {
      issues,
      selectedIssue,
      pages
    };
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
  }

  componentDidUpdate(prevProps){
    const { location : { search: prevSearch }, match : { params : {id: prevId}}} = prevProps;
    const { location : { search }, match : {params : {id}}} = this.props;

    if(prevSearch !== search || prevId !== id){
      this.loadData();
    }
  }

  componentDidMount() {
    if(this.state.issues == null)
    this.loadData();
  }

  async closeIssue(index){
    const query = `mutation issueClose($id: Int!){
      issueUpdate(id: $id, changes: { status: Closed }){
        id title status owner
        effort created due description
      }
    }`;

    const {showError} = this.props;
    const { issues } = this.state;
    const data = await graphQLFetch(query, {id: issues[index].id}, showError);
    if(data){
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        newList[index] = data.issueUpdate;
        return { issues: newList }
      });
    } else {
      this.loadData();
    }
  }

  async loadData() {
    const { location: { search }, match, showError} = this.props;
    const data = await IssueList.fetchData(match, search, showError);
    if (data) {
      this.setState({ issues: data.issueList.issues, selectedIssue: data.issue, pages: data.issueList.pages });
    }
  }

  async deleteIssue(index){
    const query = `mutation issueDelete($id: Int!){
      issueDelete(id: $id)
    }`;

    const { issues } = this.state;
    const { location : { pathname, search }, history, showError, showSuccess } = this.props;
    const { id } = issues[index];
    const data = await graphQLFetch(query, { id }, showError);
    if(data && data.issueDelete){
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        if(pathname === `/issues/${id}`){
          history.push({pathname: '/issues', search});
        }
        newList.splice(index, 1);
        return { issues: newList };
      });
      const undoMessage = (
        <span>
          {`Deleted issue ${id} successfully.`}
          <Button bsStyle="link" onClick={() => this.restoreIssue(id)}>
            UNDO
          </Button>
        </span>
      );
      showSuccess(undoMessage);
    }else{
      this.loadData();
    }
  }

  async restoreIssue(id) {
    const query = `mutation issueRestore($id: Int!) {
      issueRestore(id: $id)
    }`;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(query, { id: parseInt(id) }, showError);
    if (data) {
      showSuccess(`Issue ${id} restored successfully.`);
      this.loadData();
    }
  }

  render() {
    const { issues, selectedIssue, pages } = this.state;
    if(issues == null){
      return null;
    }

    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    let page = parseInt(params.get('page'), 10);
    if (Number.isNaN(page)) page = 1;
    const startPage = Math.floor((page - 1) / SECTION_SIZE) * SECTION_SIZE + 1;
    const endPage = startPage + SECTION_SIZE - 1;
    const prevSection = startPage === 1 ? 0 : startPage - SECTION_SIZE;
    const nextSection = endPage >= pages ? 0 : startPage + SECTION_SIZE;
    const items = [];
    for (let i = startPage; i <= Math.min(endPage, pages); i += 1) {
    params.set('page', i);
    items.push((
      <PageLink key={i} params={params} activePage={page} page={i}>
        <Pagination.Item>{i}</Pagination.Item>
      </PageLink>
    ));
    }
    return (
      <React.Fragment>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible> <IssueFilter urlBase="/issues"/> </Panel.Body>
        </Panel>
        <IssueTable issues={this.state.issues} closeIssue={this.closeIssue} deleteIssue={this.deleteIssue}/>
        <IssueDetail issue={selectedIssue}/>
        <Pagination>
          <PageLink params={params} page={prevSection}>
            <Pagination.Item>{'<'}</Pagination.Item>
          </PageLink>
          {
            items
          }
          <PageLink params={params} page={nextSection}>
            <Pagination.Item>{'>'}</Pagination.Item>
          </PageLink>
        </Pagination>
      </React.Fragment>
    );
  }
}
  
const IssueListWithToast = withToast(IssueList);
IssueListWithToast.fetchData = IssueList.fetchData;

export default IssueListWithToast;