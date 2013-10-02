/*global AudioContext, util*/
'use strict';

var SynthModel = ( function() {

	var context = new AudioContext();

	function SynthModel( controller ) {
		this.inputs = {};
		this.outputs = {};
		this.components = {};
		this.connections = {};
		this.controller = controller;
		controller && (controller.model = this);

		this.context = context;
		this.destination = context.destination;
	}

	var manipulators = {
		add : function( change ) {
			this.add ( context [ change.value ]() );
		},
		connect : function( change ) {
			this.connect( change.sourceId , change.targetId );
		},
		setParam : function( change ) {
			this.setParam( change.targetId , change.value );
		},
		undefined : function ( value ) {
			console.log('Unknown change : ',  value );
		}
	};

	SynthModel.prototype.manipulate = function( change ) {
		//console.log("Model got change: " + change );
		var type = (change.type && change.type in manipulators) ?
				change.type :
				'undefined';
		manipulators [ type ].bind( this )( change );
	};

	SynthModel.prototype.add = function( obj ){
		var prop;

		obj.start && obj.start( 0 );

		if ( obj instanceof AudioNode ) {
			obj.ParamIds = {};

			for ( prop in obj ) {
				if ( obj.hasOwnProperty( prop ) &&
				   obj [ prop ] instanceof AudioParam ) {
					   var uuid = util.uuid();
					   obj.ParamIds [ uuid ] = obj [ prop ];
					   obj [ prop ].ParamId = uuid;
					   this.inputs [ uuid ] = {
						   'AudioParam' : obj [ prop ]
					   };
				}
			}

			obj.InputIds = {}, obj.OutputIds = {};

			(0).upto( obj.numberOfInputs - 1 ).forEach(
				function( i ) {
					var uuid = util.uuid();
					obj.InputIds [ uuid ] = i;
					this.inputs [ uuid ] = {
						"AudioNode" : obj,
						"index" : i
					};
				}.bind( this ));

			(0).upto( obj.numberOfOutputs - 1 ).forEach(
				function( i ) {
					var uuid = util.uuid();
					obj.OutputIds [ uuid ] = i;
					this.outputs [ uuid ] = {
						"AudioNode" : obj,
						"index" : i
					};
				}.bind( this ));
		}

		obj.UUID = util.uuid();

		this.components [ obj.UUID ] = obj;
		this.controller.update({ type : 'add', object : obj });
	};

	SynthModel.prototype.connect = function( sourceId , targetId ) {
		var source = this.outputs [ sourceId ],
			target = this.inputs [ targetId ];

		assert( typeof source !== 'undefined', 'invalid source' );
		assert( typeof target !== 'undefined' , 'invalid target' );

		if ( source.AudioNode ) {
			if ( target.AudioNode ) {
				source.AudioNode.connect( target.AudioNode ,
										  source.index ,
										  target.index );
			}
			else if ( target.AudioParam ) {
				source.AudioNode.connect( target.AudioParam ,
										  source.index );
			}
		}

		this.connections [ sourceId ] =
			this.connections [ sourceId ] || {};
		this.connections [ sourceId ] [ targetId ] = true;

		console.log('Model\'s connections: ', this.connections );

		this.controller.update({
			type : 'connect',
			sourceId : sourceId,
			targetId : targetId
		});

	};

	SynthModel.prototype.setParam = function( paramId , value ){
		var param = this.inputs [ paramId ].AudioParam;
		param.setValueAtTime( value , 0 );

		this.controller.update({
			type : 'setParam',
			targetId : paramId,
			value : value
		});
	};


	SynthModel.prototype.disconnect = function( sourceId, targetId ) {



		// this.controller.update({
		// 	type : 'disconnect',
		// 	sourceId : sourceId,
		// 	targetId : targetId
		// });
	};

	return SynthModel;

})();
