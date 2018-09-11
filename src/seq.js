
function base64ToArrayBuffer(base64) {
	var binary_string = atob(base64.substr(base64.indexOf(',')+1));
	var len = binary_string.length;
	var bytes = new Uint8Array( len );
	for (var i = 0; i < len; i++)        {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}

function Sequencer(opts){

/*
	// opts is an array must have 6 elements:
	0: 250, // milliseconds per beat
	1: INSTRUMENTS, // The Audio Elements
	2: loops, // Loops
	3: song, // The actual song
	4: true, // Loop over and over
	5: 1.4 // seconds buffer. ~min Chrome lets us have in a background tab
*/
	//console.log(opts);

	var _this = this;
	var position = 0;
	var loop = 0;
	var ctx = new (window.AudioContext || webkitAudioContext)();
	_this._buffer = opts[5] || 0.2;
	_this._loopSpeed = opts[0];

	var gainNode = ctx.createGain();
	gainNode.connect(ctx.destination);
	var gainInterval = null;


	this._currentSources = [];

	var instruments, song, startTime;

	this.initLoops = function(opts){
		instruments = {};
		Object.keys(opts[1]).forEach(function(key){
			ctx.decodeAudioData(base64ToArrayBuffer(opts[1][key]), function(buffer){
				//console.log('Setting', key, buffer);
				instruments[key] = buffer;
			});
		});
		// init loops
		song = opts[3];
		song = song.map(function(beat, i){
			var newBeat = [];
			beat.forEach(function(beat){
				var loop = opts[2][beat];
				if(opts[1][beat.n || beat]){
					// return this beat
					newBeat.push(beat);
				} else if(loop) {
					// Merge the loop into the main song array.
					newBeat = newBeat.concat(loop[0]);
					for(var j=1; j<loop.length; j++){
						song[i+j] = song[i+j].concat(loop[j]);
					}
				} else {
					// console.error('Instrument or loop not found', beat);
				}
			});
			return newBeat;
		});
	};

	this.initLoops(opts);

	function playSound(instrument, time){
		var source = ctx.createBufferSource(); // creates a sound source
		var buffer = instruments[instrument.n || instrument];
		source.playbackRate.value = instrument.p || 1;
		source.buffer = buffer;   // tell the source which sound to play
		source.connect(gainNode); // connect to gainNode in order to be able to mute the audio
		source.start(time || 0);
		// push source to all sources array to be able to stop
		_this._currentSources.push(source);
		source.onended = function(e) {
			_this._currentSources.forEach(function(src, idx, arr) {
				if ( src === e.srcElement ) {
					arr.splice(idx,1);
					return false;
				}
			});
		}
	}

	this.mute = function( mute ) {

		if ( mute ) {
			if ( gainInterval ) {
				clearInterval(gainInterval);
			}
			gainNode.gain.value = 0;
		} else {
			// slowly gain volume until 1
			gainInterval = setInterval(function() {
				gainNode.gain.value+=0.1;
				if ( gainNode.gain.value >= 1 ) {
					gainNode.gain.value = 1;
					clearInterval(gainInterval);
					gainInterval = null;
				}
			},100);
		}
	};

	this.play = function(){

		var _this = this;
		var i;
		_this._interval = setInterval(function(){
			if(!startTime){
				startTime = ctx.currentTime;
			}

			// Go through the next 100 beats or until we fill the buffer.
			for(var j=0; j<100; j++){
				// Pick this one.
				var beat = song[position];

				// Wrap our loop around/finish it up.
				if(position >= song.length){
					if(opts[4]){
						position = 0;
						loop++;
						continue;
					} else {
						_this.stop(true);
						break;
					}
				}

				// The point at which this set of sounds is to be played.
				// Based on start time, position in song, and number of loops.
				var playAt = startTime + (_this._loopSpeed*position + song.length*loop*_this._loopSpeed)/1000;

				// If the buffer is more than 1.4 seconds, stop populating it.
				if(playAt > ctx.currentTime + _this._buffer){
					//console.log('Buffer full');
					break;
				}

				// Loop through all instruments in this beat & queue them.
				for(i=0; i<beat.length; i++){
					playSound(beat[i], playAt);
				}
				position++;
			}
		}, this._buffer*500);
		return _this;
	};

	this.stop = function(letPlayToEnd){
		var _this = this;
		if(_this._interval){
			clearInterval(_this._interval);
			_this._interval = false;
		}

		if ( !letPlayToEnd ) {
			_this._currentSources.forEach(function(source) {
				source.stop();
			});
		}
		_this._currentSources = [];
		position = 0;
		startTime = ctx.currentTime;
		return _this;
	};
}

if(typeof module !== 'undefined'){
	module.exports = Sequencer;
}