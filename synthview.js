/*global $*/

var SynthViewController = ( function() {
	var viewObjectMakers;

	function SynthViewController( model ) {
		this.contents = [];
		this.model = model;
		this.container = document.body;
		model && (model.controller = this);

		this.initView();

	}

	SynthViewController.prototype.initView = function() {
		var model = this.model;

		this.drawToolbar();

		// draw view container
		this.$view = getViewObject( model );
		$( this.container ).append( this.$view );

		//this.$output = $( getViewObject( model.destination ) );
		//this.$view.append( this.$output );

		// click handler for components
		this.$view.on('click', '.component', function () {
			console.log('cliked');
			model.manipulate( $( this ).text() );
		});
	};

	SynthViewController.prototype.drawToolbar = function(){
		var buttons = [
			{ value : 'createOscillator' , type : 'add' },
			{ value : 'createGain', type : 'add' },
			{ value : 'createBiquadFilter', type : 'add' }
		],
			$toolbar = $('<div>').addClass('toolbar'),
			self = this;

		buttons.forEach( function( def ) {
			$toolbar.append(
				$('<div>').addClass( 'button sprite ' + def.value )
					.attr( 'data-type' , def.type )
					.attr( 'data-value' , def.value )
					.click( function () {
						self.model.manipulate( def );
					})
			);
		});

		$( this.container ).append( $toolbar );

	};


	var	updateActions = {
		add : function ( update ) {
			var $viewObj =  getViewObject( update.object) ;
			this.$view.append( $viewObj );
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
