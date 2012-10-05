module.exports = function (
	inherits,
	EventEmitter,
	Client) {

	function TopicPartition(name, count) {
		this.name = name
		this.count = count
		this.current = 0
	}

	TopicPartition.prototype.next = function () {
		this.current = (this.current + 1) % this.count
		return this.current
	}

	function Broker(id, host, port) {
		this.id = id
		this.host = host
		this.port = port
		this.topicPartitions = {}
		this.client = null
		this.connect()
	}
	inherits(Broker, EventEmitter)

	Broker.prototype.connect = function () {
		var self = this
		if (!this.client) {
			this.client = new Client({
				host: this.host,
				port: this.port
			})
			this.client.once(
				'connect',
				function () {
					self.emit('connect')
				}
			)
			this.client.once(
				'end',
				function () {
					//TODO: smarter reconnect
					self.connect()
				}
			)
		}
	}

	Broker.prototype.setTopicPartitions = function (name, count) {
		this.topicPartitions[name] = new TopicPartition(name, count)
	}

	Broker.prototype.clearTopicPartitions = function () {
		this.topicPartitions = {}
	}

	Broker.prototype.fetch = function () {

	}

	Broker.prototype.produce = function (topic, messages) {
		var partition = 0
		var tp = this.topicPartitions[topic.name]
		if (tp) {
			partition = tp.next()
		}
		this.client.produce(topic, messages, partition)
	}

	return Broker
}
