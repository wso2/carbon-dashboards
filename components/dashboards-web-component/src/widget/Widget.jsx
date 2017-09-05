import React, { Component } from 'react';

export default class Widget extends Component {
    constructor() {
        super();
        this.getDashboardAPI = this.getDashboardAPI.bind(this);
    }

    render () {
        return (
            <div>  
                {this.renderWidget()}
            </div>
        );
    }

    /**
     * Returns the dashboards API functions.
     */
    getDashboardAPI() {
        let that = this;
        function getStateObject() {
            // De-serialize the object in suitable format
            return (window.location.hash === '' || window.location.hash === '#') ? 
                {} : JSON.parse(window.location.hash.substr(1));   
        }

        function setStateObject(state) {
            // Serialize the object in suitable format
            window.location.hash = JSON.stringify(state);
        }

        function getLocalState() {
            let allStates = getStateObject();
            return allStates.hasOwnProperty(that.props.id) ? allStates[that.props.id] : {};
        }

        function setLocalState(state) {
            let allStates = getStateObject();
            allStates[that.props.id] = state;
            setStateObject(allStates);
        } 

        return {
            state: {
                get: function(key) {
                    let state = getLocalState();
                    return state.hasOwnProperty(key) ? state[key] : null; 
                },
                set: function(key, value) {
                    let state = getLocalState();
                    state[key] = value;
                    setLocalState(state);
                }
            }
        };
    }
}