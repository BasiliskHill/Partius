module.exports = {
	register: function (bot, functions) {
		var purge = bot.registerCommand("purge", async (msg, args) => {
			var channelID = msg.channel.id;
			var limit = parseInt(args);
			var messagesKilled = 0;

			if (args.length === 0) { //If there aren't any args passsed
				messagesKilled = await bot.purgeChannel(channelID, -1); //Wipe the whole channel
			} else if (isNaN(limit)) { //If there is an arg passed but it isn't an int
				return "The limit isn't actually a limit I can use."; //Say it can't use the limit
			} else { //If there is nothing wrong with the limit sent
		 		messagesKilled = await bot.purgeChannel(channelID, limit + 1);
			}

			//Discord logging
			var embedLog = await msg.channel.createMessage({
				embed: {
					title: "Purge completed.",
					description:"Deleted " + (messagesKilled - 1) + " message(s) from this channel.",
					color: 0xd50000,
					footer: {
						text: functions.footer(msg),
						icon_url: msg.author.avatarURL
					}
				}
			});
			functions.serverLog.noNotify(msg, embedLog, bot);

		}, {
			guildOnly: true,
			description: "Purge a channel",
			fullDescription: "Purges a number of (or all, if no limit is set) messages from the channel the command was sent in.\n" +
			"Will only work on messages < 2 weeks old.",
			usage: "<limit>",
			cooldown: 5000
		});
		//register the purgeAll subcommand
		var purgeAll = purge.registerSubcommand("all", async (msg, args) => {
			var messagesKilled = 0;

			for (channel of msg.channel.guild.channels.values()) {
				if (channel.type === 0) {
					messagesKilled += await bot.purgeChannel(channel.id, -1);
				}
			}

			//Discord logging
			var embedLog = await msg.channel.createMessage({
				embed: {
					title: "Purge ALL completed.",
					description:"Deleted a total of " + (messagesKilled - 1) + " message(s) from the server.",
					color: 0xd50000,
					footer: {
						icon_url: msg.author.avatarURL,
						text: functions.footer(msg)
					}
				}
			});
			functions.serverLog.notify(msg, embedLog, bot);

		}, {
			guildOnly: true,
			description: "Purge a whole server",
			fullDescription: "Purges all messages < 2 weeks old from **all** channels on the server",
			cooldown: 60000,
			requirements: {
		    userIDs: message => [message.channel.guild.ownerID]
			}
		});
		console.log("Subcommand 'purgeAll' of 'purge' has been prepared.");
	}
}