export const initialState = {
    collections: {
        all: [],
        active: null,
        toDelete: {},
        isLoading: false,
        isUpdating: false,
    },
    config: {
        enableDatasetImport: false,
        enableNewSignIn: false,
        enableNewUpload: false,
    },
    global: {
        workingOn: null,
    },
    rootPath: "/florence",
    teams: {
        active: {},
        all: [],
        users: [],
        isLoading: false,
    },
    users: {
        active: {},
        all: [],
        isAdding: false,
        isLoading: false,
        isUpdating: false,
        previewUsers: [],
        isLoadingActive: false,
        isRemovingAllTokens: false,
    },
    user: {
        data: null,
        groups: [],
        isLoading: false,
    },
    groups: {
        all: [],
        isLoading: false,
    },
    datasets: {
        all: [],
        jobs: [],
        activeInstance: {},
        recipes: [],
        activeJob: {},
    },
    isUserAddingToGroups: false,
    search: "",
    notifications: [],
    popouts: [],
    preview: {
        selectedPage: null,
    },
};
