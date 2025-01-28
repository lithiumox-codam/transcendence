import WS from './websocket';

export class User {
    static instance = null;
    data = $state();

    constructor() {
        this.instance = null;
        this.data = 
        WS.addListener('user', this.handleUserUpdate);
    }

    handleUserUpdate = (update) => {
        this.userdata = update.data
        console.log('User data updated:', this.userdata);
    }

}