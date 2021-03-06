module.exports = function (
	RequestHeader,
	Response,
	FetchBody,
	int53) {

	function FetchRequest(topic, offset, partitionId, maxSize) {
		this.topic = topic || ""
		this.partitionId = partitionId || 0
		this.offset = offset || 0
		this.maxSize = maxSize || (1024 * 1024)
	}

	//  0                   1                   2                   3
	//  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
	// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	// /                         REQUEST HEADER                        /
	// /                                                               /
	// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	// |                             OFFSET                            |
	// |                                                               |
	// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	// |                            MAX_SIZE                           |
	// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	//
	// REQUEST_HEADER = See REQUEST_HEADER above
	// OFFSET   = int64 // Offset in topic and partition to start from
	// MAX_SIZE = int32 // MAX_SIZE of the message set to return
	FetchRequest.prototype.serialize = function (stream, cb) {
		var err = null
		var payload = new Buffer(12)
		int53.writeUInt64BE(this.offset, payload)
		payload.writeUInt32BE(this.maxSize, 8)
		var header = new RequestHeader(
			payload.length,
			RequestHeader.types.FETCH,
			this.topic,
			this.partitionId
		)
		try {
			header.serialize(stream)
			var written = stream.write(payload)
		}
		catch (e) {
			err = e
		}
		cb(err, written)
	}

	FetchRequest.prototype.response = function (cb) {
		return new Response(FetchBody, cb)
	}

	return FetchRequest
}
