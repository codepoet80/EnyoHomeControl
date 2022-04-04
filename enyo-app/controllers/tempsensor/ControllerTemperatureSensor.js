enyo.kind({
	name: "Controller.TemperatureSensor",
	kind: "Control",
	layoutKind: "VFlexLayout", 
	SupportedAccessories: [
		"temperaturesensor"
	],
	components: [
		{kind:"Scroller", flex: 1, components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/tempsensor/thermometer.png", onclick: "lightControlClick", domStyles: {height: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Temperature Sensor", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},

	],
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.35) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.35) + "px");
	},
});
