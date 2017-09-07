import React, { Component } from 'react';
import Widget from './Widget'

/**
 * This class depicts how the basic functions of widget state persistence works.
 */
class WidgetState extends Widget {
    /**
     * Constructor.
     */
    constructor() {
        super();
        this.state = {
            inputVal: ''
        };
        this.btnPersistState = this.btnPersistState.bind(this);
        this.onWidgetReady = this.onWidgetReady.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {                        
        this.onWidgetReady();
    }

    /**
     * Implements the renderWidget function.
     */
    renderWidget () {
        let styles = {
            container: {
                font: '12px Roboto, sans-serif',
                color: '#fff'
            },
            button: {
                'margin-right': '10px'
            },
            logPanel: {
                'background-color': '#000',
                padding: '10px',
                color: '#ffffff',
                height: '100px'
            },
            inputBox: {
                padding: '3px',
                'margin-right': '10px'
            },
            controls: {
                'margin-bottom': '10px'
            }
        };

        return (
            <div style={styles.container}>
                <div style={styles.controls}>
                    <strong>Message: </strong><input style={styles.inputBox} type="text" id="txtMessage" 
                        value={this.state.inputVal} onChange={this.handleChange} />
                    <button style={styles.button} onClick={this.btnPersistState}>Persist State</button>
                </div>
                <div style={styles.logPanel} id="divConsole"></div>
            </div>
        );
    }

    onWidgetReady() {
        // Syntax: super.getDashboardAPI().state.get(<KEY>)
        let message = super.getDashboardAPI().state.get('message');
        if (message && message != null && message !== '') {
            document.getElementById('divConsole').innerHTML = 'Persisted message found: ' + message;
        } else {
            document.getElementById('divConsole').innerHTML = "No persisted state found";
        }
    }

    /**
     * Event handler for set state button.
     */
    btnPersistState() {
        // Syntax: super.getDashboardAPI().state.get(<KEY>, <VALUE>)
        let message = document.getElementById('txtMessage').value;
        super.getDashboardAPI().state.set('message', message);
        alert('State persisted successfully!');
    }

    handleChange(event) {
        this.setState({ inputVal: event.target.value });
        this.input = {};
        this.input.value = event.target.value;
    }
}

global.dashboard.registerWidget("WidgetState", WidgetState);