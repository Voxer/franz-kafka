module.exports = function (
	logger,
	async,
	os,
	inherits,
	EventEmitter,
	Owner) {

	function genConsumerId(groupId) {
		return groupId + '_' + os.hostname() + '-' + Date.now() + '-' + "DEADBEEF"
	}

	function Consumer(connector, groupId, allBrokers) {
		this.connector = connector
		this.groupId = groupId
		this.consumerId = genConsumerId(this.groupId)
		this.allBrokers = allBrokers
		this.owners = {}
	}

	Consumer.prototype.consume = function (topic, partitions) {
		logger.assert(Array.isArray(partitions))
		logger.log(
			'consuming', topic.name,
			'partitions', partitions.length,
			'group', this.groupId,
			'consumer', this.consumerId
		)
		var name = topic.name
		var owner = this.owners[name] || new Owner(topic, this.allBrokers)
		this.owners[name] = owner
		owner.consume(partitions)
	}

	Consumer.prototype.stop = function (topic, partitions) {
		if (!topic) { // stop all
			var topics = Object.keys(this.owners)
			for (var i = 0; i < topics.length; i++) {
				this.stop(topics[i])
			}
		}
		else {
			var name = topic.name
			var owner = this.owners[name]
			owner.stop(partitions)
			if (!owner.hasPartitions()) {
				delete this.owners[name]
			}
		}
	}

	Consumer.prototype.drain = function (cb) {
		var owners = Object.keys(this.owners)
		for (var i = 0; i < owners.length; i++) {
			this.owners[owners[i]].pause()
		}
		async.forEach(
			this.allBrokers.all(),
			function (broker, next) {
				broker.drain(next)
			},
			cb
		)
	}

	Consumer.prototype.pause = function (topic) {
		var name = topic.name
		var owner = this.owners[name]
		if (owner) {
			owner.pause()
		}
	}

	Consumer.prototype.resume = function (topic) {
		var name = topic.name
		var owner = this.owners[name]
		if (!owner) {
			this.connector.consume(topic, topic.partitions)
		}
		else {
			owner.resume()
		}
	}

	return Consumer
}
