import React from 'react';
import axios from 'axios';

class DynamicWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
        };
        this.handleResize = this.handleResize.bind(this);
        this.dataFetct = this.dataFetct.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        setInterval(this.dataFetct, 2000);
    }

    componentDidMount() {
        this.dataFetct();
    }

    dataFetct() {
        let instance = axios.create({
            baseURL: 'http://localhost:8082/app',
            timeout: 2000,
            headers: {'Content-type': 'application/json'}
        });
        const config = {
            type: 'area',
            x: 'Country',
            charts: [
                {type: 'area', range: 'false', y: 'Area'},
            ],
            maxLength: 50,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };
        let id = this.props.id;
        instance.get('/test').then(function (response) {
            const data = [
                {
                    metadata: {
                        names: ['Country', 'Area', 'GDP'],
                        types: ['ordinal', 'linear', 'linear'],
                    },
                    data: response.data,
                },
            ];

            const x = new vizg(data, config);
            x.draw('#' + id);
        }).catch(function (error) {
            console.log(error)
        });
    }

    handleResize() {
        this.dataFetct();
    }

    render() {
        return <div ref={this.state.id} id={this.state.id}/>;
    }
}

export default DynamicWidget;
