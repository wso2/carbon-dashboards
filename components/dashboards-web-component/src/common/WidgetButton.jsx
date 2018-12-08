import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { FlatButton } from 'material-ui';
import { DeviceWidgets } from 'material-ui/svg-icons';

const styles = {
    widgetIcon: {
        height: '20px',
    },
};

class WidgetButton extends Component {
    render() {
        return (
            <FlatButton
                style={{ minWidth: '48px' }}
                label={<FormattedMessage id='widgets.title' defaultMessage='Widgets' />}
                icon={<DeviceWidgets style={styles.widgetIcon} />}
                onClick={() => this.props.history.push('/widgetstore')}
            />
        );
    }
}

WidgetButton.propTypes = {
    history: PropTypes.shape({}).isRequired,
};

export default withRouter(WidgetButton);
