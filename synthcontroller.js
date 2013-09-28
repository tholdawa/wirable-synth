var SynthController = ( function() {

	function SynthController(){
		this.view = new SynthView( this );
		this.model = new SynthModel( this );
	}

	SynthController.prototype.update = function( update ) {
		this.view.update( update );
	};

	SynthController.prototype.manipulate = function( change ) {
		this.model.manipulate( change );
	};



	return SynthController;
})();
