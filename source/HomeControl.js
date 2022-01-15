var baseURL = "http://192.168.1.250/api/";
var bearerToken = null;
enyo.kind({
	name: "enyo.HomeControl",
	kind: enyo.VFlexBox,
	bearerToken: "not set",
	components: [
		{kind: "WebService", name: "doLogin", url: baseURL + "auth/login",
        	method: "POST",
        	onSuccess: "loginSuccess",
        	onFailure: "loginFailure"},
		{kind: "WebService", name:"getLayout", url: baseURL + "accessories/layout", 
			method: "GET",
			headers: { "Authorization": "Bearer " + this.bearerToken, "Name": "Jon" },
			onSuccess: "layoutSuccess", 
			onFailure: "layoutFailure"},
		{kind: "Helpers.Updater", name: "myUpdater" },
		//UI Elements
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, align: "center", components: [
				{content: "Home Control"},
			]}
		]},
		{kind: "Control", flex:1, layoutKind: "VFlexLayout", pack: "center", align: "middle", components: [
			{kind: "HFlexBox", flex: 1, components: [
				{kind: "Scroller", flex:1, domStyles: {"margin-top": "0px", "min-width": "130px"}, components: [
					{flex: 1, name: "list", kind: enyo.VirtualList, className: "list", onSetupRow: "listSetupRow", components: [
							{kind: "Item", className: "item", components: [
								{kind: "HFlexBox", components: [
									{name: "itemCaption", flex: 2},
									{w: "fill", flex: 1, name: "itemValue", domStyles: {"text-align": "right"}}
								]},
						]}
					]},
				]},
				{kind: "VFlexBox", flex: 2, pack: "center", components: [
					{w: "fill", domStyles: {"text-align": "center"}, components: [
						//{kind: "Image", flex:1, name: "DeploymentImage", src: "jwtelescope.png", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
					]},
					{w: "fill", name: "DeploymentDetail", content: "Current Accessory: ", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
				]},
			]},
			{kind: "Button", caption: "Update", onclick: "loadData"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		//Login
		this.$.doLogin.call({username: "admin", password: "admin"});

		//Detect environment for appropriate service paths
		enyo.log("Starting up on " + window.location.hostname);
		if (window.location.hostname != ".media.cryptofs.apps.usr.palm.applications.com.jonandnic.enyo.homecontrol") {
			enyo.warn("webOS environment not detected, assuming a web server!");
			baseURL = "localproxy.php?" + baseURL;			
		}
		/*
		//Setup the data list
		this.data = [];
		this.captions.forEach(function(currVal, index) {
			this.data.push({caption: currVal, value: "" + this.units[index]});
		}.bind(this));
		//Get the data
		this.loadData();
		//Check for app updates
		this.$.myUpdater.CheckForUpdate("Webb Telescope Tracker");
		*/
	},
	loginSuccess: function(inSender, inResponse, inRequest)  {
		enyo.log("login response was: " + JSON.stringify(inResponse));	
		if (inResponse && inResponse.access_token) {
			this.bearerToken = inResponse.access_token;
			enyo.log("Success! Using bearer token: " + this.bearerToken);
			this.loadLayout();
		} else {
			this.loginFailure(inSender, inResponse, inRequest);
		}
	},
	loginFailure: function(inSender, inResponse, inRequest) {

	},
	listSetupRow: function(inSender, inIndex) {
		if (this.data && this.data.length > 0) {
			var record = this.data[inIndex];
			if (record) {
				this.$.itemCaption.setContent(record.caption);
				this.$.itemValue.setContent(record.value);
				return true;
			}
		}
	},
	loadLayout: function(inSender) {
		enyo.warn("Querying data source using token: " + this.bearerToken);
		//this.$.getLayout.setUrl(useUrl);
		this.$.getLayout.setHeaders({"Authorization": "Bearer " + this.bearerToken});
		this.$.getLayout.call();
	},
	layoutSuccess: function(inSender, inResponse) {
		data = inResponse;
		//console.log("Parsing raw data: " + JSON.stringify(this.data));

		/*this.captions.forEach(function(currVal, index) {
			this.data.push({caption: currVal, value: "" + this.units[index]});
		}.bind(this));*/
		var flattenedData = [];
		for (var i=0;i<data.length;i++) {
			//console.log(JSON.stringify(this.data[i]));
			if (data[i].services) {	//this is a room!
				console.log("room: " + data[i].name)
				flattenedData.push({caption: "Room", value: data[i].name});
				var services = data[i].services;
				for (var j=0;j<services.length;j++) {
					console.log("service: " + services[j].uniqueId);
					flattenedData.push({caption: "Accessory", value: services[j].uniqueId});
				}
			}
		}
		console.log("Formatted data: " + JSON.stringify(flattenedData));
		enyo.warn("Updating UI...");
//		this.$.DeploymentDetail.setContent(this.data.currentDeploymentStep);
//		this.$.DeploymentImage.setSrc(this.data.deploymentImgURL)
		this.data = flattenedData;
		this.$.list.refresh();
	}
});