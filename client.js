module.exports = function (
	net,
	inherits,
	EventEmitter,
	ReadableStream,
	Receiver,
	FetchRequest,
	ProduceRequest) {

	function Client(options) {
		var self = this
		this.connection = net.connect(options)
		this.connection.on('connect',
			function () {
				self.emit('connect')
			}
		)
		this.connection.on('end',
			function () {
				self.emit('end')
				self.connection = null
			}
		)
		this.readableSteam = new ReadableStream()
		this.readableSteam.wrap(this.connection)
		this.receiver = new Receiver(this.readableSteam)
	}
	inherits(Client, EventEmitter)

	Client.prototype.fetch = function (offset, maxSize, cb) {
		var request = new FetchRequest()
		request.offset = offset
		request.maxSize = maxSize
		//TODO something with these return values
		request.serialize(this.connection)
		this.receiver.push(request, cb)
	}

	Client.prototype.produce = function (topic, messages) {
		var request = new ProduceRequest()
		request.messages = messages
		//TODO topic
		request.serialize(this.connection)
	}

	return Client
}
