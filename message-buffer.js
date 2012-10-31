module.exports = function () {

	function send() {
		var sent = false
		if (this.messages.length > 0) {
			sent = this.connector.publish(this.topic, this.messages)
			this.messages = []
		}
		clearTimeout(this.timer)
		this.timer = null
		return sent
	}

	function MessageBuffer(topic, batchSize, queueTime, connector) {
		var self = this
		this.topic = topic
		this.batchSize = batchSize
		this.queueTime = queueTime
		this.connector = connector
		this.messages = []
		this.timer = null
		this.send = send.bind(this)
	}

	MessageBuffer.prototype.push = function(message) {
		if (!this.timer) {
			this.timer = setTimeout(this.send, this.queueTime)
		}
		if (this.messages.push(message) === this.batchSize) {
			return this.send()
		}
		return true
	}

	return MessageBuffer
}