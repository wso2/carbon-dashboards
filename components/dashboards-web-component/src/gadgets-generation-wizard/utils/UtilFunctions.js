/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/**
 * Contains utility functions related to the charts generation wizard
 */
import Types from './Types';

class UtilFunctions {
    /**
     * Checks whether a given object is empty or not
     * @param object
     * @returns {boolean}
     */
    static isEmpty(object) {
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Converts given camel case text to sentence case
     * @param text
     */
    static toSentenceCase(text) {
        let sentenceText = text.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
        return sentenceText.charAt(0).toUpperCase() + sentenceText.slice(1);
    }

    /**
     * Returns an ID out of the given text by converting to lowercase and replacing spaces with dashes
     * @param text
     * @returns {string}
     */
    static generateID(text) {
        return text.replace(/\s+/g, '-').toLowerCase();
    }

    /**
     * Returns default configuration of pre-configured H2 datasource
     * @returns {{}}
     */
    static getDefaultH2Config() {
        return {
            "datasourceName": "SAMPLE_DB",
            "queryData": {"queryFunction": "return \"select * from TRANSACTIONS_TABLE\";"},
            "tableName": "TRANSACTIONS_TABLE",
            "incrementalColumn": "CREDITCARDNO",
            "timeColumns": "",
            "publishingInterval": 1,
            "purgingInterval": 60,
            "publishingLimit": 30,
            "purgingLimit": 30,
            "isPurgingEnable": false
        }
    }

    /**
     * Returns default render types of pre-configured H2 datasource
     * @returns {{}}
     */
    static getDefaultH2RenderTypes() {
        return {
            "datasourceName": "TEXT_FIELD",
            "queryData": "DYNAMIC_SQL_CODE",
            "tableName": "TEXT_FIELD",
            "incrementalColumn": "TEXT_FIELD",
            "timeColumns": "TEXT_FIELD",
            "publishingInterval": 'NUMBER',
            "purgingInterval": 'NUMBER',
            "publishingLimit": 'NUMBER',
            "purgingLimit": 'NUMBER',
            "isPurgingEnable": 'SWITCH'
        }
    }

    /* Chart Validation & Preparation functions [START] */

    /**
     * Validates a line chart for mandatory properties
     * @param configuration
     * @returns {boolean}
     */
    static validateLineChartConfiguration(configuration) {
        // Main chart properties and number of sub charts
        if (configuration.x === '' ||
            configuration.maxLength === '' ||
            configuration.charts.length === 0) {
            return false;
        }
        // Sub chart properties
        for (const subChart of configuration.charts) {
            if (subChart.type === '' ||
                subChart.y === '') {
                return false;
            }
        }
        return true;
    }

    /**
     * Removes unfilled optional properties from the given line chart configuration
     * @param configuration
     * @returns {*}
     */
    static prepareLineChartConfiguration(configuration) {
        configuration = JSON.parse(JSON.stringify(configuration));
        // Remove unfilled optional sub chart properties
        for (const subChart of configuration.charts) {
            // Sub Chart type specific properties
            switch (subChart.type) {
                case (Types.chart.LINE_CHART) :
                    break;
                case (Types.chart.BAR_CHART) :
                    if (subChart.stacked) {
                        subChart.mode = Types.chartStacking.stacked;
                    }
                    break;
                default :
                    // Area chart
                    if (subChart.stacked) {
                        subChart.mode = Types.chartStacking.stacked;
                    }
            }
            if (subChart.style.strokeWidth === '') {
                delete subChart.style.strokeWidth;
            }
            if (subChart.style.fillOpacity === '') {
                delete subChart.style.fillOpacity;
            }
            if (subChart.style.markRadius === '') {
                delete subChart.style.markRadius;
            }

            delete subChart.stacked;

            if (subChart.color === '') {
                // No color domain when there is no color categorization to be done
                delete subChart.colorDomain;
                delete subChart.color;
            }
            if (subChart.fill === '') {
                delete subChart.fill;
            }
            if (subChart.colorScale) {
                if (subChart.colorScale.length === 0) {
                    delete subChart.colorScale;
                }
            }
            if (subChart.colorDomain) {
                if (subChart.colorDomain.length === 0) {
                    delete subChart.colorDomain;
                }
            }
            if (this.isEmpty(subChart.style)) {
                delete subChart.style;
            }
        }
        if (!configuration.legend) {
            delete configuration.legend;
        }
        // Remove unfilled Style properties
        for (const styleProperty in configuration.style) {
            if (Object.prototype.hasOwnProperty.call(configuration.style, styleProperty)) {
                if (configuration.style[styleProperty] === '') {
                    delete configuration.style[styleProperty];
                }
            }
        }
        if (this.isEmpty(configuration.style)) {
            delete configuration.style;
        }
        if (configuration.xAxisLabel === '') {
            delete configuration.xAxisLabel;
        }
        if (configuration.yAxisLabel === '') {
            delete configuration.yAxisLabel;
        }
        if (!configuration.disableVerticalGrid) {
            delete configuration.disableVerticalGrid;
        }
        if (!configuration.disableHorizontalGrid) {
            delete configuration.disableHorizontalGrid;
        }
        if (configuration.timeFormat === '') {
            delete configuration.timeFormat;
        }
        if (configuration.legendOrientation === '') {
            delete configuration.legendOrientation;
        }
        if (configuration.append) {
            delete configuration.append;
        }
        return configuration;
    }

    /**
     * Validates a scatter chart for mandatory properties
     * @param configuration
     * @returns {boolean}
     */
    static validateScatterChartConfiguration(configuration) {
        // Main chart properties and number of sub charts
        if (configuration.charts.length === 0) {
            return false;
        }
        // Sub chart properties
        for (const subChart of configuration.charts) {
            if (subChart.x === '' || subChart.y === '' || subChart.maxLength === '') {
                return false;
            }
        }
        return true;
    }

    /**
     * Removes unfilled optional properties from the given scatter chart configuration
     * @param configuration
     * @returns {*}
     */
    static prepareScatterChartConfiguration(configuration) {
        configuration = JSON.parse(JSON.stringify(configuration)); // To avoid reference copying
        // Remove unfilled optional sub chart properties
        for (const subChart of configuration.charts) {
            if (subChart.color === '') {
                // No color domain when there is no color categorization to be done
                delete subChart.colorDomain;
                delete subChart.color;
            }
            if (subChart.size === '') {
                delete subChart.size;
            }
            if (subChart.colorScale) {
                if (subChart.colorScale.length === 0) {
                    delete subChart.colorScale;
                }
            }
            if (subChart.colorDomain) {
                if (subChart.colorDomain.length === 0) {
                    delete subChart.colorDomain;
                }
            }
            if (subChart.fill === '') {
                delete subChart.fill;
            }
        }
        // Remove unfilled Style properties
        for (const styleProperty in configuration.style) {
            if (Object.prototype.hasOwnProperty.call(configuration.style, styleProperty)) {
                if (configuration.style[styleProperty] === '') {
                    delete configuration.style[styleProperty];
                }
            }
        }
        if (this.isEmpty(configuration.style)) {
            delete configuration.style;
        }
        if (configuration.xAxisLabel === '') {
            delete configuration.xAxisLabel;
        }
        if (configuration.yAxisLabel === '') {
            delete configuration.yAxisLabel;
        }
        if (!configuration.disableVerticalGrid) {
            delete configuration.disableVerticalGrid;
        }
        if (!configuration.disableHorizontalGrid) {
            delete configuration.disableHorizontalGrid;
        }
        if (configuration.timeFormat === '') {
            delete configuration.timeFormat;
        }
        if (configuration.legendOrientation === '') {
            delete configuration.legendOrientation;
        }
        if (configuration.xAxisTickCount === '') {
            delete configuration.xAxisTickCount;
        }
        if (configuration.yAxisTickCount === '') {
            delete configuration.yAxisTickCount;
        }
        if (configuration.append) {
            delete configuration.append;
        }
        return configuration;
    }

    /**
     * Validates the given configuration of a pie chart
     * @param configuration
     */
    static validatePieChartConfiguration(configuration) {
        switch (configuration.chartType) {
            case (Types.chart.gauge):
                if (configuration.colorScale) {
                    if (configuration.colorScale.length === 0) {
                        return false;
                    }
                }
                break;
            default :
                break;
        }
        return (!(configuration.charts[0].x === '' || configuration.charts[0].color === ''));
    }

    /**
     * Removes unfilled optional properties from the given pie chart configuration
     * @param configuration
     */
    static preparePieChartConfiguration(configuration) {
        configuration = JSON.parse(JSON.stringify(configuration)); // To avoid reference copying
        if (configuration.charts[0].colorScale.length === 0) {
            configuration.colorScale = [];
            delete configuration.charts[0].colorScale;
        } else {
            configuration.colorScale = configuration.charts[0].colorScale;
        }
        if (configuration.charts[0].colorDomain.length === 0) {
            delete configuration.charts[0].colorDomain;
        }
        if (!configuration.legend) {
            delete configuration.legend;
        }
        for (const styleProperty in configuration.style) {
            if (Object.prototype.hasOwnProperty.call(configuration.style, styleProperty)) {
                if (configuration.style[styleProperty] === '') {
                    delete configuration.style[styleProperty];
                }
            }
        }
        if (this.isEmpty(configuration.style)) {
            delete configuration.style;
        }
        if (configuration.legendOrientation === '') {
            delete configuration.legendOrientation;
        }
        delete configuration.percentage;
        delete configuration.charts[0].mode;
        // Modify according to selected mode
        switch (configuration.chartType) {
            case (Types.chart.donut):
                configuration.charts[0].mode = Types.chart.donut;
                break;
            case (Types.chart.gauge):
                configuration.charts[0].colorScale = configuration.colorScale;
                configuration.legend = false;
                configuration.percentage = true;
                configuration.tooltip = {enabled: false};
                break;
            default :
                configuration.charts[0].mode = Types.chart.pie;
                break;
        }
        if (configuration.append) {
            delete configuration.append;
        }
        delete configuration.chartType;
        return configuration;
    }

    /**
     * Validates the given configuration of a number chart
     * @param configuration
     */
    static validateNumberChartConfiguration(configuration) {
        return (!(configuration.x === '' ||
            configuration.title === ''));
    }

    /**
     * Removes unfilled optional properties from the given number chart configuration
     * @param configuration
     */
    static prepareNumberChartConfiguration(configuration) {
        configuration = JSON.parse(JSON.stringify(configuration)); // To avoid reference copying
        if (!configuration.showDifference) {
            delete configuration.showDifference;
        }
        if (!configuration.showPercentage) {
            delete configuration.showPercentage;
        }
        return configuration;
    }

    /**
     * Validates the given configuration of a geographical chart
     * @param configuration
     */
    static validateGeographicalChartConfiguration(configuration) {
        if (configuration.x === '') {
            return false;
        }

        for (const subChart of configuration.charts) {
            if (subChart.y === '' || subChart.mapType === '') {
                return false;
            }
        }
        return true;
    }

    /**
     * Removes unfilled optional properties from the given geographical chart configuration
     * @param configuration
     */
    static prepareGeographicalChartConfiguration(configuration) {
        configuration = JSON.parse(JSON.stringify(configuration)); // To avoid reference copying
        if (configuration.legendTitleColor === '') {
            delete configuration.legendTitleColor;
        }
        if (configuration.legendTextColor === '') {
            delete configuration.legendTextColor;
        }
        for (const subChart of configuration.charts) {
            if (subChart.colorScale.length === 0) {
                delete subChart.colorScale;
            }
        }
        return configuration;
    }

    /**
     * Validates the given configuration of a table chart
     * @param configuration
     */
    static validateTableChartConfiguration(configuration) {
        if (configuration.maxLength === '') {
            return false;
        }
        return (configuration.charts[0].filterColumn.indexOf(true) !== -1);
    }

    /**
     * Removes unfilled optional properties from the given table chart configuration
     * @param configuration
     */
    static prepareTableChartConfiguration(configuration) {
        configuration = JSON.parse(JSON.stringify(configuration)); // To avoid reference copying
        if (!configuration.colorBasedStyle) {
            delete configuration.colorBasedStyle;
        }
        // Only assign filtered columns & column titles
        const filteredColumns = [];
        const filteredColumnTitles = [];
        for (let i = 0; i < configuration.charts[0].filterColumn.length; i++) {
            if (configuration.charts[0].filterColumn[i]) {
                filteredColumns.push(configuration.charts[0].columns[i]);
                filteredColumnTitles.push(configuration.charts[0].columnTitles[i]);
            }
        }
        delete configuration.charts[0].columns;
        delete configuration.charts[0].columnTitles;
        delete configuration.charts[0].filterColumn;
        configuration.charts[0].columns = filteredColumns;
        configuration.charts[0].columnTitles = filteredColumnTitles;
        return configuration;
    }

    /* Chart Validation & Preparation functions [END] */
}

export default UtilFunctions;
