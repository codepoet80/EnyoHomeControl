enyo.kind({
	name: "Controller.TemperatureSensor",
	kind: "Control",
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "images/thermometer.png", onclick: "lightControlClick", domStyles: {height: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Temperature Sensor", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},

	],
	create: function() {
		enyo.warn("Temperature Sensor Controller created!");
		this.inherited(arguments);
	},
});
