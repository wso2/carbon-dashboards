import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-light-theme.css';
import BarChart from './BarChart';
import PieChart from './PieChart';
import Publisher from './Publisher';
import Subscriber from './Subscriber';
import DynamicWidget from './DynamicWidget';
import EmptyWidget from './EmptyWidget';
import '../public/css/dashboard.css';

let uuid;

const config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: true,
        showMaximiseIcon: true,
        responsive: true,
        responsiveMode: 'always',
        showCloseIcon: true,
    },
    dimensions: {
        minItemWidth: 400,
    },
    content: [{
        type: 'row',
        content: [
            {
                title: 'Pie Chart',
                type: 'react-component',
                component: 'pieChart',
                props: { id: uuid + 'pieChart' },
            },
            {
                title: 'Publisher',
                type: 'react-component',
                component: 'publisher',
            },
            {
                title: 'Subscriber',
                type: 'react-component',
                component: 'subscriber',
            },
        ],
    }],
};


const widgetsList = [
    {
        title: 'Bar - Chart',
        component: 'barChart',
        id: 'barchart',
    },
    {
        title: 'Pie - Chart',
        component: 'pieChart',
        id: 'pieChart',
    },
    {
        title: 'Publisher',
        component: 'publisher',
        id: 'publisher',
    },
    {
        title: 'Subscriber',
        component: 'subscriber',
        id: 'subscriber',
    },
    {
        title: 'DynamicWidget',
        component: 'DynamicWidget',
        id: 'dynamicWidget',
    },
    {
        title: 'EmptyWidget',
        component: 'EmptyWidget',
        id: 'emptyWidget',
    },
];

const myLayout = new GoldenLayout(config, document.getElementById('view'));
function initializeWidgetList() {
    for (const widget in widgetsList) {
        addWidget(widgetsList[widget]);
    }
}
initializeWidgetList();
myLayout.registerComponent('barChart', BarChart);
myLayout.registerComponent('pieChart', PieChart);
myLayout.registerComponent('publisher', Publisher);
myLayout.registerComponent('subscriber', Subscriber);
myLayout.registerComponent('DynamicWidget', DynamicWidget);
myLayout.registerComponent('EmptyWidget', EmptyWidget);

function addWidget(widget) {
    const menuContainer = document.getElementById('menuContainer');
    const menuItem = document.createElement('div');
    menuItem.innerHTML = '<li id=\"' + widget.id + '\">' + widget.title + '</li>';
    menuContainer.appendChild(menuItem.firstChild);

    const id = getGadgetUUID(widget.component);
    const newItemConfig = {
        title: widget.title,
        type: 'react-component',
        component: widget.component,
        props: { id },
        header: {
            show: true,
        },

    };
    myLayout.createDragSource(document.getElementById(widget.id), newItemConfig);
}

function getGadgetUUID(widgetName) {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return widgetName + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

myLayout.init();

// myLayout.on('stateChanged', function () {
//     $('#menuContainer').empty();
//     initializeWidgetList();
// });

window.onresize = function () {
    myLayout.updateSize();
};

