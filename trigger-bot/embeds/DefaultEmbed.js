const { EmbedBuilder } = require("discord.js");
const { embed } = require("../config.js");

class DefaultEmbed extends EmbedBuilder {
  constructor(data) {
    super(data);
    this.setColor(parseInt(embed.color));
  }
}

module.exports = DefaultEmbed;
