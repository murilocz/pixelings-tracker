var lineLimit = 43;

var Discord = require('discord.io');
var auth = require('./auth.json');

//Channels
var alertsChannel = auth.alerts;
//Servers
var emojiServers = [auth.emoji1, auth.emoji2];

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

// UTILITIES
function debug(mes)
{
    console.log(mes);
}

function messageEmbed(channelID, tit, des, col)
{
    bot.sendMessage({
        to: channelID,
        embed: {
	    title: tit,
	    description: des,
	    color: col
	}
    });
}

function message(channelID, mes)
{
    bot.sendMessage({
        to: channelID,
        message: mes
    });
}

function DaysBetween(StartDate, EndDate) {
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor((EndDate.getTime() - StartDate.getTime()) / oneDay);
}

function leftToHour() {
    var now = new Date();
    var timeDiff = now.getTime() - referenceDate.getTime();
    var hour = 1000 * 60 * 60;
    var toHour = ((-timeDiff % hour) + hour) % hour;
    return toHour;
}

function createMap()
{
    map = {};
    for (let server_id of emojiServers) {
	var server = bot.servers[server_id];
	for (let [id, value] of Object.entries(server.emojis)) {
	    if (value.name == "the_chosen")
		map[value.name] = value.id;
	    else
		map[value.name.substring(2, value.name.length)] = value.id;
	}
    }
    return map;
}

function emote(pix)
{
    if (pix == "chosen")
	pix = "the_chosen";
    if ((pix[pix.length-1] < 'a' || pix[pix.length-1] > 'z') && (pix[pix.length-1] < '0' || pix[pix.length-1] > '9'))
	pix = pix.substring(0, pix.length - 1);
    pix.trim();

    if (emojiMap[pix] == undefined) {
        if (pix == "the_chosen")
            return "The Chosen";
	return pix;
    }
    return "<:pt"+pix+":"+emojiMap[pix]+">";
}

function readFile(name)
{
    var fs = require("fs");
    var text = fs.readFileSync("./" + name + ".txt", "utf-8");
    var lines = text.split("\n");
    lines = lines.filter(function (el) {
	return el != "";
    });
    return lines;
}

function getRarity(pixeling)
{
    if (rarityMap[pixeling] == undefined)
	return "undefined";
    return rarityMap[pixeling];
}

function getColor(pixeling)
{
    if (colorMap[pixeling] == undefined)
	return "undefined";
    return colorMap[pixeling];
}

function isFood(color)
{
    for (let [id, value] of Object.entries(foodMap)) {
	if (color == value || color == id)
	    return true;
    }
    return false;
}

function isSpell(s)
{
    var lines = dataSpells;
    for (let line of lines) {
	var l = line.split(' ');
	if (s == l[0] || s == "spell" + l[0])
	    return true;
    }
    return false;
}

function prepareForSpells(s)
{
    for (let a of separators) {
	for (let b of toContract) {
	    s = s.replace(b[0] + a + b[1], b[0] + b[1]);
	}
    }
    return s;
}

function printSpell(s)
{
    var emojify = emote(s);
    if (emojify != s)
	return emojify;
    for (let a of toContract)
	if (s == a[0] + a[1])
	    return capitalize(a[0]) + " " + capitalize(a[1]);
    return capitalize(s);
}

function printLevels(s1, s2)
{
    var ans = "";
    switch(s1.substring(0, 1)) {
    case "b":
	ans = ans + "Brotown";
	break;
    case "f":
	ans = ans + "Floatopia";
	break;
    case "s":
	ans = ans + "Slumberland";
	break;
    case "c":
	ans = ans + "Crushopolis";
	break;

    default:
	ans = ans + "Undefined";
    }
    ans = ans + " ";
    switch(s1.substring(1)) {
    case "1":
	ans = ans + "easy";
	break;
    case "2":
	ans = ans + "medium";
	break;

    case "3":
	ans = ans + "hard";
	break;
    default:
	ans = ans + "Undefined";
    }
    ans = ans + " level";
    if (s2.length > 1)
	ans = ans + "s";
    var first = true;
    for (let s of s2) {
	s = s.trim();
	if (first) {
	    ans = ans + " " + s;
	    first = false;
	}
	else
	    ans = ans + ", " + s;
    }
    return ans;
}

function printLevel(s1, s2)
{
    var ans = "";
    switch(s1.substring(0, 1)) {
    case "b":
	ans = ans + "Brotown";
	break;
    case "f":
	ans = ans + "Floatopia";
	break;
    case "s":
	ans = ans + "Slumberland";
	break;
    case "c":
	ans = ans + "Crushopolis";
	break;
    default:
	ans = ans + "Undefined";
    }
    ans = ans + " ";
    switch(s1.substring(1)) {
    case "1":
	ans = ans + "easy";
	break;
    case "2":
	ans = ans + "medium";
	break;
    case "3":
	ans = ans + "hard";
	break;
    default:
	ans = ans + "Undefined";
    }
    ans = ans + " level " + s2.trim();
    return ans;
}

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

// INITIALIZATION
var emojiMap = undefined;
var colorMap = undefined;
var rarityMap = undefined;
var foodMap = undefined;
var dataRotation = undefined;
var dataPixelings = undefined;
var dataLevelsPixelings = undefined;
var dataCoins = undefined;
var dataExp = undefined;
var dataPxp = undefined;
var dataXp = undefined;
var dataFood = undefined;
var dataLevelsPixelings = undefined;
var dataSpells = undefined;
var separators;
var toContract;

var firstCheck = true;
bot.on('ready', function (evt) {
    debug('Connected');
    debug('Logged in as: ' + bot.username + ' - (' + bot.id + ')');
    dataRotation = readFile("dataRotation");
    dataPixelings = readFile("dataPixelings");
    rarityMap = {};
    colorMap = {};
    var lines = dataPixelings;
    for (let line of lines) {
	var s = line.split(' ');
	switch(s[1].substring(0, 1)) {
	case "c":
	    rarityMap[s[0]] = "common";
	    break;
	case "u":
	    rarityMap[s[0]] = "uncommon";
	    break;
	case "r":
	    rarityMap[s[0]] = "rare";
	    break;
	case "m":
	    rarityMap[s[0]] = "mythic";
	    break;
	}
	colorMap[s[0]] = s[2].trim();
    }
    dataRank = readFile("dataRank");
    copiesMap = {};
    coinsMap = {};
    for (let line of dataRank) {
	var words = line.split(' ');
	copiesMap[words[0]] = [];
	coinsMap[words[0]] = [];
	var i = 1;
	while (i < words.length) {
	    copiesMap[words[0]].push(Number(words[i]));
	    i++;
	    coinsMap[words[0]].push(Number(words[i]));
	    i++;
	}
    }
    foodMap = {};
    foodMap['blue'] = 'fruit';
    foodMap['green'] = 'veggie';
    foodMap['red'] = 'meat';
    foodMap['yellow'] = 'pastry';
    foodMap['purple'] = 'candy';
    dataLevelsPixelings = readFile("dataLevelsPixelings");
    dataCoins = readFile("dataCoins");
    dataExp = readFile("dataExp");
    dataPxp = readFile("dataPxp");
    dataXp = readFile("dataXp");
    dataFood = readFile("dataFood");
    dataSpells = readFile("dataSpells");
    separators = [' ', '_', '-'];
    toContract = [["flaming", "bolt"],
		  ["healing", "touch"],
		  ["bubble", "shield"],
		  ["scorching", "blast"],
		  ["thunder", "strike"],
		  ["mass", "strengthen"],
		  ["poison", "sting"],
		  ["rejuvenating", "spring"],
		  ["cosmic", "shower"],
		  ["mass", "energize"],
		  ["mass", "drain"],
		  ["bounce", "shock"]
		 ];
    
    emojiMap = createMap();

    if (firstCheck) {
	firstCheck = false;
	setTimeout(function run(){
	    debug("In timeout");
            checkAlerts();
            var hourMillseconds = 1000 * 60 * 60;
	    setTimeout(run, hourMillseconds);
	}, leftToHour())
    }
});

// DISCONNECT
bot.on('disconnect', function(errMsg, code) {
    debug("Disconnected: " + errMsg + ", " + code);
    debug("Attempt to connect again");
    bot.connect();
});

// COMMANDS
bot.on('message', function (user, userID, channelID, messageSent, evt) {
    if (userID === bot.id) return;
    if (messageSent.substring(0, 1) == '!') {
	emojiMap = createMap();
	var args = prepareForSpells(messageSent.toLowerCase().substring(1)).split('\n').join(' ').split(' ').filter(n => n);
	var cmd = args[0];
	args = args.splice(1);
	for (var i in args) {
	    if (args[i][0] == '<') {
		args[i] = args[i].substring(2, args[i].length);
		var n = args[i].indexOf(":");
		args[i] = args[i].substring(0, n);
	    }
	    else if (args[i][0] == ':') {
		args[i] = args[i].substring(1, args[i].length);
		var m = args[i].indexOf(":");
		args[i] = args[i].substring(0, m);
	    }
	}

	switch(cmd) {
	case 'tracker':
	    help(args, channelID);
	    break;
	case 'track':
	    findCommand(args, channelID);
            break;
	case 'rank':
	    rankCommand(args, channelID);
	    break;
	case 'food':
	    foodCommand(args, channelID);
	    break;
	case 'reminder':
	    alertCommand(userID, args, channelID);
	    break;
	case 'rotation':
	    rotationCommand(args, channelID);
	    break;
	case 'xp':
	    xpCommand(args, channelID);
	    break;
	case 'pxp':
	    pxpCommand(args, channelID);
	    break;
	}
    }
});

// TRACKER
function help(args, channelID)
{
    var color = 0xe8b629; //gold
    var mes = 'I can give you several pixelings-related information. Type one of the following commands followed by `help` for more information: `!track`, `!xp`, `!pxp`, `!rotation`, `!reminder`, `!food`, `!rank`.\n';
    mes = mes + 'Made by murilocz from The Chosen. ' + emote("chosen");
    messageEmbed(channelID, "Pixelings Tracker", mes, color);
}

// TRACK
var trackHelp = 'Find where pixelings and other level rewards are obtained. Put the name of a pixeling, the name of a spell, `coin`, `xp` or a food type (or `food` for help) after `!track` to find where they can be obtained.';
function findCommand(args, channelID)
{
    var color = 0x66bb6a; //green
    debug("track: args = " + args + ", channelID = " + channelID);
    ss = args[0];
    if (ss == undefined || ss == 'help') {
	messageEmbed(channelID, "!track <reward>", trackHelp, color);
	debug("finished track by help");
	return;
    }
    if (ss == 'food') {
	var mes = "Use `!track` followed by one of the following:\n";
	for (let [id, value] of Object.entries(foodMap)) {

	    mes = mes + '`' + id + '` or `' + value + '` for ' + emote(id + '500') + ', ' + emote(id + '2000') + ' and ' + emote(id + '8000') + '.\n';
	}
	messageEmbed(channelID, "!track", mes);
	debug("finished track by food help");
	return;
    }
    s = ss;
    var ans;
    if (s == 'coin' || s == 'coins')
	ans = findCoins();
    else if (s == 'exp' || s == 'xp')
	ans = findExp();
    else if (isFood(s))
	ans = findFood(s);
    else if (s == 'spell' || s == 'spells')
	ans = findSpell("all");
    else if (isSpell(s))
	ans = findSpell(s);
    else {
	ans = findRotation(s);
	if (ans != "")
	    ans = ans + "\n";
	ans = ans + findPixeling(s);
    }
    if (ans == "") {
	messageEmbed(channelID, "!track error", s + " is not a valid reward.", color);
	debug("finished track by invalid reward");
	return;
    }
    
    messageEmbed(channelID, "!track", ans, color);
    debug("finished track");
}

function findCoins()
{
    var lines = dataCoins;
    lines.sort((x,y) => parseInt(y.split(' ')[0]) - parseInt(x.split(' ')[0]));
    var ans = "";
    var i = 0;
    var amount = "";
    var levels = [];
    var stage = "";

    for (let line of lines) {
	var s = line.split(' ');
	if (amount != 0 && s[0] == amount && s[1] == stage)
	    levels.push(s[2]);
	else {
	    if (amount != 0) {
		if (i < lineLimit)
		    ans = ans + emote('coin') + ' x ' + amount + ' in ' + printLevels(stage, levels) + '.\n';
		i++;
	    }
	    amount = s[0];
	    levels = [s[2]];
	    stage = s[1];
	}
    }
    if (amount != 0) {
	if (i < lineLimit)
	    ans = ans + emote('coin') + ' x ' + amount + ' in ' + printLevels(stage, levels) + '.\n';
	i++;
    }
    return ans;
}

function findExp()
{
    var lines = dataExp;
    lines.sort((x,y) => parseInt(y.split(' ')[0]) - parseInt(x.split(' ')[0]));
    var ans = "";

    var i = 0;
    var amount = "";
    var levels = [];
    var stage = "";
    for (let line of lines) {
	var s = line.split(' ');
	if (amount != 0 && s[0] == amount && s[1] == stage)
	    levels.push(s[2]);
	else {
	    if (amount != 0) {
		if (i < lineLimit)
		    ans = ans + emote('xp') + ' x ' + amount + ' in ' + printLevels(stage, levels) + '.\n';
		i++;
	    }
	    amount = s[0];
	    levels = [s[2]];
	    stage = s[1];
	}
    }
    if (amount != 0) {
	if (i < lineLimit)
	    ans = ans + emote('xp') + ' x ' + amount + ' in ' + printLevels(stage, levels) + '.\n';
	i++;
    }
    return ans;
}

function findFood(color)
{
    for (let [id, value] of Object.entries(foodMap)) {
	if (color == value)
	    color = id;
    }
    var lines = dataFood;
    lines = lines.filter(function(x){ return x.split(' ')[0] == color});
    lines.sort((x,y) => parseInt(y.split(' ')[1]) - parseInt(x.split(' ')[1]));
    var ans = "";
    var i = 0;
    for (let line of lines) {
	var s = line.split(' ');
	if (i < lineLimit) {
	    var type;
	    if (s[1] == "500" || s[1] == "1000" || s[1] == "1500")
		type = "500";
	    if (s[1] == "2000" || s[1] == "4000" || s[1] == "6000")
		type = "2000";
	    if (s[1] == "8000" || s[1] == "16000" || s[1] == "24000")
		type = "8000";
	    var q = Number(s[1]) / Number(type);
	    ans = ans + emote(color + type) + " x " + q;
	    ans = ans + ' in ' + printLevel(s[2], s[3]) + '.\n';
	}
	i++;
    }
    return ans;
}

function findSpell(s)
{
    var lines = dataSpells;
    var mes = "";
    for (let line of lines) {
	var l = line.split(' ');
	if (s == l[0] || s == "spell" + l[0] || s == "all") {
	    mes = mes + "\n" + printSpell(l[0]) + " is ";
	    if (l[1] == "0")
		mes = mes + "unlocked by default.";
	    else
		mes = mes + "found in " + printLevel(l[1], l[2]) + ".";
	}
    }
    return mes.substring(1, mes.length);
}

function findRotation(pixeling)
{
    if (getRarity(pixeling) == "undefined")
	return "";
    var lines = dataRotation;
    var n = lines.length;
    var index = currentChestRotation(n);
    var bestWait = n;
    for (var i = 0; i < lines.length; i++) {
	var line = lines[i];
	var ps = line.split(' ');
	for (let p of ps) {
	    if (p.trim() != pixeling)
		continue;
	    var newWait;
	    if (i < index)
		newWait = i + n - index;
	    else
		newWait = i - index;
	    if (newWait < bestWait)
		bestWait = newWait;
	}
    }
    var mes = "";
    if (bestWait == 0)
	mes = emote(pixeling) + ' in rotation today!';
    else
    {
	mes = emote(pixeling) + ' in rotation in ' + bestWait + ' day';
	if (bestWait > 1)
	    mes = mes + 's';
	mes = mes + ".";
    }
    mes = mes + " Don't miss it by using `!reminder`.";
    return mes;
}

function findPixeling(pixeling)
{
    if (getRarity(pixeling) == "undefined")
	return "";
    var lines = dataLevelsPixelings;
    var ans = "";
    var ansLines = [];
    var i = 0;
    for (let line of lines) {
	var s = line.split(' ');
	if (s[0] != pixeling)
	    continue;
	if (i < lineLimit)
	    ans = emote(s[0]) + ' x' + s[1] + ' in ' + printLevel(s[2], s[3]) + '.';
	i++;
    }
    return ans;
}

// RANK
var rankHelp = 'Find how many copies and coins you need to rank up your pixelings. Put the name of a pixeling, its current rank and its current number of copies to find what is needed to reach max rank. You may also put another target rank after the number of copies.';
function rankCommand(args, channelID)
{
    var color = 0xef5350; //red
    debug("rank: args = " + args + ", channelID = " + channelID);
    if (args.length == 0 || args[0] == 'help') {
	messageEmbed(channelID, "!rank <pixeling> <current rank> <current copies> [<target rank>]", rankHelp, color);
	debug("finished rank by help");
	return;
    }
    if (args.length < 2) {
	messageEmbed(channelID, "!rank error", "`!rank` must have 3 arguments: name of pixeling, current rank and current number of copies.", color);
	debug("finished rank by not enough arguments");
	return;
    }
    var rarity = getRarity(args[0]);
    if (rarity == "undefined") {
	messageEmbed(channelID, "!rank error", args[0] + " is not a valid pixeling.", color);
	debug("finished rank by invalid pixeling");
	return;
    }
    var rank = Number(args[1]);
    if (isNaN(rank) || rank < 1 || rank > copiesMap[rarity].length + 1) {
	messageEmbed(channelID, "!rank error", args[1] + ' is not a valid rank for ' + emote(args[0]) + '.', color);
	debug("finished rank by invalid rank");
	return;
    }
    var maxCopies = 0;
    var tmpRank = rank;
    while (tmpRank < copiesMap[rarity].length + 1) {
	maxCopies += copiesMap[rarity][tmpRank - 1];
	tmpRank++;
    }
    var copies;
    if (args.length > 2)
	copies = Number(args[2]);
    else
	copies = 0;
    if (isNaN(copies) || copies < 0 || copies > maxCopies) {
	messageEmbed(channelID, "!rank error", args[2] + ' is not a valid number of copies for ' + emote(args[0]) + ' at rank ' + args[1] + '.', color);
	debug("finished rank by invalid copies");
	return;
    }
    var toRank;
    if (args.length < 4)
	toRank = copiesMap[rarity].length + 1;
    else {
	toRank = Number(args[3]);
	if (isNaN(toRank) || toRank < 0 || toRank > copiesMap[rarity].length + 1) {

	    messageEmbed(channelID, "!rank error", args[3] + ' is not a valid target rank for ' + emote(args[0]) + '.', color);
	    debug("finished rank by invalid target rank");
	    return;
	}
    }
    var totalCoins = 0;

    var copiesLeft = -copies;
    while (rank < toRank) {
	copiesLeft += copiesMap[rarity][rank - 1];
	totalCoins += coinsMap[rarity][rank - 1];

	rank++;
    }
    if (copiesLeft < 0)
	copiesLeft = 0;
    var mes = "";
    if (totalCoins == 0)
	mes = emote(args[0]) + " is already past rank " + toRank + ".";
    else {
	mes = emote('coin') + ' x ' + totalCoins;
	if (copiesLeft > 0)
	    mes = mes + ' and ' + emote(args[0]) + ' x ' + copiesLeft;
	mes = mes + ' needed for rank ' + toRank + '.';
    }
    messageEmbed(channelID, "!rank", mes, color);
    debug("finished rank");
}

// FOOD
var foodHelp = 'Find what are the favorite foods of a pixeling. Put the name of a pixeling after `!food` to find their favorite foods. To then find where the food itself can be obtained, use `!track food`.';
function foodCommand(args, channelID)
{
    var color = 0xffee58; //yellow
    debug("food: args = " + args + ", channelID = " + channelID);
    if (args.length == 0 || args[0] == 'help') {
	messageEmbed(channelID, "!food <pixeling>", foodHelp, color);
	debug("finished food by help");
	return;
    }
    if (getRarity(args[0]) == "undefined") {
	messageEmbed(channelID, "!food error", args[0] + " is not a valid pixeling.", color);
	debug("finished food by invalid");
	return;
    }
    var colorans = colorMap[args[0]];
    messageEmbed(channelID, "!food", emote(args[0]) + "'s favorite food are " + emote(colorans + "500") + ", " + emote(colorans + "2000") + " and " + emote(colorans + "8000") + ".", color);
    debug("finished food");
}

// ALERT
var alertHelp = "Receive reminders for pixelings in the rotation. Type a pixeling name after the command to receive a reminder 24h before it is available in rotation. You may also type another number of hours after the pixeling name.";
function Message(mesID, mes)
{
    this.message = mes;
    this.id = mesID;
}

function getMessagesHelp(array, channel, callback, before_)
{
    bot.getMessages({
	channelID: channel,
	limit: 100,
	before: before_
    }, function(error, response) {
	var before;
	for (var i in response) {
	    var m = response[i];
	    var mm = new Message(m['id'], m['content']);
	    before = mm.id;
	    array.push(mm);
	}
	if (response.length == 100)
	    getMessagesHelp(array, channel, callback, before);
	else
	    callback(array);
    });
}

function getMessages(channel, callback)
{
    getMessagesHelp([], channel, callback, undefined);
}

function Alert(authorID, pix, messageID, time)
{
    this.author = authorID;
    this.pixeling = pix;
    this.id = messageID;
    this.hours = time;
}

function getAlerts(callback)
{
    getMessages(alertsChannel, function(messages) {
	var alerts = []
	for (let m of messages) {
	    var s = m.message;
	    var ss = s.split(' ');
	    alerts.push(new Alert(ss[0], ss[1], m.id, ss[2]));
	}
	callback(alerts);
    });
}

function alertCommand(authorID, args, channelID)
{
    var color = 0x42a5f5;
    debug("reminder: author = " + authorID + ", args = " + args + ", channelID = " + channelID);
    if (args.length == 0 || args[0] == 'help') {
	messageEmbed(channelID, "!reminder <pixeling> [<hours>]", alertHelp, color);
	debug("finished reminder by help");
	return;
    }
    var pixeling = args[0];
    if (getRarity(pixeling) == "undefined") {
	messageEmbed(channelID, "!reminder error", "" + pixeling + " is not a valid pixeling.", color);
	debug("finished reminder by invalid pixeling");
	return;
    }
    
    var time = 24;
    if (args.length > 1) {
	time = parseInt(args[1]);
	if (isNaN(time) || time < 0 || time > 24) {
	    messageEmbed(channelID, "!reminder error", args[1] + " is not a valid number of hours.", color);
	    debug("finished reminder by invalid time");
	    return;
	}
    }
    getAlerts(function(alerts) {
	for (let alert of alerts) {
	    if (alert.author == authorID && alert.pixeling == pixeling) {
		bot.editMessage({
		    channelID: alertsChannel,
		    messageID: alert.id,
		    message: authorID + " " + pixeling + " " + time
		});
		var s = "Reminder changed for " + emote(pixeling) + " to " + time + " hour";
		if (time != 1)
		    s = s + "s";
		s = s + " before rotation."
		var now = new Date();
		var timeDiff = now.getTime() - referenceDate.getTime();
		var hour = 1000 * 60 * 60;
		var day = hour * 24;
		timeDiff = timeDiff + hour * time;
		var index = Math.floor(timeDiff / day);
		var lines = dataRotation;
		var n = lines.length;
		index = ((index % n) + n) % n;
		var ps = lines[index].split(' ');
		for (let p of ps) {
		    if (p.trim() == pixeling) {
			s = s + "\n" + emote(pixeling) + " can also be found in the rotation in " + time + " hour";
			if (time != 1)
			    s = s + "s";
			s = s + ".";
		    }
		}
		messageEmbed(channelID, "!reminder", s, color);
		return;
	    }
	}
	message(alertsChannel, authorID + " " + pixeling + " " + time);
	var s = "Reminder set for " + emote(pixeling) + " to " + time + " hour";
	if (time != 1)
	    s = s + "s";
	s = s + " before rotation.";
	
	var now = new Date();
	var timeDiff = now.getTime() - referenceDate.getTime();
	var hour = 1000 * 60 * 60;
	var day = hour * 24;
	timeDiff = timeDiff + hour * time;
	var index = Math.floor(timeDiff / day);
	var lines = dataRotation;
	var n = lines.length;
	index = ((index % n) + n) % n;
	var ps = lines[index].split(' ');
	for (let p of ps) {
	    if (p.trim() == pixeling) {
		s = s + "\n" + emote(pixeling) + " can also be found in the rotation in " + time + " hour";
		if (time != 1)
		    s = s + "s";
		s = s + ".";
	    }
	}
	
	messageEmbed(channelID, "!reminder", s, color);
	debug("finished reminder");
    });
}

function checkAlerts()
{
    debug("checkAlerts");
    getAlerts(function(alerts) {
	var lines = dataRotation;
	for (let alert of alerts) {
	    var now = new Date();
	    var timeDiff = now.getTime() - referenceDate.getTime();
	    var hour = 1000 * 60 * 60;
	    var day = hour * 24;
	    timeDiff = timeDiff + hour * alert.hours;
	    var reminder = ((timeDiff % day) + day) % day;
	    if (reminder > hour && reminder < day - 100)
		continue;
	    var index = Math.floor(timeDiff / (hour * 24));
	    var n = lines.length;
	    index = ((index % n) + n) % n;
	    var ps = lines[index].split(' ');
	    for (let p of ps)
		if (p.trim() == alert.pixeling) {
		    var s = alert.pixeling + " in rotation ";
		    if (alert.hours == 0)
			s = s + "now";
		    else {
			s = s + "in " + alert.hours + " hour";
			if (alert.hours != 1)
			    s = s + "s";
		    }
		    s = s + ". If you want the reminder next time too, send the command again.";
		    message(alert.author, s);
		    debug("sent alert to " + alert.author);
		    bot.deleteMessage({
			channelID: alertsChannel,
			messageID: alert.id
		    });
		}
	}
	debug("finished checkAlerts");
    });
}

// ROTATION
var rotationHelp = ' Find the which pixelings will be in rotation. Put a number of days after `!rotation` to find which pixelings will be in the rotation. You can also just type `!rotation` to find the rotation for tomorrow';
const referenceDate = new Date(Date.UTC(2020, 6, 29, 0, 0, 0, 0));
function currentChestRotation(n)
{
    var index = DaysBetween(referenceDate, new Date());
    return ((index % n) + n) % n;
}

function rotationCommand(args, channelID)
{
    var color = 0xe67e22; //orange
    debug("rotation: args = " + args + ", channelID = " + channelID);
    var n;
    if (args.length == 0)
	n = 1;
    else if (args[0] == 'help') {
	messageEmbed(channelID, "!rotation [<days>]", rotationHelp, color);
	debug("finished rotation by help");
	return;
    }
    else {
	n = Number(args[0]);
	if (isNaN(n) || n < 0) {
	    messageEmbed(channelID, "!rotation", args[0] + ' is not a valid number of days.', color);
	    debug("finished rotation by invalid number");
	    return;
	}
    }
    var lines = dataRotation;
    var index = currentChestRotation(lines.length) + n;
    var rot = lines[index % lines.length];
    var mes;
    if (n == 0)
	mes = "Today's rotation is ";
    else if (n == 1)
	mes = "Tomorrow's rotation will be ";
    else
	mes = "The rotation in " + n + " days will be ";
    var ps = rot.split(' ');
    mes = mes + emote(ps[0]) + ', ' + emote(ps[1]) + ', ' + emote(ps[2]) + ' and ' + emote(ps[3]) + '.';
    
    messageEmbed(channelID, "!rotation", mes, color);
    debug("finished rotation");
}

// XP and PXP
var xpHelp = ' Find how much pixeling xp you need. Put the starting level and then the final level after `!xp` to find how much xp is needed. If the final level is omitted, it is assumed to be the max level.';
var pxpHelp = 'Find how much player xp you need. Put the starting level and then the final level after `!pxp` to find how much player xp is needed. If the final level is omitted, it is assumed to be the max level.';
function xpCommandsHelper(args, command, helpText, data, channelID, color)
{
    if (args.length == 0 || args[0] == 'help') {
	messageEmbed(channelID, command + " <start level> [<end level>]", helpText, color);
	return undefined;
    }
    
    var lines = data;
    var n = lines.length + 1;
    var lv1 = Number(args[0]);
    if (isNaN(lv1) || lv1 <= 0 || lv1 > n) {
	messageEmbed(channelID, command + " error", args[0] + ' is not a valid starting level.', color);
	return undefined;
    }
    var lv2 = n;
    if (args.length >= 2) {
	lv2 = Number(args[1]);
	if (isNaN(lv2) || lv2 <= 0 || lv2 > n) {
	    messageEmbed(channelID, command + " error", args[1] + ' is not a valid ending level.', color);
	    return undefined;
	}

    }
    if (lv2 < lv1) {
	messageEmbed(channelID, command + " error", 'starting level must be smaller than ending level.', color);
	return undefined;
    }
    
    var ans = 0;
    for (var i = lv1 - 1; i < lv2 - 1; i++) {
	if (Number(lines[i]) == -1) {
	    messageEmbed(channelID, command + " error", 'I cannot help you with this yet. I do not know the xp for level ' + (i + 1) + ".", color);
	    return undefined;
	}
	ans += Number(lines[i]);
    }
    return [lv1, lv2, ans];
}

function pxpCommand(args, channelID)
{
    var color = 0x9575cd; //violet
    debug("pxp: args = " + args + ", channelID = " + channelID);
    var ans = xpCommandsHelper(args, '!pxp', pxpHelp, dataPxp, channelID, color);
    if (ans == undefined) {
	debug("finished pxp with error or help");
	return;
    }
    messageEmbed(channelID, "!pxp", emote('xp') + ' x ' + ans[2] + ' needed from lv' + ans[0] + ' to lv' + ans[1] + '.', color);
    debug("finished pxp");
}

function xpCommand(args, channelID)
{
    var color = 0xba68c8; //purple
    debug("xp: args = " + args + ", channelID = " + channelID);
    var ans = xpCommandsHelper(args, '!xp', xpHelp, dataXp, channelID, color);
    if (ans == undefined) {
	debug("finished xp with error or help");
	return;
    }
    var food = Math.round(ans[2] / 160) / 100;
    messageEmbed(channelID, "!xp", emote('pixxp') + ' x ' + ans[2] + ' from lv' + ans[0] + ' to lv' + ans[1] + '. This is ' + food + ' of the favorite largest food (' + emote('blue8000') + ', ' + emote('green8000') + ', ' + emote('red8000') + ', ' + emote('yellow8000') + ' or ' + emote('purple8000') + ').', color);
    debug("finished xp");
}
