import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import UserList from './UserList';

const defaultState = {
    element: null,
    captureText: false,
    captureStartPosition: null,
    capturedText: null,
    users: [],
    selectedUserIndex: 0,
};

class MentionsWrapper extends Component {
    constructor(props) {
        super(props);

        this.state = defaultState;

        this.lookupUser = debounce(this.lookupUser, 250);
    }

    lookupUser = query => {
        this.props.d2.Api.getApi()
            .get('users.json', {
                query,
                fields: 'id,displayName,userCredentials[username]',
            })
            .then(response => {
                this.setState({
                    users: response.users,
                });
            });
    };

    // event bubbles up from the wrapped input/textarea
    onKeyDown = event => {
        const { key, shiftKey } = event;
        const element = event.target;
        const { selectionStart, selectionEnd } = element;

        // '@' triggers the user lookup/suggestion
        if (!this.state.captureText && key === '@' && shiftKey === true) {
            this.setState({
                element,
                captureText: true,
                captureStartPosition: selectionStart + 1,
            });
        } else if (this.state.captureText) {
            if (
                key === ' ' ||
                (key === 'Backspace' && selectionStart <= this.state.captureStartPosition)
            ) {
                // XXX
                this.setState(defaultState);
            } else if (this.state.users.length) {
                const selectedUserIndex = this.state.selectedUserIndex;

                switch (key) {
                    case 'Enter':
                        event.preventDefault();
                        if (selectedUserIndex >= 0) {
                            this.onUserSelect(this.state.users[selectedUserIndex]);
                        }
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.setState({ selectedUserIndex: this.state.selectedUserIndex + 1 });
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        this.setState({ selectedUserIndex: this.state.selectedUserIndex - 1 });
                        break;
                }
            }
        }

        // this is to make sure the state has been updated
        // otherwise the last character is not included in the captured text
        // also debounce
        setTimeout(() => {
            if (this.state.captureText) {
                const spacePosition = element.value.indexOf(
                    ' ',
                    this.state.captureStartPosition - 1
                );

                const filterValue = element.value.substring(
                    this.state.captureStartPosition,
                    spacePosition > 0 ? spacePosition : selectionEnd + 1
                );

                if (!filterValue || filterValue !== this.state.capturedText) {
                    this.lookupUser(filterValue);

                    this.setState({ capturedText: filterValue });
                } else if (filterValue.length === 0) {
                    this.setState({ capturedText: null, users: [] });
                }
            }
        }, 0);
    };

    onUserSelect = user => {
        const originalValue = this.state.element.value;
        const newValue = `${originalValue.slice(
            0,
            this.state.captureStartPosition - 1
        )}${originalValue
            .slice(this.state.captureStartPosition - 1)
            .replace(/^@\w*/, `@${user.userCredentials.username}`)}`;

        const component = this.props.children;

        // for a controlled component
        // trigger onChange on the component to keep its state aligned
        // otherwise try to set the value directly
        if (component.props.onChange) {
            component.props.onChange(newValue);
        } else {
            this.state.element.value = newValue;
        }

        // need to refocus on the input/textarea
        this.state.element.focus();

        this.setState(defaultState);
    };

    render() {
        const { children } = this.props;

        return (
            <div onKeyDown={this.onKeyDown} style={{ position: 'relative' }}>
                {children}
                <div
                    style={{
                        backgroundColor: '#fff',
                        position: 'absolute',
                        top: 41, // TODO probably compute this somehow?!
                        left: 0,
                        display: this.state.users.length ? 'block' : 'none',
                        maxHeight: 210, // TODO probably compute this somehow?!
                        overflow: 'auto',
                        borderStyle: 'solid',
                        borderWidth: 1,
                        borderColor: 'lightgrey', // TODO use colors from app theme
                        zIndex: 9,
                    }}
                >
                    <UserList
                        users={this.state.users}
                        selectedUser={this.state.users[this.state.selectedUserIndex]}
                        onUserSelect={this.onUserSelect}
                    />
                </div>
            </div>
        );
    }
}

MentionsWrapper.defaultProps = {
    d2: null,
};

MentionsWrapper.propTypes = {
    d2: PropTypes.object,
};

export default MentionsWrapper;