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
		undefined : function ( value ) {
			console.log('Unknown change : ' + value.toString() );
		}
	};

	SynthModel.prototype.manipulate = function( change ) {
		//console.log("Model got change: " + change );
		var type = change.type || 'undefined';
		manipulators [ type ].bind( this )( change );
	};

	SynthModel.prototype.add = function( obj ){
		var prop;

		if ( obj instanceof AudioNode ) {
			obj.PARAMIDs = {};

			for ( prop in obj ) {
				if ( obj.hasOwnProperty( prop ) &&
				   obj [ prop ] instanceof AudioParam ) {
					   var uuid = util.uuid();
					   obj.PARAMIDs [ uuid ] = obj [ prop ];
					   obj [ prop ].PARAMID = uuid;
					   this.inputs [ uuid ] = {
						   'AudioParam' : obj [ prop ]
					   };
				}
			}

			obj.INPUTIDs = {}, obj.OUTPUTIDs = {};

			(0).upto( obj.numberOfInputs - 1 ).forEach(
				function( i ) {
					var uuid = util.uuid();
					obj.INPUTIDs [ uuid ] = i;
					this.inputs [ uuid ] = {
						"AudioNode" : obj,
						"index" : i
					};
				}.bind( this ));

			(0).upto( obj.numberOfOutputs - 1 ).forEach(
				function( i ) {
					var uuid = util.uuid();
					obj.OUTPUTIDs [ uuid ] = i;
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

	SynthModel.prototype.connect = function( sourceID , targetID ) {
		var source = this.outputs [ sourceID ],
			target = this.inputs [ targetID ];

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

		this.connections [ sourceID ] =
			this.connections [ sourceID ] || {};
		this.connections [ sourceID ] [ targetID ] = true;

		this.controller.update({
			type : 'connect',
			sourceID : sourceID,
			targetID : targetID
		});


	};

	return SynthModel;

})();
