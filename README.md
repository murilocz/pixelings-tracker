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
Once the files are copied and `auth.json` is modified, run `npm install` in the folder.

## Starting the bot
To start the bot, run the command: `node bot.js`.

## Inviting to a guild
To add the bot to your guild, you have to get an oauth link for it in your discord developers page with the `Read Message History` and `Send Messages` permissions.

## Special Thanks
The Chosen and Sheeps communities for testing and giving feedback.

---

The following are the commands in the bot:

## `!tracker`
General help command. Has a list with all the other commands.

## `!track <reward>`
Find where a given reward can be found in the story missions.

## `!rank <pixeling> <current level> <current copies> [<target rank>]`
Finds the number of copies and coins needed to upgrade a pixeling.

## `!food <pixeling>`
Finds the favorite food of the pixeling.

## `!reminder <pixeling> [<hours>]`
Gives a reminder before a pixeling shows up in the rotation.

## `!rotation [<days>]`
Finds what will be the rotation in a certain number of days.

## `!xp <start level> [<end level>]`
Finds the xp needed to upgrade a pixeling from a level to another.

## `!pxp <start level> [<end level>]`
Finds the player xp to level up from a level to another.
