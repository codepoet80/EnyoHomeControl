enyo.kind({
	name: "Controller.GarageDoor",
	kind: "Control",
	/* Public Interface */
	SupportedAccessories: [
		"garagedoor"
	],
	published: {
		accessory: null,
		helper: null,
		state: false,
		amount: 50,
		condition: true
	},
	events: {
        onAccessoryChanged: ""
	},
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.4) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.4) + "px");
	},
	stateChanged: function(oldState) {	//This is a UI function only, to actually change the accessory value, call the Helper
		enyo.log(this.name + " is setting " + this.SupportedAccessories[0] + " state from: " + oldState + " to " + this.state);
		var newCaption = "Closed";
		switch(this.state) {
			case true:
				newCaption = "Open"
				this.$.imageDetail.setSrc("controllers/garagedoor/garagedoor-open.png");
				break;
			default:
				this.$.imageDetail.setSrc("controllers/garagedoor/garagedoor-closed.png");
				break;
		}

		if (this.accessory.caption)
			newCaption = this.accessory.caption + " " + newCaption;
		enyo.log("the caption should be: " + newCaption);
		this.$.captionDetail.setContent(newCaption);
	},
	accessoryChanged: function(oldAccessory) {
		enyo.log(this.name + " has been informed of a new accessory " + this.accessory.caption);
		//enyo.log(JSON.stringify(this.accessory));
		this.state = this.accessory.state;
		this.stateChanged();
		this.amount = this.accessory.amount;
		this.condition = this.accessory.condition;
	},
	/* Private Definitions */
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/garagedoor/garagedoor-closed.png", onclick: "garageControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Garage Controller", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},
	],
	garageControlClick: function(inSender, inEvent) {
		enyo.log(this.name + " saw " + this.SupportedAccessories[0] + " clicked for ID: " + JSON.stringify(this.accessory.uniqueId));
		var newState = !this.state;
		this.state = newState;
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, "state", newState);
		this.stateChanged();
		this.doAccessoryChanged(inEvent);
	}
});
