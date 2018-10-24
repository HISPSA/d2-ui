import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import VisualizationTypeIcon from './VisualizationTypeIcon';
import { visualizationTypeMap } from './visualizationTypes';
import { sGetUiType } from '../../reducers/ui';
import { acSetUiType } from '../../actions/ui';
import { colors } from '../../colors';

export class VisualizationTypeSelector extends Component {
    state = {
        anchorEl: null,
    };

    handleButtonClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuItemClick = type => event => {
        this.props.onTypeSelect(type);
        this.handleClose();
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        const { visualizationType } = this.props;

        return (
            <div className="visualization-type-selector">
                <Button
                    onClick={this.handleButtonClick}
                    disableRipple
                    disableFocusRipple
                    fullWidth={true}
                    size="small"
                    style={{
                        padding: '8px',
                        color: colors.black,
                        fontSize: '15px',
                        textTransform: 'none',
                        fontWeight: 'normal',
                        backgroundColor: colors.white,
                    }}
                >
                    <VisualizationTypeIcon type={visualizationType} />
                    {visualizationTypeMap[visualizationType]}
                    <ArrowDropDownIcon style={{ marginLeft: 'auto' }} />
                </Button>
                <Menu
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    onClose={this.handleClose}
                    getContentAnchorEl={null}
                    style={{
                        maxWidth: 632,
                        borderRadius: 0,
                    }}
                    MenuListProps={{ style: { overflow: 'auto', padding: 0 } }}
                >
                    {Object.keys(visualizationTypeMap).map(type => (
                        <MenuItem
                            key={type}
                            selected={type === visualizationType}
                            style={{
                                height: 120,
                                width: 150,
                                padding: 0,
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                float: 'left',
                            }}
                            onClick={this.handleMenuItemClick(type)}
                        >
                            <ListItemIcon>
                                <VisualizationTypeIcon
                                    type={type}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        position: 'relative',
                                        top: 24,
                                        left: 8,
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={visualizationTypeMap[type]}
                                disableTypography={true}
                                style={{
                                    fontSize: 14,
                                    position: 'relative',
                                    top: 36,
                                }}
                            />
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        );
    }
}

VisualizationTypeSelector.propTypes = {
    visualizationType: PropTypes.oneOf(Object.keys(visualizationTypeMap)),
};

const mapStateToProps = state => ({
    visualizationType: sGetUiType(state),
});

const mapDispatchToProps = dispatch => ({
    onTypeSelect: type => dispatch(acSetUiType(type)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VisualizationTypeSelector);