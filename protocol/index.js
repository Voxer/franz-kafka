var inherits = require('util').inherits
var zlib = require('zlib')
var snappy = require('snappy')
var int53 = require('int53')
var crc32 = require('buffer-crc32')
var State = require('./state')(inherits)
var Message = require('./message')(zlib, snappy, crc32)
var RequestHeader = require('./request-header')()
var ResponseHeader = require('./response-header')(inherits, State)
var FetchBody = require('./fetch-body')(inherits, State, Message)
var OffsetsBody = require('./offsets-body')(inherits, State, int53)
var Response = require('./response')(State, ResponseHeader)
var Receiver = require('./receiver')(State)
var FetchRequest = require('./fetch-request')(RequestHeader, Response, FetchBody, int53)
var OffsetsRequest = require('./offsets-request')(RequestHeader, Response, OffsetsBody, int53)
var ProduceRequest = require('./produce-request')(RequestHeader, Message, State)

module.exports = {
	Receiver: Receiver,
	FetchRequest: FetchRequest,
	ProduceRequest: ProduceRequest,
	OffsetsRequest: OffsetsRequest,
	Message: Message
}
