## PixelingsTracker
A discord bot to give information about the Pewdiepie Pixelings game.

## Requirements
- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- `node` [Version 8.0.0 or higher](https://nodejs.org)

You also need to modify the `auth.json` file with the bot's token and the ids of the helper channels and servers:
- `token` is your bot token.
- `alerts` is a discord text channel where the bot will store information.
- `emoji1` and `emoji2` are two discord servers containing the emojis in the `emoji` folder.
The bot must be invited to all the servers above, and have write and edit permissions on the alert channel.

## Setting up
Once the files are copied and `auth.json` is modified, run 'npm install' in the folder.

## Starting the bot
To start the bot, run the command: `node bot.js`.

## Inviting to a guild
To add the bot to your guild, you have to get an oauth link for it in your discord developers page with the `Read Message History` and `Send Messages` permissions.

## Special Thanks
The Chosen and Sheeps community for testing and giving feedback.
