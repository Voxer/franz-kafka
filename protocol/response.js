module.exports = function (
	ResponseHeader,
	FetchBody,
	OffsetsBody) {

	function Response(request, cb) {
		switch (request.header.type) {
			case 1:
				this.state = new ResponseHeader(FetchBody)
				break;
			case 4:
				this.state = new ResponseHeader(OffsetsBody)
				break;
		}
		this.cb = cb
		this.request = request
		this.complete = false
	}

	Response.prototype.complete = function () {
		return complete
	}

	Response.prototype.read = function (stream) {
		while (this.state.read(stream)) {
			var result = this.state.next()
			if (Array.isArray(result)) { // TODO: better
				// something something
				this.cb(result)
				this.complete = true
				break;
			}
			else {
				this.state = result
			}
		}
		return this.complete
	}

	return Response
}
