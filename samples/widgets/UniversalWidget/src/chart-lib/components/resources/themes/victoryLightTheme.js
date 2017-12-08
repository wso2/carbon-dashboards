import assign from 'lodash/assign';

// Colors
const yellow200 = '#FFF59D';
const deepOrange600 = '#F4511E';
const lime300 = '#DCE775';
const lightGreen500 = '#8BC34A';
const teal700 = '#00796B';
const cyan900 = '#006064';
const blueGrey50 = '#ECEFF1';
const blueGrey300 = '#90A4AE';
const blueGrey700 = '#455A64';
const grey900 = '#212121';
const colors = [
    deepOrange600,
    yellow200,
    lime300,
    lightGreen500,
    teal700,
    cyan900,
];

// Typography
const sansSerif = "'Roboto', 'Helvetica Neue', Helvetica, sans-serif";
const letterSpacing = 'normal';
const fontSize = 14;
const fontSizeSmall = 12;

// Layout
const padding = 10;
const axisLabelPadding = 30;
const tickLabelpadding = 0;
const baseProps = {
    width: 800,
    height: 450,
    padding: 50,
    colorScale: colors,
};

// Labels
const baseLabelStyles = {
    fontFamily: sansSerif,
    fontSize,
    letterSpacing,
    padding,
    fill: blueGrey700,
    stroke: 'transparent',
};

const centeredLabelStyles = assign({ textAnchor: 'middle' }, baseLabelStyles);

// Strokes
const strokeDasharray = 'none';
const strokeLinecap = 'round';
const strokeLinejoin = 'round';
const strokeOpacity = '.15';

const victoryLightTheme = {
    area: assign({
        style: {
            data: {
                fill: grey900,
            },
            labels: centeredLabelStyles,
        },
    }, baseProps),
    axis: assign({
        style: {
            axis: {
                fill: 'transparent',
                stroke: blueGrey300,
                strokeWidth: 1,
                strokeLinecap,
                strokeLinejoin,
            },
            axisLabel: assign({}, centeredLabelStyles, {
                padding: axisLabelPadding,
                stroke: 'transparent',
            }),
            grid: {
                fill: 'transparent',
                stroke: blueGrey300,
                strokeDasharray,
                strokeLinecap,
                strokeLinejoin,
                strokeOpacity,
            },
            ticks: {
                fill: 'transparent',
                size: 10,
                stroke: blueGrey300,
                strokeWidth: 1,
                strokeLinecap,
                strokeLinejoin,
                strokeOpacity,
            },
            tickLabels: assign({}, baseLabelStyles, {
                fontSize: fontSizeSmall,
                fill: blueGrey300,
                stroke: 'transparent',
                padding: tickLabelpadding,
            }),
        },
    }, baseProps),
    bar: assign({
        style: {
            data: {
                fill: blueGrey700,
                padding,
                stroke: 'transparent',
                strokeWidth: 0,
                width: 5,
            },
            labels: baseLabelStyles,
        },
    }, baseProps),
    candlestick: assign({
        style: {
            data: {
                stroke: blueGrey700,
                strokeWidth: 1,
            },
            labels: centeredLabelStyles,
        },
        candleColors: {
            positive: blueGrey50,
            negative: blueGrey700,
        },
    }, baseProps),
    chart: baseProps,
    errorbar: assign({
        style: {
            data: {
                fill: 'transparent',
                opacity: 1,
                stroke: blueGrey700,
                strokeWidth: 2,
            },
            labels: assign({}, centeredLabelStyles, {
                stroke: 'transparent',
                strokeWidth: 0,
            }),
        },
    }, baseProps),
    group: assign({
        colorScale: colors,
    }, baseProps),
    line: assign({
        style: {
            data: {
                fill: 'transparent',
                opacity: 1,
                stroke: blueGrey700,
                strokeWidth: 2,
            },
            labels: assign({}, baseLabelStyles, {
                stroke: 'transparent',
                strokeWidth: 0,
                textAnchor: 'start',
            }),
        },
    }, baseProps),
    pie: assign({
        colorScale: colors,
        style: {
            data: {
                padding,
                stroke: blueGrey50,
                strokeWidth: 1,
            },
            labels: assign({}, baseLabelStyles, {
                padding: 20,
                stroke: 'transparent',
                strokeWidth: 0,
            }),
        },
    }, baseProps),
    scatter: assign({
        style: {
            data: {
                fill: blueGrey700,
                opacity: 1,
                stroke: 'transparent',
                strokeWidth: 0,
            },
            labels: assign({}, centeredLabelStyles, {
                stroke: 'transparent',
            }),
        },
    }, baseProps),
    stack: assign({
        colorScale: colors,
    }, baseProps),
    tooltip: assign({
        style: {
            data: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
            },
            labels: centeredLabelStyles,
            flyout: {
                stroke: blueGrey700,
                strokeWidth: 1,
                fill: blueGrey50,
            },
        },
        flyoutProps: {
            cornerRadius: 10,
            pointerLength: 10,
        },
    }, baseProps),
    voronoi: assign({
        style: {
            data: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
            },
            labels: centeredLabelStyles,
        },
    }, baseProps),
};


export default victoryLightTheme;
