/*global AudioContext, util*/

var SynthModel = ( function() {

	var context = new AudioContext();

	function SynthModel( controller ) {
		this.inputs = {};
		this.outputs = {};
		this.components = [];
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

		function assignIds ( howMany , where ) {
			(0).upto( howMany  - 1 )
				.forEach(
					function(i) {
						where [ util.uuid() ] = i;
					});
		};


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
						"Index" : i
					};
				}.bind( this ));

			(0).upto( obj.numberOfOutputs - 1 ).forEach(
				function( i ) {
					var uuid = util.uuid();
					obj.OUTPUTIDs [ uuid ] = i;
					this.outputs [ uuid ] = {
						"AudioNode" : obj,
						"Index" : i
					};
				}.bind( this ));


		}




		this.controller.update({ type : 'add', object : obj });
		this.components.push( obj );
	};

	return SynthModel;

})();
