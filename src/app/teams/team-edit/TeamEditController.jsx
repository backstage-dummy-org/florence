import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';

import { updateUsers, updateActiveTeamMembers } from '../../config/actions';
import user from '../../utilities/user';
import teams from '../../utilities/teams';

import TeamEdit from './TeamEdit';

const propTypes = {
    name: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.object),
    members: PropTypes.arrayOf(PropTypes.string),
    isUpdatingMembers: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
}

class TeamEditController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editedUsers: null,
            updatingAllUsers: false,
            parentPath: (location.pathname).split('/edit')[0],
            disabledUsers: new Map()
        }

        this.handleMembersChange = this.handleMembersChange.bind(this);
        this.handleDone = this.handleDone.bind(this);
    }

    componentWillMount() {
        this.setState({
            updatingAllUsers: true
        });
        user.getAll().then(users => {
            const editedUsers = users.filter(user => {
                return this.props.members.indexOf(user.email) < 0
            });

            this.props.dispatch(updateUsers(users));
            this.setState({
                editedUsers: editedUsers,
                updatingAllUsers: false
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.users !== this.props.users) {
            this.setState({editedUsers: nextProps.users})
        }
    }

    handleMembersChange(userAttributes) {
        const disabledUsers = this.state.disabledUsers;
        disabledUsers.set(userAttributes.email, null);
        this.setState({disabledUsers});

        function sortUsers(users) {
            return users.sort((userA, userB) => {
                    if (userA.email < userB.email) return -1;
                    if (userA.email > userB.email) return 1;
                    return 0;
                });
        }

        function sortMembers(members) {
            return members.sort((memberA, memberB) => {
                    if (memberA < memberB) return -1;
                    if (memberA > memberB) return 1;
                    return 0;
                });
        }

        switch (userAttributes.action) {
            case ("remove"): {
                teams.removeMember(this.props.name, userAttributes.email).then(() => {
                    const editedMembers = this.props.members.filter(member => {
                        return member !== userAttributes.email
                    });
                    const editedUsers = [ ...this.state.editedUsers, {email: userAttributes.email}];
                    const disabledUsers = this.state.disabledUsers;
                    disabledUsers.delete(userAttributes.email, null);

                    this.setState({
                        editedUsers: sortUsers(editedUsers),
                        disabledUsers
                    });
                    this.props.dispatch(updateActiveTeamMembers(sortMembers(editedMembers)));
                }).catch(error => {
                    const disabledUsers = this.state.disabledUsers;
                    disabledUsers.delete(userAttributes.email, null);
                    this.setState({disabledUsers});
                    console.error(`Error removing user '${userAttributes.email}' from team '${this.props.name}'\nError:`, error);
                });
                break;
            }
            case ("add"): {
                teams.addMember(this.props.name, userAttributes.email).then(() => {
                    const editedMembers = [ ...this.props.members, userAttributes.email];
                    const editedUsers = this.state.editedUsers.filter(user => {
                        return user.email !== userAttributes.email
                    });
                    const disabledUsers = this.state.disabledUsers;
                    disabledUsers.delete(userAttributes.email, null);

                    this.setState({
                        editedUsers: sortUsers(editedUsers),
                        disabledUsers
                    });
                    this.props.dispatch(updateActiveTeamMembers(sortMembers(editedMembers)));
                }).catch(error => {
                    const disabledUsers = this.state.disabledUsers;
                    disabledUsers.delete(userAttributes.email, null);
                    this.setState({disabledUsers});
                    console.error(`Error adding user '${userAttributes.email}' to team '${this.props.name}'\nError:`, error);
                });
                break;
            }
            default: {
                console.error(`Unrecognised action attribute on team members editing screen\n`, userAttributes);
            }
        }
    }

    handleDone() {
        this.props.dispatch(push(this.state.parentPath));
    }

    render() {
        return (
            <TeamEdit 
                name={this.props.name}
                users={this.state.editedUsers} 
                members={this.props.members}
                onMembersChange={this.handleMembersChange}
                onDone={this.handleDone}
                updatingAllUsers={this.state.updatingAllUsers}
                updatingMembers={this.props.isUpdatingMembers}
                showingLoaders={this.state.updatingAllUsers || this.props.isUpdatingMembers}
                disabledUsers={this.state.disabledUsers}
            />
        )
    }
}

TeamEditController.propTypes = propTypes;

function mapStateToProps(state) {
    return {
        users: state.state.teams.users,
        rootPath: state.state.rootPath
    }
}

export default connect(mapStateToProps)(TeamEditController);
