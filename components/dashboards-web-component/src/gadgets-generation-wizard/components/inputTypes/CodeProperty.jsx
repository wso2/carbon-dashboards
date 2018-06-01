/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from 'react';
// Ace Editor Components
import AceEditor from 'react-ace';
import 'brace/mode/sql';
import 'brace/mode/text';
import 'brace/theme/tomorrow_night_eighties';

const styles = {
    aceWrapper: {
        position: 'relative',
        float: 'left',
        width: '50%'
    },
    aceEditor: {
        theme: 'tomorrow_night_eighties',
        fontSize: 18,
    },

};

/**
 * Represents a property that refers to given meta data from stream, for its value
 */
class CodeProperty extends React.Component {
    constructor() {
        super();
        this.state = {
            isFocused: false,
        }
    }

    getLabelStyle() {
        return {
            fontSize: (12),
            color: (this.state.isFocused ? '#0097A7' : '#FFFFFF'),
            opacity: (this.state.isFocused ? 1 : 0.3),
        };
    }

    render() {
        return (
            <div>
                <div style={{marginBottom: 10}}>
                    <a style={this.getLabelStyle()}>
                        {(this.props.fieldName) ? (this.props.fieldName) : (null)}
                    </a>
                </div>
                <AceEditor
                    mode={this.props.mode}
                    name={this.props.id}
                    theme={this.props.theme ? this.props.theme : styles.aceEditor.theme}
                    fontSize={styles.aceEditor.fontSize}
                    wrapEnabled={false}
                    onChange={content => this.props.onChange(this.props.id, content)}
                    onFocus={() => this.setState({isFocused: true})}
                    onBlur={() => this.setState({isFocused: false})}
                    value={this.props.value}
                    showPrintMargin={false}
                    highlightActiveLine={this.state.isFocused}
                    showGutter={false}
                    width="100%"
                    height={200}
                    tabSize={3}
                    useSoftTabs="true"
                    editorProps={{
                        $blockScrolling: Infinity,
                        display_indent_guides: true,
                        folding: "markbeginandend"
                    }}
                    setOptions={{
                        cursorStyle: "smooth",
                        wrapBehavioursEnabled: true
                    }}
                />
            </div>
        );
    }
}

export default CodeProperty;
