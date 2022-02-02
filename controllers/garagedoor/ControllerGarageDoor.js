enyo.kind({
	name: "Controller.GarageDoor",
	kind: "Control",
	/* Public Interface */
	CurrentAccessory: null,
	CurrentHelper: null,
	CurrentState: false,
	SupportedAccessories: [
		"garagedoor"
	],
	published: {
        OnAccessoryStateChanged: function(sender) { enyo.warn(this.name + " changed accessory state, but no one is listening to the event!"); },
	},
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.4) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.4) + "px");
	},
	SetState: function(state) {	//This is a UI function only, to actually change the accessory value, call the Helper
		enyo.log(this.name + " is setting " + this.SupportedAccessories[0] + " state to: " + state);
		this.CurrentState = state || false;
		var newCaption = "Closed";
		switch(state) {
			case true:
				newCaption = "Open"
				this.$.imageDetail.setSrc("controllers/garagedoor/garagedoor-open.png");
				break;
			default:
				this.$.imageDetail.setSrc("controllers/garagedoor/garagedoor-closed.png");
				break;
		}

		if (this.CurrentAccessory.caption)
			newCaption = this.CurrentAccessory.caption + " " + newCaption;
		this.$.captionDetail.setContent(newCaption);
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
	garageControlClick: function() {
		var newState = !this.CurrentState;
		this.SetState(newState);
		enyo.log(this.SupportedAccessories[0] + " clicked for ID: " + JSON.stringify(this.CurrentAccessory.uniqueId) + " setting state on: " + this.CurrentAccessory.type + " to: " + newState);
		this.CurrentHelper.SetAccessoryValue(this, this.CurrentAccessory.uniqueId, this.CurrentAccessory.type, "state", newState);
		this.OnAccessoryStateChanged(this, this.CurrentAccessory.uniqueId, newState);
	}
});
