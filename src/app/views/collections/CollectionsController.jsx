import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import CollectionCreate from './create/CollectionCreate';
import CollectionDetails from './details/CollectionDetails';
import Drawer from '../../components/drawer/Drawer';
import collections from '../../utilities/api-clients/collections'
import { updateActiveCollection } from '../../config/actions';
import url from '../../utilities/url'

// TODO move shared prop types to a separate file and import them when needed?
const collectionPagePropTypes = {
    uri: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.shape({
        title: PropTypes.string.isRequired,
        edition: PropTypes.string
    }).isRequired
}

const propTypes = {
    dispatch: PropTypes.func.isRequired,
    rootPath: PropTypes.string.isRequired,
    params: PropTypes.shape({
        collectionID: PropTypes.string,
        pageID: PropTypes.string
    }).isRequired,
    activeCollection: PropTypes.shape({
        approvalStatus: PropTypes.string.isRequired,
        collectionOwner: PropTypes.string,
        isEncrypted: PropTypes.bool,
        timeseriesImportFiles: PropTypes.array,
        inProgress: PropTypes.arrayOf(PropTypes.shape(collectionPagePropTypes)),
        complete: PropTypes.arrayOf(PropTypes.shape(collectionPagePropTypes)),
        reviewed: PropTypes.arrayOf(PropTypes.shape(collectionPagePropTypes)),
        datasets: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            uri: PropTypes.string.isRequired,
            state: PropTypes.string.isRequired
        })),
        datasetVersion: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            edition: PropTypes.string.isRequired,
            version: PropTypes.string.isRequired,
            uri: PropTypes.string.isRequired,
            state: PropTypes.string.isRequired
        })),
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        teams: PropTypes.array.isRequired
    })
};

class CollectionsController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collections: [],
            isFetchingData: false,
            isFetchingCollectionDetails: false,
            drawerIsAnimatable: false,
            drawerIsVisible: false
        };

        this.handleCollectionSelection = this.handleCollectionSelection.bind(this);
        this.handleDrawerTransitionEnd = this.handleDrawerTransitionEnd.bind(this);
        this.handleDrawerCancelClick = this.handleDrawerCancelClick.bind(this);
        this.handleCollectionPageClick = this.handleCollectionPageClick.bind(this);
        this.handleCollectionPageEditClick = this.handleCollectionPageEditClick.bind(this);
    }

    componentWillMount() {
        this.fetchCollections();

        if (this.props.params.collectionID) {
            this.fetchActiveCollection(this.props.params.collectionID);
            this.setState({drawerIsVisible: true});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.params.collectionID && nextProps.params.collectionID) {
            const activeCollection = this.state.collections.find(collection => {
                return collection.id === nextProps.params.collectionID;
            });
            this.props.dispatch(updateActiveCollection(activeCollection));
            this.setState({
                drawerIsAnimatable: true,
                drawerIsVisible: true
            });
            this.fetchActiveCollection(nextProps.params.collectionID);
        }

        if (this.props.params.collectionID && !nextProps.params.collectionID) {
            this.setState({
                drawerIsAnimatable: true,
                drawerIsVisible: false
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // if (this.props.params.collectionID && !nextProps.params.collectionID) {
        //     console.log({nextProps, nextState});
        //     return false;
        // }
        return true;
    }

    fetchCollections() {
        this.setState({isFetchingData: true});
        collections.getAll().then(collections => {
            this.setState({
                collections: collections,
                isFetchingData: false
            });
        });
        // TODO handle error scenarios
    }

    fetchActiveCollection(collectionID) {
        this.setState({isFetchingCollectionDetails: true});
        collections.get(collectionID).then(collection => {
            this.props.dispatch(updateActiveCollection(collection));
            this.setState({isFetchingCollectionDetails: false});
        });
        // TODO handle error scenarios
    }

    handleCollectionCreateSuccess() {
        // route to collection details pane for new collection
        // update list of collections
    }

    handleCollectionSelection() {
        // trigger collection details view
        console.log('clicked');
    }
    
    handleDrawerTransitionEnd() {
        this.setState({
            drawerIsAnimatable: false
        });

        // Active collection is now hidden, so can now clear the details from the panel.
        // This stops the collection details from disappearing before the animation to 
        // close the drawer is finished (which looks ugly).
        if (!this.state.drawerIsVisible) {
            this.props.dispatch(push(`${this.props.rootPath}/collections`));
        }
    }

    handleCollectionPageClick(id) {
        if (id === this.props.params.pageID) {
            return;
        }

        let newURL = location.pathname + "/" + id;
        if (this.props.params.pageID) {
            newURL = url.resolve(id);
        }
    
        this.props.dispatch(push(newURL));
    }

    handleCollectionPageEditClick(uri) {
        window.location = `${this.props.rootPath}/workspace?collection=${this.props.params.collectionID}&uri=${uri}`;
    }

    handleDrawerCancelClick() {
        this.setState({
            drawerIsAnimatable: true,
            drawerIsVisible: false
        });
    }

    renderDetailsDrawer() {
        return (
            <Drawer
                isVisible={this.state.drawerIsVisible} 
                isAnimatable={this.state.drawerIsAnimatable} 
                handleTransitionEnd={this.handleDrawerTransitionEnd}
            >
                {(this.props.params.collectionID && this.props.activeCollection) 
                    ||
                // Drawer closing but keep collection details rendered whilst
                // animation happens. handleEndTransition will empty active collection
                (!this.props.params.collectionID && this.props.activeCollection)
                ?
                    <CollectionDetails 
                        collectionID = {this.props.activeCollection.id}
                        activePageID={this.props.params.pageID}
                        {...this.props.activeCollection}
                        onCancel={this.handleDrawerCancelClick}
                        onPageClick={this.handleCollectionPageClick}
                        onEditPageClick={this.handleCollectionPageEditClick}
                        isLoadingDetails={this.state.isFetchingCollectionDetails}
                    />
                    :
                    <div className="grid grid--align-center grid--full-height">
                        <div className="loader loader--large"></div>
                    </div>
                }
            </Drawer>
        )
    }

    render () {
        return (
            <div>
                <div className="grid grid--justify-space-around">
                    <div className="grid__col-4">
                        <h1>Select a collection</h1>
                        <ul>
                        {this.state.collections ?
                            this.state.collections.map((collection, index) => {
                                return <li key={index} onClick={this.handleCollectionSelection}>{collection.name}</li>
                            }) : ""
                        }
                        </ul>

                        {/* FIXME this is a temporary link to get the collection details working */}
                        <Link to="/florence/collections/asdasdasd-04917444856fa9ade290b8847dee1f24e7726d71e1a7378c2557d949b6a6968c">A collection</Link>
                    </div>
                    <div className="grid__col-4">
                        <h1>Create a collection</h1>
                        <CollectionCreate user={this.props.user} onSuccess={this.handleCollectionCreateSuccess}/>
                        {this.renderDetailsDrawer()}
                    </div>
                </div>
            </div>
        )
    }
}

CollectionsController.propTypes = propTypes;

function mapStateToProps(state) {
    return {
        user: state.state.user,
        activeCollection: state.state.collections.active,
        rootPath: state.state.rootPath
    }
}

export default connect(mapStateToProps)(CollectionsController);