Object.defineProperty(Array.prototype, 'findByValue', {
	value: function(key, val) {
		let resp = false;
		this.map(obj => {
			if (obj[key] && obj[key] == val)
				resp = true;
		})
		return resp;
	}
});

Object.defineProperty(Object.prototype, 'empty', {
	get: function() {
		return Object.entries(this).length === 0
	}
});

Object.defineProperty(Array.prototype, 'wrap', {
	value: function(key, val) {
		return this.filter(arr => arr);
	}
});
