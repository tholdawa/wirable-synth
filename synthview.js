/*global $*/

var SynthViewController = ( function() {
	var viewObjectMakers;

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

	viewObjectMakers = {
		_baseComponent : function( modelObject ) {
			return $('<div>')
				.addClass('component ' + modelObject.constructor.name )
				.append('<div class="label">' +
						modelObject.constructor.name + '</div>');
		},
		default : function( modelObject ) {
			return viewObjectMakers._baseComponent( modelObject )
				.addClass('unknown');
		},
		AudioNode : function( modelObject ) {
			var uuid,
				param,
				$param,
				$input,
				$output,
				$viewObject = viewObjectMakers._baseComponent( modelObject )
					.addClass('AudioNode'),
				$inputs = $('<div>').addClass('inputs container'),
				$outputs = $('<div>').addClass('outputs container'),
				$inOuts = $('<div>').addClass('inOuts');

			for ( uuid in modelObject.PARAMIDs ) {
				param = modelObject.PARAMIDs [ uuid ];
				$param = $('<div>')
					.addClass('input paramInput')
					.text( 'Param: ' +  param.name )
					.attr( 'data-type' , 'param' )
					.attr( 'data-input' , uuid );
				$inputs.append( $param );
			};

			for ( uuid in modelObject.INPUTIDs ) {
				$input = $('<div>')
					.addClass('input audioInput')
					.text( 'input ' + modelObject.INPUTIDs [ uuid ] )
					.attr( 'data-type' , 'input' )
					.attr( 'data-input' , uuid );
				$inputs.append( $input );
			};

			for ( uuid in modelObject.OUTPUTIDs ) {
				$output = $('<div>')
					.addClass('output audioOutput')
						.text( 'output ' + modelObject.OUTPUTIDs [ uuid ] )
						.attr( 'data-type' , 'output' )
						.attr( 'data-output' , uuid );
				$outputs.append( $output );
			};

			$viewObject.append( $inOuts.append( $inputs , $outputs ) );

			return $viewObject;
		},
		SynthModel : function( modelObject ) {
			return $('<div>').addClass('view');
		}
	};


	function getViewObject( modelObject ) {

		var viewType, $viewObject;

		viewType = modelObject instanceof AudioNode ?
			'AudioNode' :
			modelObject.constructor.name;


		$viewObject = ( viewObjectMakers [ viewType ] ||
				  viewObjectMakers.default )( modelObject );

		return $viewObject;
	}



	return SynthViewController;
})();
