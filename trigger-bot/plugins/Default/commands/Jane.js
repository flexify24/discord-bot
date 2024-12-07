const { Command } = require("../../../structures");
const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { DefaultEmbed, ErrorEmbed, SuccessEmbed } = require("../../../embeds");
const fs = require("fs");

const janesPath = "./data/janes.json";

if (!fs.existsSync(janesPath)) {
  fs.writeFileSync(janesPath, JSON.stringify([]));
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("jane")
        .setDescription("Manage janes")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add a new jane")
            .addStringOption((option) =>
              option
                .setName("jane")
                .setDescription("The jane keyword")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("response")
                .setDescription("The response message")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove an existing jane")
            .addStringOption((option) =>
              option
                .setName("jane")
                .setDescription("The jane keyword to remove")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("list").setDescription("List all janes")
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("update")
            .setDescription("Update an existing jane's response")
            .addStringOption((option) =>
              option
                .setName("jane")
                .setDescription("The jane keyword to update")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("newresponse")
                .setDescription("The new response message")
                .setRequired(true)
            )
        ),
    });
  }

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const janes = JSON.parse(fs.readFileSync(janesPath, "utf-8"));

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "add") {
      const jane = interaction.options.getString("jane");
      const response = interaction.options.getString("response");

      if (janes.some((t) => t.jane === jane)) {
        return interaction.editReply({
          embeds: [new ErrorEmbed("This jane already exists!")],
        });
      }

      janes.push({ jane, response });
      fs.writeFileSync(janesPath, JSON.stringify(janes, null, 2));

      return interaction.editReply({
        embeds: [new SuccessEmbed(`Jane "${jane}" has been added.`)],
      });
    } else if (subcommand === "remove") {
      const jane = interaction.options.getString("jane");

      const index = janes.findIndex((t) => t.jane === jane);
      if (index === -1) {
        return interaction.editReply({
          embeds: [new ErrorEmbed("Jane not found!")],
        });
      }

      janes.splice(index, 1);
      fs.writeFileSync(janesPath, JSON.stringify(janes, null, 2));

      return interaction.editReply({
        embeds: [new SuccessEmbed(`Jane "${jane}" has been removed.`)],
      });
    } else if (subcommand === "list") {
      if (janes.length === 0) {
        return interaction.editReply({
          embeds: [new ErrorEmbed("No janes found.")],
        });
      }

      const janeList = janes
        .map(
          (t, i) => `${i + 1}. **Jane:** ${t.jane}\n**Response:** ${t.response}`
        )
        .join("\n\n");

      return interaction.editReply({
        embeds: [
          new DefaultEmbed()
            .setTitle("janes List")
            .setDescription(janeList || "No janes found!"),
        ],
      });
    } else if (subcommand === "update") {
      const jane = interaction.options.getString("jane");
      const newResponse = interaction.options.getString("newresponse");

      const existingjane = janes.find((t) => t.jane === jane);
      if (!existingjane) {
        return interaction.editReply({
          embeds: [new ErrorEmbed("Jane not found!")],
        });
      }

      existingjane.response = newResponse;
      fs.writeFileSync(janesPath, JSON.stringify(janes, null, 2));

      return interaction.editReply({
        embeds: [new SuccessEmbed(`Jane "${jane}" has been updated.`)],
      });
    }
  }
};
