import React from 'react';

class Subscriber extends React.Component {
    constructor(props) {
        super(props);
        this.state = { receivedMsg: '' };
        this.set = new Set();
        this.clearMsgs = this.clearMsgs.bind(this);
    }

    componentDidMount() {
        this.props.glEventHub.on('pub-sub-channel', this.setReceivedMsg.bind(this));
    }

    setReceivedMsg(receivedMsg) {
        this.set.add(receivedMsg);
        this.setState({ receivedMsg });
    }

    generateOutput() {
        if (this.state.receivedMsg) {
            const output = [];
            for (const key of this.set.values()) {
                output.push(<div>[Received] {new Date().toTimeString()} [Message] - {key}</div>);
            }
            return output;
        } else {
            return '';
        }
    }

    clearMsgs() {
        this.setState({ receivedMsg: '' });
        this.set.clear();
    }

    render() {
        return (<section><h4 style={{ display: 'inline', marginRight: 10 }}>Received Messages</h4><input
            type="button"
            onClick={this.clearMsgs}
            value="Clear"
        />
        <div>{this.generateOutput()}</div>
        </section>);
    }
}

export default Subscriber;
