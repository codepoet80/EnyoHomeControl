name = "homecontrol";
updateRate = 200000;
updateInt = null;
enyo.kind({
	name: "enyo.HomeControl",
	kind: enyo.VFlexBox,
	environment: null,
	homeHelper: null,
	username: null,
	password: null,
	server: null,
	online: false,
	layoutData: null,
	selectedRoom: null,
	roomChanged: false,
	accessoryData: null,
	selectedAccessory: null,
	currentAccessory: null,
	components: [
		{kind: "Helpers.Homebridge", name: "myHomebridge", onConnectHomeReady: "homeDataReady", onUpdateAccessoriesReady: "accessoryDataUpdated", onSetAccessoryReady: "", onError: "" },
		{kind: "Helpers.Updater", name: "myUpdater" },
		//UI Elements
		{kind: "PageHeader", className: "enyo-header-dark", components: [
			{kind: "VFlexBox", flex: 1, align: "center", components: [
				{content: "Home Control", domStyles: {"font-weight": "bold"}},
			]},
			{kind: "Button", className: "enyo-button-dark", caption: "Sign Out", onclick: "backHandler"},
		]},
		{name: "slidingPane", kind: "SlidingPane", flex: 1, onSelectView: "slidingSelected", components: [
			{name: "panelRooms", width: "250px", components: [
				{name: "headerRoom", kind: "Header", components: [
					{w: "fill", content:"Rooms", domStyles: {"font-weight": "bold"}},
					{kind: "Image", flex:1, name: "spinnerRoom", src: "images/spinner.gif", domStyles: {width: "20px"}},					
				]},
				{kind: "Scroller", flex:1, domStyles: {"margin-top": "0px", "min-width": "130px"}, components: [
					{flex: 1, name: "roomList", kind: enyo.VirtualList, className: "list", onSetupRow: "renderRoomRow", components: [
						{kind: "Item", className: "item", title: "", onclick: "roomClick", /*Xonmousedown: "roomClick",*/ components: [
							{w: "fill", name:"roomListContainer", domStyles: {margin: "-12px", padding: "12px"}, components: [
								{kind: "HFlexBox", components: [
									{name: "roomCaption", flex: 2, domStyles: {overflow: "hidden", "text-overflow": "ellipsis"} },
									/*{w: "fill", flex: 1, name: "roomType", domStyles: {"text-align": "right"}}*/
								]}	
							]}
						]}
					]},
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"},
					{caption: "Update", onclick: "periodicUpdate"}
				]}
			]},
			{name: "panelAccessories", width: "300px", /*fixedWidth: true,*/ peekWidth: 100, components: [
				{name: "headerAccessories", kind: "Header", components: [
					{w: "fill", content:"Accessories", domStyles: {"font-weight": "bold"}},
					{kind: "Image", flex:1, name: "spinnerAccessories", src: "images/spinner.gif", domStyles: {width: "20px"}},					
				]},
				{kind: "Scroller", flex:1, domStyles: {"margin-top": "0px", "min-width": "130px"}, components: [
					{flex: 1, name: "accessoryList", kind: enyo.VirtualList, className: "list", onSetupRow: "renderAccessoryList", components: [
						{kind: "Item", className: "item", onclick: "accessoryClick", /*Xonmousedown: "accessoryClick",*/ components: [
							{w: "fill", name:"accessoryListContainer", domStyles: {margin: "-12px", padding: "12px", "align-items": "center"}, components: [
								{kind: "HFlexBox", components: [
									{kind: "CheckBox", flex: 1, name: "accessoryIcon", content:" ", className: "accessoryListItem", domStyles: {width: "30px"} },
									{name: "accessoryCaption", flex: 2, domStyles: {overflow: "hidden", "padding-top": "10px", "padding-left": "8px", "text-overflow": "ellipsis"} },									
								]}	
							]}
						]}
					]},
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"},
				]}
			]},
			{name: "panelDetail", flex: 2, dismissible: false, peekWidth:210, onHide: "rightHide", onShow: "rightShow", onResize: "slidingResize", components: [	  
				{name: "headerDetail", kind: "Header", content: "Nothing Selected", domStyles: {"font-weight": "bold", overflow: "hidden", "text-overflow": "ellipsis"}},
				{kind: "Pane", name:"paneController", flex:2, lazy:true, transitionKind: "enyo.transitions.LeftRightFlyin" /*or .Fade*/, onSelectView: "accessoryControllerReady", components: [
					{kind: "Controller.Default", name: "controllerDefault", onAccessoryChanged:"accessoryChanged" },
					{kind: "Controller.Lightbulb", name: "controllerLightbulb", onAccessoryChanged:"accessoryChanged"},
					{kind: "Controller.TemperatureSensor", name: "controllerTemperatureSensor", onAccessoryChanged:"accessoryChanged"},
					{kind: "Controller.GarageDoor", name: "controllerGarageDoor", onAccessoryChanged:"accessoryChanged"}
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"}
				]}
			]}
		]},
	],
	create: function() {
		this.inherited(arguments);

		//Detect environment for appropriate behavior
		this.environment = enyo.fetchDeviceInfo();
		if (this.environment)
			this.$.myUpdater.CheckForUpdate("Home Control");
		if (window.location.hostname && window.location.hostname.indexOf(".media.cryptofs.apps") != -1) {   // Running on webOS
			enyo.log("webOS environment detected");
		} else if(window.location.href.indexOf("file:///media/cryptofs") != -1) { // Running on LuneOS
			enyo.log("LuneOS environment detected");
		} else {    // Running in a web browser
			enyo.warn("embedded environment not detected, assuming a web server!");
		}

		//Load preferences
		//TODO: username and password
		this.username = "admin";
		this.password = "admin";
		//TODO: server path
		this.server = "homebridge.jonandnic.com";
		//TODO: helper type (support for multiple back-ends)
		this.homeHelper = this.$.myHomebridge;

		//Assign helper to controllers
		for (var i=0;i<this.$.paneController.controls.length;i++) {
			enyo.log("Assigning helper to controller: " + this.$.paneController.controls[i].name);
			this.$.paneController.controls[i].helper = this.homeHelper;
		}
		
		//Login and Load Home Layout
		this.homeHelper.ConnectHome(this, this.server, this.username, this.password);
		updateInt = window.setInterval(this.periodicUpdate.bind(this), updateRate);
	},
	periodicUpdate: function() {
		enyo.log("Update fired, online: " + this.online);
		window.clearInterval(updateInt);
		if (this.online) {
			this.$.spinnerAccessories.applyStyle("display", "inline");
			this.homeHelper.UpdateAccessories(this)
		}
		updateInt = window.setInterval(this.periodicUpdate.bind(this), updateRate);
	},
	homeDataReady: function() {
		this.online = true;
		enyo.log("Home data is ready for: " + this.name);
		this.layoutData = this.homeHelper.GetHomeLayout();
		this.$.spinnerRoom.applyStyle("display", "none");
		this.$.roomList.refresh();

		enyo.log("Calling for updated accessory data on: " + this.name);
		this.homeHelper.UpdateAccessories(this);
	},
	renderRoomRow: function(inSender, inIndex) {
		if (this.layoutData && this.layoutData.length > 0) {
			var record = this.layoutData[inIndex];
			if (record) {
				this.$.roomCaption.setContent(record.caption);
				var isRowSelected = (inIndex == this.$.selectedRoom);
				if (isRowSelected) {
					this.$.roomListContainer.applyStyle("background-color", "dimgray");
					this.$.roomListContainer.applyStyle("color", "white");
					if (this.roomChanged) {
						enyo.log("refreshing room list because of selection change");
						this.roomChanged = false;
						enyo.log("room data: " + JSON.stringify(record));
						this.showAccessoryController(record);
					} else {
						enyo.log("refreshing room list because of background sync");
					}
					//Load the accessory list for the selected room
					enyo.log("Get accessory data for room: " + record.uniqueId);
					this.accessoryData = this.homeHelper.GetAccessoryDataForRoom(record.uniqueId, true);
					this.$.accessoryList.refresh();
				} else {
					this.$.roomListContainer.applyStyle("background-color", null);
					this.$.roomListContainer.applyStyle("color", null);
				}
				return true;
			}
		}
	},
	roomClick: function(inSender, inEvent) {
		enyo.log("Room clicked on row: " + inEvent.rowIndex);
		this.selectNextView();
		if (this.$.selectedRoom != inEvent.rowIndex) {
			this.roomChanged = true;
			this.$.selectedRoom = inEvent.rowIndex;
			this.$.selectedAccessory = null;
			this.$.roomList.select(inEvent.rowIndex); //OR: this.$.roomList.refresh();
		}
	},
	renderAccessoryList: function(inSender, inIndex) {
		if (this.accessoryData && this.accessoryData.length > 0) {
			var record = this.accessoryData[inIndex];
			if (record) {
				this.$.accessoryCaption.setContent(record.caption || record.uniqueId);
				this.$.accessoryIcon.setClassName("enyo-checkbox");
				this.$.accessoryIcon.addClass("accessoryListItem");
				this.$.accessoryIcon.addClass(record.class);
				this.$.accessoryIcon.addClass(record.state);
				var isRowSelected = (inIndex == this.$.selectedAccessory);
				this.$.accessoryListContainer.addRemoveClass("highlightedRow", isRowSelected);
				if (isRowSelected) 
					this.showAccessoryController(record);
				return true;
			}
		}
	},
	accessoryClick: function(inSender, inEvent) {
		enyo.log("Accessory click on row: " + inEvent.rowIndex);
		this.selectNextView();
		this.$.selectedAccessory = inEvent.rowIndex;
		this.$.accessoryList.select(inEvent.rowIndex);	//OR: this.$.accessoryList.refresh();
	},
	accessoryDataUpdated: function() {
		enyo.log("Accessories updated on: " + this.name);
		this.$.spinnerAccessories.applyStyle("display", "none");
		this.$.roomList.refresh();
	},
	showAccessoryController: function(accessory) {
		var useController = this.findControllerForAccessoryType(accessory.type);
		enyo.log("Loading controller: " + useController + " for accessory type: " + accessory.type);
		this.$.headerDetail.setContent(accessory.type.toTitleCase());
		this.$.paneController.selectViewByName(useController);
		this.currentAccessory = accessory;
	},
	accessoryControllerReady: function (inSender, inView, inPrevious) {
		enyo.log("Controller:" + inView.name + " ready for Accessory: " + this.currentAccessory.caption);
		inView.setProperty("accessory", this.currentAccessory);
	},
	accessoryChanged: function(inSender, inEvent){
		//find and update the accessory in the list by id
		for (var i=0;i<this.accessoryData.length;i++) {
			if (this.accessoryData[i].uniqueId == inSender.accessory.uniqueId)
				this.accessoryData[i].state = inSender.state;
		}
	 	this.$.accessoryList.refresh();
	},
	findControllerForAccessoryType: function(accessoryType) {
		var candidateController = "controllerDefault";
		var controllers = this.$.paneController.controls;
		for (var i=0;i<controllers.length;i++) {
			//enyo.log("current detail pane: " + controllers[i].name + " supports " + JSON.stringify(controllers[i].SupportedAccessories));
			if (controllers[i].SupportedAccessories && controllers[i].SupportedAccessories.indexOf(accessoryType) != -1) {
				if (controllers[i].SupportedAccessories.length == 1)
					return controllers[i].name;		//prefer exact matches
				else
					candidateController = controllers[i].name;		//otherwise, we'll use the best (and last) match
			}
		}
		return candidateController;
	},
	selectNextView: function () {
		if (this.environment && this.environment.modelName.toLowerCase() != "touchpad") {
			var pane    = this.$.slidingPane;
			var viewIdx = pane.getViewIndex();
			if (viewIdx < pane.views.length - 1) {
				viewIdx = viewIdx + 1;
			} else {
				return;	// we've selected the last available view.
			}
			pane.selectViewByIndex(viewIdx);
		}
	}
});
String.prototype.toTitleCase = function() {
	return this.replace(
		/\w\S*/g,
		function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

EnumerateObject = function(objectToEnumerate) {
    for (var key in objectToEnumerate) {
        enyo.log("=== prop:" + key + ": " + objectToEnumerate[key]);
        if (objectToEnumerate.hasOwnProperty(key)) {
            var obj = objectToEnumerate[key];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    enyo.log("...... sub: " + prop + " = " + obj[prop])
                }
            }
        }
    }
}

