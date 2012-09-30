module.exports = function (
	RequestHeader,
	ResponseHeader,
	FetchBody,
	OffsetsBody) {

	function Response(request, cb) {
		switch (request.header.type) {
			case RequestHeader.types.FETCH:
				this.state = new ResponseHeader(FetchBody)
				break;
			case RequestHeader.types.OFFSETS:
				this.state = new ResponseHeader(OffsetsBody)
				break;
		}
		this.cb = cb
		this.request = request
		this.done = false
	}

	Response.prototype.complete = function () {
		return done
	}

	Response.prototype.read = function (stream) {
		while (this.state.read(stream)) {
			var result = this.state.next()
			if (Array.isArray(result)) { // TODO: better
				// something something
				this.cb(result)
				this.done = true
				break;
			}
			else {
				this.state = result
			}
		}
		return this.done
	}

	return Response
}
