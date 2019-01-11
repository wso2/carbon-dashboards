/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import { MuiThemeProvider, TextField,FloatingActionButton} from 'material-ui';
import ContentAdd from 'material-ui/svg-icons/content/add';
import WidgetStoreCard from './components/WidgetStoreCard';
import defaultTheme from '../utils/Theme';
import WidgetAPI from '../utils/apis/WidgetAPI';
import WidgetStoreHeader from './components/WidgetStoreHeader';


const styles = {
    generatedWidgetWrapper: {
        height: '34vh',
        marginLeft: '18px',
        overflow: 'hidden'
    },
    customWidgetWrapper: {
        height: '34vh',
        marginLeft: '18px',
        overflow: 'hidden'
    },
    expandGeneratedWrapper: {
        height: '100%',
        width: '99%',
        marginLeft: '18px,'
    },
    expandCustomWrapper: {
        height: '100%',
        width: '99%',
        marginLeft: '18px'
    },
    widgetType: {
        height: '0.5vh'
    },
    widgetTypeText: {
        fontSize: '20px',
        fontFamily: 'Roboto, sans-serif',
        color: 'white',
        display: 'block',
        marginInlineStart: '29px',
        marginTop: '20px'
    },
    generatedWidgetTypeText: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    text: {
        display: 'inline',
        fontSize: '0.8em',
        fontFamily: 'Roboto, sans-serif',
        float: 'right',
        marginRight: '42px',
        cursor: 'pointer',
        color: '#b2babb '
    },
    actionButton: {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
    },
};

/**
 * Widget Store
 */
export default class WidgetStore extends Component {
    /**
     * Constructor.
     */
    constructor(props) {
        super(props);
        this.widgets = null;
        this.state = {
            viewGeneratedWidgets: false,
            viewCustomWidgets: false,
            error: false,
            filter: null,
            widgets: {
                all: [],
                generated: [],
                custom: [],
            },
        };
        this.retrieveWidgets = this.retrieveWidgets.bind(this);
        this.filterWidgets = this.filterWidgets.bind(this);
    }

    /**
     * Retrieve widgets from the widget repository.
     */
    componentDidMount() {
        this.retrieveWidgets();
    }

    handleWidgets(widget) {
        return widget.configs.isGenerated ? 'generated' : 'custom';
    }

    /**
     * Retrieve widgets from the widget repository.
     */
    retrieveWidgets() {
        const widgets = {
            all: [],
            generated: [],
            custom: [],
        };

        WidgetAPI.getWidgets()
            .then((response) => {
                response.data.forEach((element) => {
                    widgets.all.push(
                        <WidgetStoreCard key={element.id} widget={element}/>,
                    );
                    widgets[this.handleWidgets(element)].push(
                        <WidgetStoreCard key={element.id} widget={element}/>,
                    );
                });
                widgets.generated.sort((widgetA, widgetB) => {
                    return widgetA.props.widget.name.toLowerCase() < widgetB.props.widget.name.toLowerCase() ? -1 : 1;
                });
                widgets.custom.sort((widgetA, widgetB) => {
                    return widgetA.props.widget.name.toLowerCase() < widgetB.props.widget.name.toLowerCase() ? -1 : 1;
                });
                this.setState({widgets});
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * Search widgets from the widget repository.
     */
    filterWidgets(filterName) {
        const {widgets} = this.state;
        const filteredWidgets = {
            all: [],
            generated: [],
            custom: [],
        };
        const allwidgets = this.state.widgets.all;
        allwidgets.forEach((widget) => {
            const element = widget.props.widget;
            filteredWidgets.all.push(
                <WidgetStoreCard key={element.id} widget={element}/>,
            );
            if (!(filterName && filterName.length > 0 &&
                element.name.toLowerCase().indexOf(filterName.toLowerCase()) === -1)) {
                filteredWidgets[this.handleWidgets(element)].push(
                    <WidgetStoreCard key={element.id} widget={element}/>,
                );
            }
        });
        widgets.generated = filteredWidgets.generated;
        widgets.custom = filteredWidgets.custom;
        widgets.all = filteredWidgets.all;
        this.setState({widgets: filteredWidgets, filter: filterName});
    }

    /**
     * Renders the WidgetStore.
     *
     * @return {XML} HTML content
     */

    render() {
        return (
            <MuiThemeProvider muiTheme={defaultTheme}>
                <WidgetStoreHeader showPortalButton/>
                <div style={styles.generatedWidgetTypeText}>
                    <span style={{float: 'left'}}>
                        <label style={styles.widgetTypeText}>
                            <FormattedMessage
                                id="generated.widgets"
                                defaultMessage="Generated Widgets"
                            />
                        </label>
                    </span>
                    <span style={{float: 'right', paddingRight: '36px'}}>
              <div>
                <TextField
                    style={{ width: '232px' }}
                    hintStyle={{color: 'darkgrey'}}
                    hintText={
                        <FormattedMessage
                            id="search.hint.text"
                            defaultMessage="Search..."
                        />
                    }
                    value={this.state.filter}
                    onChange={event => this.filterWidgets(event.target.value)}
                />
                        </div>
                    </span>
                </div>
                <div
                    style={this.state.viewGeneratedWidgets ? styles.expandGeneratedWrapper : styles.generatedWidgetWrapper}>
                    {this.state.widgets.generated}
                </div>
                <div style={styles.widgetType}>
                    <p
                        onClick={() => this.setState({viewGeneratedWidgets: !this.state.viewGeneratedWidgets})}
                        style={styles.text}
                    >
                        {this.state.widgets.generated.length > 21 &&
                        (this.state.viewGeneratedWidgets ?
                            (<FormattedMessage id="see.less" defaultMessage="See Less"/>) :
                            (<FormattedMessage id="see.more" defaultMessage="See More"/>))}
                    </p>
                </div>
                <div>
                    <label style={styles.widgetTypeText}>
                        <FormattedMessage
                            id="custom.widgets"
                            defaultMessage="Custom Widgets"
                        />
                    </label>
                </div>
                <div style={this.state.viewCustomWidgets ? styles.expandCustomWrapper : styles.customWidgetWrapper}>
                    {this.state.widgets.custom}
                </div>
                <p
                    onClick={() => this.setState({viewCustomWidgets: !this.state.viewCustomWidgets})}
                    style={styles.text}
                >
                    {this.state.widgets.custom.length > 21 &&
                    (this.state.viewCustomWidgets ?
                        (<FormattedMessage id="see.less" defaultMessage="See Less"/>) :
                        (<FormattedMessage id="see.more" defaultMessage="See More"/>))}
                </p>
                   <span style={styles.actionButton} title="Create Widget">
                      <FloatingActionButton onClick={() => this.props.history.push("/createGadget")}>
                        <ContentAdd/>
                      </FloatingActionButton>
                   </span>
            </MuiThemeProvider>
        );
    }
}
