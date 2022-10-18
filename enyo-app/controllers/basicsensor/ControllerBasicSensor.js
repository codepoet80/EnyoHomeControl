enyo.kind({
	name: "Controller.BasicSensor",
	kind: "Control",
	layoutKind: "VFlexLayout", 
	SupportedAccessories: [
		"basicsensor"
	],
	components: [
		{kind:"Scroller", flex: 1, components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/basicsensor/sensor.png", onclick: "lightControlClick", domStyles: {height: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Basic Sensor", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},

	],
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.35) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.35) + "px");
		this.accessoryChanged();
	},
	stateChanged: function(oldState) {	//This is a UI function only, to actually change the accessory value, call the Helper
		enyo.log(this.name + " is setting " + this.SupportedAccessories[0] + " state from: " + oldState + " to " + this.state);
		/*var newCaption = "Off";
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
		*/
		this.$.captionDetail.setContent(this.accessory.caption + " " + this.accessory.data.humanType);
	},
	accessoryChanged: function(oldAccessory) {
		if (this.accessory && this.accessory.caption) {
			enyo.log(this.name + " has been informed of a new accessory " + this.accessory.caption);
			enyo.log(JSON.stringify(this.accessory));
			this.state = this.accessory.state;
			this.stateChanged();
			this.amount = this.accessory.amount;
			//this.$.sliderDimmer.setProperty("position", this.amount);
			this.condition = this.accessory.condition;
		}
	},
});
