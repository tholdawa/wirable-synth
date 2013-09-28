/*global $*/

var SynthViewController = ( function() {
	var viewObjects;

	function SynthViewController( model ) {
		this.contents = [];
		this.model = model;
		model && (model.controller = this);

		this.initView();

	}

	SynthViewController.prototype.initView = function() {
		var model = this.model;

		// draw view container
		this.$container = getViewObject( model );
		$( 'body' ).append( this.$container );

		//this.$output = $( getViewObject( model.destination ) );
		//this.$container.append( this.$output );

		// click handler for components
		this.$container.on('click', '.component', function () {
			console.log('cliked');
			model.manipulate( $( this ).text() );
		});
	};

	var	updateActions = {
		add : function ( update ) {
			var $viewObj =  getViewObject( update.object) ;
			this.$container.append( $viewObj );
			this.contents.push({view : $viewObj, model :  update.object });
		}
	};

	SynthViewController.prototype.update = function( update ) {
		( updateActions [ update.type ] || assert( false, 'invalid update') )
			.call( this, update );
	};

	viewObjects = {
		AudioDestinationNode: { 'class' : 'component input' },
		OscillatorNode: {'class' : 'component output' },
		SynthModel: { 'class' : 'container' },
		String: { 'class' : 'component string' }
	};


	function getViewObject( modelObject ) {
		var obj = viewObjects [ modelObject.constructor.name ];

		return $('<div />')
			.addClass( obj ['class'] )
			.text( modelObject.constructor.name );
	}



	return SynthViewController;
})();
