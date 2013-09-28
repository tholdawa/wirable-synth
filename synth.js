/*global $, AudioContext*/

//$(function() {

function connector(node) {
	if (node.hasOwnProperty('input')) {
		this.output.connect(node.input);
	} else {
		this.output.connect(node);
	};
};

var context = new AudioContext();

var VCO = (function(context) {
	function VCO(){
		this.oscillator = context.createOscillator();
		this.oscillator.type = this.oscillator.SAWTOOTH;
		this.setFrequency(440);
		this.oscillator.start(0);

		this.input = this.oscillator;
		this.output = this.oscillator;

	};

	VCO.prototype.setFrequency = function(frequency) {
		this.oscillator.frequency.setValueAtTime(frequency, context.currentTime);
	};

	VCO.prototype.connect = connector;

	return VCO;
})(context);

var VCA = (function(context) {
	function VCA() {
		this.gain = context.createGain();
		this.gain.gain.value = 0;
		this.input = this.gain;
		this.output = this.gain;
		this.amplitude = this.gain.gain;
	};

	VCA.prototype.connect = connector;

	return VCA;
})(context);

var EnvelopeGenerator = (function(context) {
	function EnvelopeGenerator() {
		this.attackTime = 0.1;
		this.releaseTime = 0.1;
	};

	EnvelopeGenerator.prototype.trigger = function() {
		var now = context.currentTime;
		this.param.cancelScheduledValues(now);
		this.param.setValueAtTime(0, now);
		this.param.linearRampToValueAtTime(1, now + this.attackTime);
		this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
	};

	EnvelopeGenerator.prototype.connect = function(param) {
		this.param = param;
	};

	return EnvelopeGenerator;
})(context);


var MonoSynth = (function(context) {
	function MonoSynth() {
		this.vco = new VCO();
		this.vca = new VCA();
		this.env = new EnvelopeGenerator();

		this.vco.connect(this.vca);
		this.env.connect(this.vca.amplitude);
		this.vca.connect(context.destination);

	}

	return MonoSynth;
})(context);

var QuadSynth = (function(context) {
	function QuadSynth() {
		var baseArray = [0,1,2,3];
		this.VCOs = baseArray.map(function() {return new VCO();});
		this.currentSynth = 0;
		this.VCAs = baseArray.map(function() {return new VCA();});
		this.ENVs = baseArray.map(function() {return new EnvelopeGenerator();});

		baseArray.forEach (function(i) {
			this.VCOs[i].connect(this.VCAs[i]);
			this.ENVs[i].connect(this.VCAs[i].amplitude);
			this.VCAs[i].connect(context.destination);
		}.bind(this));


	}


	return QuadSynth;
})(context);

//});
