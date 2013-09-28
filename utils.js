(function(){

	window.util = window.util || {};
	window.util.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
			.replace( /[xy]/g , function( c ) {
				var r = Math.random() * 16 | 0 ,
					v = c == 'x' ? r : ( r&0x3 | 0x8 );
				return v.toString(16);
			});
	};

	window.util.assign = function( lhs , rhs ) {
		lhs = rhs;
	};


	Number.prototype.upto = function(other)
	{
		if ( other == null ) {
			return [];
		}

		var i = Math.round(this), result = [];

		while (i <= other)
			result.push(i++);
		return result;
	};


	Number.prototype.times = function(func)
	{
		(1).upto(this).forEach(func);
	};

	Function.prototype.flip = function()
	{
		return function()
		{
			var flippedArgs = [].reverse.apply( [].slice.call(arguments));
			this.apply(null, flippedArgs);
		}.bind(this);
	};

	window.assert = function( assertion, error ) {
		if ( !assertion ) {
			throw new Error(error);
		}
	};

}());
