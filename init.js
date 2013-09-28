$(function() {
	var model = new SynthModel();
	var controller = new SynthViewController( model );

	model.add('Foo');
	model.add('Bar');

	model.add( model.destination );

	window.model = model;

	model.add ( model.context.createOscillator() );
});
