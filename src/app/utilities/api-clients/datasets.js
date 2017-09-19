import http from '../http';

export default class datasets {

    static get(datasetID) {
        return http.get(`/dataset/datasets/${datasetID}`)
            .then(response => {
                return response;
            });
    }
    
    static getAll() {
        return http.get(`/dataset/datasets`)
            .then(response => {
                return response;
            });
    }

    static getInstance(instanceID) {
        return http.get(`/dataset/instances/${instanceID}`)
            .then(response => {
                return response;
            });
    }
    
    static getCompletedInstances() {
        return http.get(`/dataset/instances?state=completed`)
            .then(response => {
                return response;
            });
    }
}