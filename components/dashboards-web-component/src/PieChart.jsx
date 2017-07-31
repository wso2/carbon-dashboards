import React from 'react';

class PieChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
    }

    componentDidMount() {
        const data = [
            {
                metadata: {
                    names: ['Hits', 'site'],
                    types: ['linear', 'ordinal'],
                },
                data: [
                    [103025, 'Facebook'],
                    [98253, 'Google'],
                    [10124, 'Yahoo'],
                    [68598, 'Youtube'],
                ],
            },
        ];

        const config = {
            charts: [{ type: 'arc', x: 'Hits', color: 'site', mode: 'pie' }],
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };

        const x = new vizg(data, config);
        x.draw('#' + this.props.id);
    }

    handleResize() {
        this.componentDidMount();
    }

    render() {
        return <div id={this.state.id} />;
    }
}

export default PieChart;
