class Command {
  constructor(client, config) {
    this.client = client;
    this.enabled = config.enabled;
    this.data = config.data;
  }
}

module.exports = Command;
