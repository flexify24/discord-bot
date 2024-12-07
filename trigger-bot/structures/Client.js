const { Client, IntentsBitField, Partials, Collection } = require("discord.js");
const { PluginManager } = require("./");
const config = require("../config.js");

module.exports = class extends Client {
  constructor() {
    super({
      intents: new IntentsBitField(3276799),
      partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
      ],
    });

    this.commands = new Collection();
    this.config = config;
    this.plugins = new PluginManager(this);
  }

  async start() {
    await this.plugins.load();
    await super.login(process.env.TOKEN);
  }
};
