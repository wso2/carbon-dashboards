import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import Header from '../../common/Header';
import UserMenu from '../../common/UserMenu';
import PortalButton from '../../common/PortalButton';

export default class WidgetStoreHeader extends Component {
    render() {
        return (
            <Header
                title={
                    <FormattedMessage
                        id="widget.store.title"
                        defaultMessage="Widget Store"
                    />
                }
                rightElement={
                    this.props.showPortalButton ? (
                        <span>
                            <PortalButton />
                            <UserMenu />
                        </span>
                    ) : (
                        <UserMenu />
                    )
                }
            />
        );
    }
}

WidgetStoreHeader.propTypes = {
    showPortalButton: PropTypes.bool,
};

WidgetStoreHeader.defaultProps = {
    showPortalButton: false,
};
