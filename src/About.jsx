import React from 'react';
import store from './store.js';
import graphQLFetch from './graphQLFetch.js';

export default class About extends React.Component{
    static async fetchData(){
        const data = await graphQLFetch('query{about}');
        return data; 
    }

    constructor(props){
        super();
        const apiAbout = store.initialData ? store.initialData.about : null;
        delete store.initialData;
        this.state = {
            apiAbout
        }
    }

    async componentDidMount(){
        const { apiAbout } = this.state;
        if(apiAbout == null){
            const data = await About.fetchData();
            this.setState({apiAbout: data.about});
        }
    }
    
    render(){
        return(
            <div className="text-center">
                <h3>Issue Tracker version 1.0</h3>
                <h4>
                    {
                        this.state.apiAbout
                    }
                </h4>
            </div>
        )
    }
} 