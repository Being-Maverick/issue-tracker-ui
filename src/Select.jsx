import React from 'react';
import SelectAsync from 'react-select/lib/Async';
import { withRouter } from 'react-router-dom';

import graphQLFetch from './graphQLFetch.js';
import withToast from './withToast.jsx';

class Select extends React.Component{
    constructor(props){
        super();
        this.onChangeSelection = this.onChangeSelection.bind(this);
        this.loadOptions = this.loadOptions.bind(this);
    }

    onChangeSelection({value}){
        const { history } = this.props;
        history.push(`/edit/${value}`);
    }

    async loadOptions(term){
        if(term.length < 3){
            return [];
        }

        const query = `query issueList($search: String){
            issueList(search: $search){
                issues { id title }
            }
        }`;

        const { showError } = this.props;
        const data = await graphQLFetch(query, { search: term }, showError);
        return data.issueList.issues.map(issue => {
            return {
                label: `#${issue.id}: ${issue.title}`,
                value: issue.id
            }
        });
    }

    render(){
        return (
            <SelectAsync
            instanceId="search-select"
            value=""
            loadOptions={this.loadOptions}
            filterOptions={() => true}
            onChange={this.onChangeSelection}
            components={{DrpodownIndicator: null}}
            />
        )
    }
}

export default withRouter(withToast(Select));