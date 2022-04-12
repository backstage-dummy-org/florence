import { connect } from "react-redux";
import { fetchGroupsRequest } from "../../../config/groups/thunks";
import { createCollectionRequest } from "../../../config/thunks";
import { getGroupsLoading, getEnableNewSignIn, getEnablePermissionsAPI, getGroups } from "../../../config/selectors";
import CreateNewCollection from "./CreateNewCollection";

export const mapStateToProps = state => ({
    teams: getGroups(state.state),
    fetchingTeams: getGroupsLoading(state.state),
    isNewSignIn: getEnableNewSignIn(state.state),
    isEnablePermissionsAPI: getEnablePermissionsAPI(state.state),
});

const mapDispatchToProps = dispatch => ({
    loadTeams: isNewSignIn => dispatch(fetchGroupsRequest(isNewSignIn)),
    createCollectionRequest: (collection, teams, isEnablePermissionsAPI) =>
        dispatch(createCollectionRequest(collection, teams, isEnablePermissionsAPI)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewCollection);
