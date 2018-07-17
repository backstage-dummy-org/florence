import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import objectIsEmpty from 'is-empty-object';

import Drawer from '../../../components/drawer/Drawer';
import CollectionDetails, {pagePropTypes, deletedPagePropTypes} from './CollectionDetails';
import CollectionEditController from '../edit/CollectionEditController';
import collections from '../../../utilities/api-clients/collections';
import notifications from '../../../utilities/notifications';
import {updateActiveCollection, emptyActiveCollection, addAllCollections, markCollectionForDeleteFromAllCollections, addPagesToActiveCollection} from '../../../config/actions'
import cookies from '../../../utilities/cookies'
import collectionDetailsErrorNotifications from './collectionDetailsErrorNotifications'
import collectionMapper from "../mapper/collectionMapper";
import Modal from "../../../components/Modal";
import RestoreContent from "../restore-content/RestoreContent";
import url from '../../../utilities/url';

const propTypes = {
    dispatch: PropTypes.func.isRequired,
    rootPath: PropTypes.string.isRequired,
    collectionID: PropTypes.string,
    collections: PropTypes.array,
    activeCollection: PropTypes.shape({
        approvalStatus: PropTypes.string,
        collectionOwner: PropTypes.string,
        isEncrypted: PropTypes.bool,
        timeseriesImportFiles: PropTypes.array,
        inProgress: PropTypes.arrayOf(PropTypes.shape(pagePropTypes)),
        complete: PropTypes.arrayOf(PropTypes.shape(pagePropTypes)),
        reviewed: PropTypes.arrayOf(PropTypes.shape(pagePropTypes)),
        deletes: PropTypes.arrayOf(PropTypes.shape({
            user: PropTypes.string.isRequired,
            root: deletedPagePropTypes,
            totalDeletes: PropTypes.number.isRequired
        })),
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
        teams: PropTypes.array
    }),
    activePageURI: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
};

export class CollectionDetailsController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetchingCollectionDetails: false,
            isEditingCollection: false,
            isRestoringContent: false,
            isApprovingCollection: false,
            isCancellingDelete: {
                value: false,
                uri: ""
            },
            pendingDeletedPages: [],
            drawerIsAnimatable: false,
            drawerIsVisible: false,
        };

        this.handleDrawerTransitionEnd = this.handleDrawerTransitionEnd.bind(this);
        this.handleDrawerCloseClick = this.handleDrawerCloseClick.bind(this);
        this.handleCollectionDeleteClick = this.handleCollectionDeleteClick.bind(this);
        this.handleCollectionApproveClick = this.handleCollectionApproveClick.bind(this);
        this.handleCollectionPageClick = this.handleCollectionPageClick.bind(this);
        this.handleCollectionPageEditClick = this.handleCollectionPageEditClick.bind(this);
        this.handleCollectionPageDeleteClick = this.handleCollectionPageDeleteClick.bind(this);
        this.handleCancelPageDeleteClick = this.handleCancelPageDeleteClick.bind(this);
        this.handleRestoreDeletedContentClose = this.handleRestoreDeletedContentClose.bind(this);
        this.handleRestoreDeletedContentSuccess = this.handleRestoreDeletedContentSuccess.bind(this);
    }

    componentWillMount() {
        if (this.props.collectionID) {
            this.fetchActiveCollection(this.props.collectionID);
            this.setState({drawerIsVisible: true});
        }
    }

    componentWillReceiveProps(nextProps) {
        // Open and close edit collection modal
         if (nextProps.routes[nextProps.routes.length-1].path === "edit") {
            this.setState({isEditingCollection: true});
        }
        if (this.props.routes[this.props.routes.length-1].path === "edit" && nextProps.routes[nextProps.routes.length-1].path !== "edit") {
            this.setState({isEditingCollection: false});
        }
        // Display restore content modal
        if (nextProps.routes[nextProps.routes.length-1].path === "restore-content") {
            this.setState({isRestoringContent: true});
        }

        if (this.props.routes[this.props.routes.length-1].path === "restore-content" && nextProps.routes[nextProps.routes.length-1].path !== "restore-content") {
            this.setState({isRestoringContent: false});
        }

        if (!this.props.collectionID && nextProps.collectionID) {
            const activeCollection = this.props.collections.find(collection => {
                return collection.id === nextProps.collectionID;
            });
            this.updateActiveCollectionGlobally(activeCollection);
            this.setState({
                drawerIsAnimatable: true,
                drawerIsVisible: true,
            });
            this.fetchActiveCollection(nextProps.collectionID);
        }

        if (this.props.collectionID && !nextProps.collectionID) {
            this.setState({
                drawerIsAnimatable: true,
                drawerIsVisible: false,
            });
        }

        if ((this.props.collectionID && nextProps.collectionID) && (this.props.collectionID !== nextProps.collectionID)) {
            const activeCollection = this.props.collections.find(collection => {
                return collection.id === nextProps.collectionID;
            });
            this.updateActiveCollectionGlobally(activeCollection);
            this.fetchActiveCollection(nextProps.collectionID);
        }
    }

    shouldComponentUpdate() {
        if (!this.props.collectionID) {
            return false;
        }
        return true;
    }

    fetchActiveCollection(collectionID) {
        this.setState({isFetchingCollectionDetails: true});
        collections.get(collectionID).then(collection => {
            if (collection.approvalStatus === "COMPLETE") {
                // This collection is now in the publishing queue, redirect user
                location.pathname = this.props.rootPath + "/publishing-queue";
                return;
            }
            if (!this.props.collectionID || this.props.collectionID !== collection.id) {
                // User has closed collection details or moved to another one, so do not update state
                return;
            }

            const mappedCollection = collectionMapper.collectionResponseToState(collection);
            const collectionWithPages = collectionMapper.pagesToCollectionState(mappedCollection);

            // If we have no data in state yet for the collection then use this opportunity to add it.
            // We are most likely to see this on page load if it's directly to a collection details screen
            // otherwise we should have the some basic data which has come from the array of all collections
            if (!this.props.activeCollection || objectIsEmpty(this.props.activeCollection)) {
                this.props.dispatch(updateActiveCollection(mappedCollection));
            }

            this.props.dispatch(addPagesToActiveCollection(collectionWithPages));
            this.setState({isFetchingCollectionDetails: false});
        }).catch(error => {
            console.error(`Fetching collection ${collectionID}: `, error);
            collectionDetailsErrorNotifications.getActiveCollection(error);
            if (error.status === 404 || error.status === 403) {
                this.props.dispatch(push(`${this.props.rootPath}/collections`));
                return;
            }
            this.setState({isFetchingCollectionDetails: false});
        });
    }

    updateActiveCollectionGlobally(collection) {
        this.props.dispatch(updateActiveCollection(collection));
        cookies.add("collection", collection.id, null);
    }

    handleCollectionDeleteClick(collectionID) {
        this.props.dispatch(push(`${this.props.rootPath}/collections`));
        collections.delete(collectionID).then(async () => {
            // We mark the collection as ready to be removed from all collections. This means that
            // the collectionsController, which owns the allCollections state can react to this state event
            // however it needs to (rather than the collectionDetails having to understand what to do)
            this.props.dispatch(markCollectionForDeleteFromAllCollections(collectionID));

            const notification = {
                type: 'positive',
                message: `Collection deleted`,
                autoDismiss: 4000,
                isDismissable: true
            };
            notifications.add(notification);
        }).catch(error => {
            console.error(`Error deleting collection '${collectionID}'`, error);
            collectionDetailsErrorNotifications.deleteCollection(error);
        });
    }

    handleCollectionApproveClick() {
        const activeCollection = this.props.activeCollection;
        const collectionID = this.props.collectionID;
        if (!collectionMapper.collectionCanBeApproved(activeCollection)) {
            const notification = {
                type: 'neutral',
                message: `Unable to approve collection '${activeCollection.name}', please check that there are no pages in progress or awaiting review`,
                isDismissable: true,
                autoDismiss: 4000
            };
            notifications.add(notification);
            return false;
        }

        const allCollections = this.props.collections.map(collection => {
            if (collection.id !== collectionID) {
                return collection;
            }
            return {
                ...collection,
                status: {
                    ...collection.status,
                    neutral: true
                }
            }
        });
        this.props.dispatch(addAllCollections(allCollections));

        this.setState({isApprovingCollection: true});
        collections.approve(collectionID).then(() => {
            this.setState({isApprovingCollection: false});
            this.props.dispatch(push(`${this.props.rootPath}/collections`));
        }).catch(error => {
            this.setState({isApprovingCollection: false});
            console.error("Error approving collection", error);
            collectionDetailsErrorNotifications.approveCollection(error);
        });
    }

    handleCancelPageDeleteClick(uri) {
        if (!uri) {
            notifications.add({
                type: "warning",
                message: "Couldn't delete because of an unexpected error: unable to get URI of delete to cancel",
                autoDismiss: 5000,
                isDismissable: true
            });
            return;
        }

        this.setState({isCancellingDelete: {
            value: true,
            uri
        }});

        const activeCollectionID = this.props.activeCollection.id;

        collections.cancelDelete(this.props.collectionID, uri).then(() => {
            // User have moved to another collection during the async update, so don't update the active collection in state
            if (this.props.collectionID !== activeCollectionID) {
                return;
            }
            this.setState({isCancellingDelete: {
                value: false,
                uri: ""
            }});

            const updatedActiveCollection = {
                ...this.props.activeCollection,
                deletes: this.props.activeCollection.deletes.filter(deletedPage => {
                    return deletedPage.root.uri !== uri;
                })
            };
            updatedActiveCollection.canBeApproved = collectionMapper.collectionCanBeApproved(updatedActiveCollection);
            updatedActiveCollection.canBeDeleted = collectionMapper.collectionCanBeDeleted(updatedActiveCollection)
            this.props.dispatch(addPagesToActiveCollection(updatedActiveCollection));
        }).catch(error => {
            this.setState({isCancellingDelete: {
                value: false,
                uri: ""
            }});
            collectionDetailsErrorNotifications.cancelPageDelete(error, uri, this.props.collectionID);
            console.error(`Error removing pending delete of page '${uri}' from collection '${this.props.collectionID}'`, error);
        });
    }

    handleDrawerTransitionEnd() {
        this.setState({
            drawerIsAnimatable: false
        });

        // Active collection is now hidden, so can now clear the details from the panel.
        // This stops the collection details from disappearing before the animation to 
        // close the drawer is finished (which looks ugly).
        if (!this.state.drawerIsVisible) {
            this.props.dispatch(emptyActiveCollection());
            this.props.dispatch(push(`${this.props.rootPath}/collections`));
        }
    }

    handleCollectionPageClick(uri) {       
        if (uri === this.props.activePageURI) {
            return;
        }

        let newURL = location.pathname + "#" + uri;
        if (this.props.activePageURI) {
            newURL = `${this.props.rootPath}/collections/${this.props.collectionID}#${uri}`;
        }
    
        this.props.dispatch(push(newURL));

        return newURL; //using 'return' so that we can test the correct new URL has been generated
    }

    handleCollectionPageEditClick(uri) {
        window.location = `${this.props.rootPath}/workspace?collection=${this.props.collectionID}&uri=${uri}`;
    }

    handleCollectionPageDeleteUndo(deleteTimer, uri, notificationID) {
        this.setState(state => ({
            pendingDeletedPages: [...state.pendingDeletedPages].filter(pageURI => {
                return pageURI !== uri;
            })
        }));
        const pageRoute = `${this.props.rootPath}/collections/${this.props.activeCollection.id}#${uri}`;
        this.props.dispatch(push(pageRoute));
        window.clearTimeout(deleteTimer);
        notifications.remove(notificationID);

        return pageRoute //using 'return' so that we can test the correct new URL has been generated
    }

    handleCollectionPageDeleteClick(uri, title, state) {
        const collectionID = this.props.collectionID;
        this.setState(state => ({
            pendingDeletedPages: [...state.pendingDeletedPages, uri]
        }));
        const collectionURL = location.pathname.replace(`#${uri}`, "");
        this.props.dispatch(push(collectionURL));

        const triggerPageDelete = () => {
            collections.deletePage(collectionID, uri).then(() => {
                const pages = this.props.activeCollection[state].filter(page => {
                    return page.uri !== uri;
                });
                const updatedCollection = {
                    ...this.props.activeCollection,
                    [state]: pages
                };
                updatedCollection.canBeApproved = collectionMapper.collectionCanBeApproved(updatedCollection);
                updatedCollection.canBeDeleted = collectionMapper.collectionCanBeDeleted(updatedCollection);
                this.props.dispatch(addPagesToActiveCollection(updatedCollection));
                window.clearTimeout(deletePageTimer);
            }).catch(error => {
                collectionDetailsErrorNotifications.deletePage(error, title, this.props.collectionID);
                console.error("Error deleting page from a collection: ", error);
            });
        }

        const deletePageTimer = setTimeout(triggerPageDelete, 6000);

        const undoPageDelete = () => {
            this.handleCollectionPageDeleteUndo(deletePageTimer, uri, notificationID);
        };

        const handleNotificationClose = () => {
            triggerPageDelete();
            notifications.remove(notificationID);
        }

        const notification = {
            buttons: [
                {
                    text: "Undo",
                    onClick: undoPageDelete
                },
                {
                    text: "OK",
                    onClick: handleNotificationClose
                }
            ],
            type: 'neutral',
            isDismissable: false,
            autoDismiss: 6000,
            message: `Deleted page '${title}' from collection '${this.props.activeCollection.name}'`
        }
        const notificationID = notifications.add(notification);

        return collectionURL //using 'return' so that we can test the correct new URL has been generated
    }

    handleDrawerCloseClick() {
        this.setState({
            drawerIsAnimatable: true,
            drawerIsVisible: false
        });
    }

    handleRestoreDeletedContentClose() {
        this.props.dispatch(push(url.resolve("../")));
    }

    handleRestoreDeletedContentSuccess(restoredItem) {
        const addDeleteToInProgress = {
            uri: restoredItem.uri,
            title: restoredItem.title,
            type: restoredItem.type
        };

        const updatedActiveCollection = {
            ...this.props.activeCollection,
            inProgress: [...this.props.activeCollection.inProgress, addDeleteToInProgress]
        };

        this.props.dispatch(addPagesToActiveCollection(updatedActiveCollection));

        this.handleRestoreDeletedContentClose();
    }

    renderLoadingCollectionDetails() {
        return (
            <CollectionDetails
                id={this.props.collectionID}
                isLoadingNameAndDate={true}
                isLoadingDetails={true}
                onClose={this.handleDrawerCloseClick}
                onPageClick={this.handleCollectionPageClick}
                onEditPageClick={this.handleCollectionPageEditClick}
                onDeletePageClick={this.handleCollectionPageDeleteClick}
                onDeleteCollectionClick={this.handleCollectionDeleteClick}
                onApproveCollectionClick={this.handleCollectionApproveClick}
                onCancelPageDeleteClick={this.handleCancelPageDeleteClick}
            />
        )
    }

    renderCollectionDetails() {
        return (
            <CollectionDetails 
                {...this.props.activeCollection}
                activePageURI={this.props.activePageURI}
                inProgress={collectionMapper.pagesExcludingPendingDeletedPages(this.props.activeCollection['inProgress'], this.state.pendingDeletedPages)}
                complete={collectionMapper.pagesExcludingPendingDeletedPages(this.props.activeCollection['complete'], this.state.pendingDeletedPages)}
                reviewed={collectionMapper.pagesExcludingPendingDeletedPages(this.props.activeCollection['reviewed'], this.state.pendingDeletedPages)}
                onClose={this.handleDrawerCloseClick}
                onPageClick={this.handleCollectionPageClick}
                onEditPageClick={this.handleCollectionPageEditClick}
                onDeletePageClick={this.handleCollectionPageDeleteClick}
                onDeleteCollectionClick={this.handleCollectionDeleteClick}
                onApproveCollectionClick={this.handleCollectionApproveClick}
                onCancelPageDeleteClick={this.handleCancelPageDeleteClick}
                isLoadingNameAndDate={false}
                isLoadingDetails={this.state.isFetchingCollectionDetails}
                isCancellingDelete={this.state.isCancellingDelete}
                isApprovingCollection={this.state.isApprovingCollection}
            />
        )
    }

    renderEditCollection() {
        return (
            <CollectionEditController
                name={this.props.activeCollection.name}
                id={this.props.activeCollection.id}
            />
        )
    }

    render() {
        return (
            <div>
                <Drawer
                    isVisible={this.state.drawerIsVisible} 
                    isAnimatable={this.state.drawerIsAnimatable} 
                    handleTransitionEnd={this.handleDrawerTransitionEnd}
                >
                    {(this.props.collectionID && !this.props.activeCollection) &&
                        this.renderLoadingCollectionDetails()
                    }
                    {(this.props.activeCollection && !this.state.isEditingCollection) &&
                        this.renderCollectionDetails()
                    }
                    {(this.props.activeCollection && this.state.isEditingCollection) &&
                        this.renderEditCollection()
                    }
                </Drawer>
                {(this.state.isRestoringContent && this.props.activeCollection) &&
                    <Modal sizeClass="grid__col-8">
                        <RestoreContent onClose={this.handleRestoreDeletedContentClose} onSuccess={this.handleRestoreDeletedContentSuccess} activeCollectionId={this.props.activeCollection.id} />
                    </Modal>
                }
            </div>
        )
    }
}

CollectionDetailsController.propTypes = propTypes;

export function mapStateToProps(state) {
    return {
        collections: state.state.collections.all,
        activeCollection: state.state.collections.active,
        rootPath: state.state.rootPath,
        activePageURI: state.routing.locationBeforeTransitions.hash.replace('#', '')
    }
}

export default connect(mapStateToProps)(CollectionDetailsController);