import React from 'react';

class DynamicWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.dataFetct = this.dataFetct.bind(this);
        setInterval(this.handleResize, 2000);
    }

    componentDidMount() {
        const data = [
            {
                metadata: {
                    names: ['Country', 'Area', 'GDP'],
                    types: ['ordinal', 'linear', 'linear'],
                },
                data: this.dataFetct(),
            },
        ];
        const config = {
            type: 'area',
            x: 'Country',
            charts: [
                { type: 'area', range: 'false', y: 'Area' },
            ],
            maxLength: 50,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };

        const x = new vizg(data, config);
        x.draw('#' + this.props.id);
    }

    dataFetct() {
        const xhttp = new XMLHttpRequest();
        xhttp.open('GET', 'http://localhost:8082/app/test', false);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send();
        const response = JSON.parse(xhttp.responseText);
        // console.log(response);
        return response;
    }

    handleResize() {
        this.componentDidMount();
    }

    render() {
        return <div ref={this.state.id} id={this.state.id} />;
    }
}

export default DynamicWidget;
