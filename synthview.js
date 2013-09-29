/*global $, jsPlumb*/
'use strict';

var SynthViewController = ( function() {
	var viewObjectMakers;

	function SynthViewController( model ) {
		this.contents = {};
		this.inputs = {};
		this.outputs = {};
		this.connections = {};
		this.model = model;
		this.container = document.body;
		model && (model.controller = this);

		this.initView();
		this.initJsPlumb();

	}

	SynthViewController.prototype.initView = function() {
		var model = this.model;

		this.drawToolbar();

		// draw view container
		this.$view = getViewObject( model );
		$( this.container ).append( this.$view );

		// click handler for components
		this.$view.on('click', '.component', function () {
			console.log('cliked');
			model.manipulate( $( this ).text() );
		});


	};

	SynthViewController.prototype.initJsPlumb = function() {

		jsPlumb.Defaults.Container = $('body');
		jsPlumb.Defaults.Anchors = ['Right', 'Left'];
		jsPlumb.Defaults.Overlays = ['PlainArrow'];

		jsPlumb.bind('connection', function( info ) {
			var src = info.sourceId,
				tgt = info.targetId,
				cxn = {};


			console.log( 'Connection made in view: ', info );

			if ( this.connections [ src ] &&
				 this.connections [ src ] [ tgt ] ) {
					 setTimeout( function() {
						 jsPlumb.detach( info.connection , {
							 fireEvent : false
						 });

						 console.log( 'duplicate connection detached' ,
									this.connections);
					 }.bind( this ), 0);
				 }
			else {
				cxn [ src ] = {};
				cxn [ src ] [ tgt ] = true;
				$.extend( true, this.connections, cxn );
				console.log('Connection added to view: ', this.connections );

				setTimeout( function() {
					this.model.manipulate({
						type : 'connect',
						sourceId : src,
						targetId :tgt
					});
				}.bind( this ), 0);

			}

		}.bind( this ));

		jsPlumb.bind('connectionDetached', function( info ) {
			delete this.connections [ info.sourceId ] [ info.targetId ];
			console.log('Connection removed from view\'s connections' ,
						this.connections );

			setTimeout( function() {
				this.model.manipulate({
					type : 'disconnect',
					sourceId : info.sourceId,
					targetId : info.targetId
				});
			}.bind( this ), 0);

		}.bind( this ));

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
			var $viewObj =  getViewObject.call( this , update.object );
			this.$view.append( $viewObj );
			this.contents [ update.object.UUID ] =
				{view : $viewObj, model :  update.object };
		},
		connect : function ( update ) {
			var src = update.sourceId,
				tgt = update.targetId;
			console.log( 'View Got connection : ' , update );
			if ( this.connections [ src ] &&
				 this.connections [ src ] [ tgt ] ) {
					 console.log( 'Connection already exists in view.' +
								  'Ignoring model\'s connect update');
				 }
			else {
				jsPlumb.connect({
					source : this.outputs [ update.sourceId ] ,
					target : this.inputs [ update.targetId ] ,
					anchors : ['Right', 'Left'] ,
					overlays : [ "Arrow" ]
				});
			}
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

			for ( uuid in modelObject.ParamIds ) {
				param = modelObject.ParamIds [ uuid ];
				$param = $('<div>')
					.addClass('input paramInput')
					.text(  param.name )
					.attr( 'data-type' , 'param' )
					.attr( 'data-input' , uuid )
					.attr( 'id' , uuid )
					.prepend('<div class="sprite param">');
				$inputs.append( $param );
				this.inputs [ uuid ] = $param;

				jsPlumb.makeTarget( $param , {
					isTarget : true
				});
			};

			for ( uuid in modelObject.InputIds ) {
				$input = $('<div>')
					.addClass('sprite input audioInput')
					.text( modelObject.InputIds [ uuid ] )
					.attr( 'data-type' , 'input' )
					.attr( 'data-input' , uuid )
					.attr( 'id' , uuid );
				$inputs.append( $input );
				this.inputs [ uuid ] = $input;

				jsPlumb.makeTarget( $input , {
					isTarget : true
				});
			};

			for ( uuid in modelObject.OutputIds ) {
				$output = $('<div>')
					.addClass('sprite output audioOutput')
					.text( modelObject.OutputIds [ uuid ] )
					.attr( 'data-type' , 'output' )
					.attr( 'data-output' , uuid )
					.attr( 'id', uuid );
				$outputs.append( $output );
				this.outputs [ uuid ] = $output;

				jsPlumb.makeSource( $output );
			};

			$viewObject.append( $inOuts.append( $inputs , $outputs ) );
			jsPlumb.draggable( $viewObject , {
				containment: 'parent'
			});

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
						viewObjectMakers.default )
			.call( this , modelObject );

		return $viewObject;
	}



	return SynthViewController;
})();
