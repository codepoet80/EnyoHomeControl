/*
Homebridge Helper
 Version 0.1
 Created: 2022
 Author: Jonathan Wise
 License: MIT
 Description: A helper to interact with Homebridge for home automation
*/
name = "homebridgehelper",
homebridgeApiUrl = "http://homebridge.local/api/";
enyo.kind({
    name: "Helpers.Homebridge",
    kind: "Control",
    sender: null,   //Use this to manage scope in callbacks

    //#region Public
    //  This stuff must be implemented to support the UI, but the details of the implementation are up to you
    published: {
        OnDataReady: function(sender) { enyo.warn("Homebridge Helper loaded data, but no one is listening to the event!"); },
        OnDataFailure: function(sender) { enyo.error("Homebridge Helper could not logon or load data from Homebridge!"); }
    },
    create: function() {
        this.inherited(arguments);
        enyo.log("Homebridge Helper created as: " + this.name);
    },
    LoadHomeData: function(sender, server, user, pass, successHandler, failureHandler) {
        if (server)
            homebridgeApiUrl = homebridgeApiUrl.replace("homebridge.local", server);
        enyo.log("Homebridge Helper is trying to get data from server " + homebridgeApiUrl + " with credentials: " + user + ", " + pass + " for sender: " + sender.name);

        this.sender = sender;

        if (successHandler)
            this.OnDataReady = successHandler.bind(this);
        if (failureHandler)
            this.OnDataFailure = failureHandler.bind(this);

        this.$.doLogin.call({username: user, password: pass});
    },
    GetHomeData: function() {   //All the data in the home
        var normalizedData = [];
		for (var i=0;i<this.homeData.length;i++) {
			if (this.homeData[i].services) {	//this is a room!
				normalizedData.push({caption: data[i].name, type: "Room"});
				var services = this.homeData[i].services;
				for (var j=0;j<services.length;j++) {
					normalizedData.push({caption: services[j].uniqueId, type: "Accessory"});
				}
			}
		}
        return normalizedData;
    },
    GetHomeLayout: function() { //Just the layout of the home (eg: rooms or zones)
        var normalizedData = [];
		for (var i=0;i<this.homeData.length;i++) {
			if (this.homeData[i].services) {
				normalizedData.push({caption: this.homeData[i].name, type: "Room"});
			}
		}
        return normalizedData;
    },
    GetAccessoryDataForRoom: function(roomId) {   //Just the accessories in a given room

    },
    GetAccessoryDetail: function(accessoryId) {    //Details for a specific accessory

    },
    //#endregion

    //#region Private implementation stuff
    bearerToken: "not set",
    homeData: [],
    components: [
        { kind: "WebService", name: "doLogin", url: homebridgeApiUrl + "auth/login",
            method: "POST",
            onSuccess: "loginSuccess",
            onFailure: "loginFailure" },
        { kind: "WebService", name:"getLayout", url: homebridgeApiUrl + "accessories/layout", 
            method: "GET",
            headers: { "Authorization": "Bearer " },    //to be filled in later
            onSuccess: "getLayoutSuccess", 
            onFailure: "getLayoutFailure" },
    ],
    loginSuccess: function(inSender, inResponse, inRequest)  {
		enyo.log("Homebridge Helper got login response: " + JSON.stringify(inResponse));	
		if (inResponse && inResponse.access_token) {
			this.bearerToken = inResponse.access_token;
			enyo.log("Homebridge Helper login success, token is: " + this.bearerToken);
			this.getHomeData(inSender);
		} else {
			this.loginFailure(inSender, inResponse, inRequest);
		}
	},
    loginFailure: function(inSender, inResponse, inRequest) {

	},
    getHomeData: function(inSender) {
		enyo.log("Homebridge Helper is querying data source using token: " + this.bearerToken);
		this.$.getLayout.setHeaders({"Authorization": "Bearer " + this.bearerToken});
		this.$.getLayout.call();
	},
    getLayoutSuccess: function(inSender, inResponse, inRequest) {
        if (inResponse) { //and its an object
            enyo.log("Homebridge Helper got layout response: " + inResponse);
            this.homeData = inResponse;
            this.OnDataReady(this.sender);
        } else {
            this.$.getLayoutFailure(inSender, inResponse, inResponse);
        }
    },
    getLayoutFailure: function(inSender, inResponse, inRequest) {

    },
    //#endregion
});