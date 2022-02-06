enyo.kind({
	name: "Controller.Colorbulb",
	kind: "Control",
	/* Public Interface */
	SupportedAccessories: [
		"colorbulb"
	],
	published: {
		accessory: null,
		helper: null,
		state: false,
		amount: 0,
		condition: true
	},
	events: {
		onAccessoryChanged: "",
	},
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.4) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.4) + "px");
		this.$.sliderDimmer.setProperty("position", 66);
	},
	stateChanged: function(oldState) {	//This is a UI function only, to actually change the accessory value, call the Helper
		enyo.log(this.name + " is setting " + this.SupportedAccessories[0] + " state from: " + oldState + " to " + this.state);
		var newCaption = "Off";
		switch(this.state) {
			case true:
				newCaption = "On"
				this.$.imageDetail.setSrc("controllers/lightbulb/lightbulb-on.png");
				break;
			default:
				this.$.imageDetail.setSrc("controllers/lightbulb/lightbulb-off.png");
				break;
		}
		if (this.accessory.caption)
			newCaption = this.accessory.caption + " " + newCaption;
		this.$.captionDetail.setContent(newCaption);
	},
	accessoryChanged: function(oldAccessory) {
		enyo.log(this.name + " has been informed of a new accessory " + this.accessory.caption);
		//enyo.log(JSON.stringify(this.accessory));
		this.state = this.accessory.state;
		this.stateChanged();
		this.amount = this.accessory.amount;
		this.$.sliderDimmer.setProperty("position", this.amount);
		this.condition = this.accessory.condition;
	},
	/* Private Definitions */
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/lightbulb/lightbulb-off.png", onclick: "lightControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Light Controller", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}},
			{kind: "Slider", name: "sliderDimmer", onChange: "dimmerChanged", domStyles: {width: "70%", "margin-left": "auto", "margin-right": "auto"}},
			{kind: "HtmlContent", name: "htmlColorPicker", srcId: "divColorPicker", onLinkClick: "", domStyles: {border: "1px solid blue", "margin-left": "auto", "margin-right": "auto"},
				content: "<input id='inputColorPicker' type='color' value='#ff0000'>"
			}
		]},
	],
	lightControlClick: function(inSender, inEvent){
		enyo.log(this.name + " saw " + this.SupportedAccessories[0] + " clicked for ID: " + JSON.stringify(this.accessory.uniqueId));
		var newState = !this.state;
		this.state = newState;
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, "state", newState);
		this.stateChanged();
		this.doAccessoryChanged(inEvent);
	},
	dimmerChanged: function(inSender, inEvent) {
		this.amount = this.$.sliderDimmer.position;
		enyo.log("Dimmer value: " + this.amount);
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, "amount", this.amount);
		this.doAccessoryChanged(inEvent);
	}
});