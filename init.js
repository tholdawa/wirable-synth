/*global jsPlumb, $*/

$(function() {
	var model = new SynthModel();
	var controller = new SynthViewController( model );

	jsPlumb.Defaults.Container = $('body');

	window.model = model;

	model.add( model.destination );
	model.add( model.context.createOscillator() );
	model.add( model.context.createGain() );
});
