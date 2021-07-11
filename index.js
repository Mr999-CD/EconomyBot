require("http")
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  })
  .listen(process.env.PORT, "0.0.0.0");

const Discord = require("discord.js");
const {Client , MessageEmbed} = require("discord.js");
const client = new Client();
//Packages//
let db = require("quick.db");
let ms = require("ms");
let fs = require("fs");
//Packages//

let {prefix , LOGIN , devs} = require(`./config`);
client.login(LOGIN)

client.on('ready', () => {
	  var clientData = [{
    Name: client.user.tag,
    Server: client.guilds.cache.size,
    Channels: client.channels.cache.size,
	prefix : prefix
  }]

  console.table(clientData)
  client.user.setStatus("idle");
});

client.on('ready', () => {


  var ms = 5000;

  var setActivity = [`${prefix}help`, `My Prefix [${prefix}]`];

  var i = -1;

  var j = 0;

  setInterval(function() {

    if (i == -1) {

      j = 1;

    }

    if (i == (setActivity.length) - 1) {

      j = -1;

    }

    i = i + j;

    client.user.setActivity(setActivity[i]);

  }, ms);

});



client.on("message", async OmegaCodes => {
  if (OmegaCodes.content.startsWith(`${prefix}rep`)) {
    let user = OmegaCodes.guild.member(OmegaCodes.mentions.users.first() || false);
    if (!user) return OmegaCodes.channel.send(`**:rolling_eyes: | ${OmegaCodes.author.username}**, The user could not be found.`)
    if (user.id == OmegaCodes.author.id) return OmegaCodes.channel.send(`**:rolling_eyes:  | ${OmegaCodes.author.username}, You cant give yourself a rep point !**`)
    if (user.bot) return OmegaCodes.channel.send(`**:thinking:  | ${OmegaCodes.author.username} , bots do not have rep!**`)
    let timeout = 8.64e+7;
    let repTime = await db.fetch(`repTime_${OmegaCodes.author.id}`);
    if (repTime === null) repTime = 0;
    let S = ms(timeout - (Date.now() - repTime), { long: false });
    if (repTime !== null && timeout - (Date.now() - repTime) > 0) {
      let H = ms(timeout - (Date.now() - repTime), { long: false });
      OmegaCodes.channel.send(`**Please Try Again After :** \`${H}\``);
    } else {
      OmegaCodes.channel.send(`** 🆙  |  ${OmegaCodes.author.username} has given ${user} a reputation point!**`)
      await db.add(`rep_${user.id}`, 1);
      await db.set(`repTime_${OmegaCodes.author.id}`, Date.now());
    }
  }
});

client.on("message" , async OmegaCodes => {
  if(OmegaCodes.content.startsWith(`${prefix}myreps`)){
    let user = OmegaCodes.guild.member(OmegaCodes.mentions.users.first() || OmegaCodes.author.id);
    if(user.bot) return OmegaCodes.channel.send(`**:thinking:  | ${OmegaCodes.author.username} , bots do not have rep!**`)
    let myreps = await db.fetch(`rep_${user.id}`);
    if(myreps === null){
      await db.set(`rep_${user.id}`,0)
    }
    message.channel.send(`**${user.tag} 's Reps is : \`${myreps}\`**`)
  }
})

client.on("message", async OmegaCodes => {
  if (OmegaCodes.content.startsWith(`${prefix}daily`)) {
    await db.add(`credits_${OmegaCodes.author.id}`, 1)
    let amount = Math.floor(Math.random() * 4000) + 1;
    let timeout = 8.64e+7;
    if (OmegaCodes.author.bot) return OmegaCodes.channel.send(`**:thinking:  | bots do not have credits!**`)
    let dailyTime = await db.fetch(`dailyTime_${OmegaCodes.author.id}`);
    if (dailyTime === null) dailyTime = 0;
    if (dailyTime !== null && timeout - (Date.now() - dailyTime) > 0) {
      let time = timeout - (Date.now() - dailyTime)
      let H = ms(time, { long: true });
      OmegaCodes.channel.send(`**Please Try Again After :** \`${H}\``)
    } else {
      OmegaCodes.channel.send(`**💰 ${OmegaCodes.author.username} , You git 💵  ${amount} daily  credits!**`)
      await db.add(`credits_${OmegaCodes.author.id}`, parseInt(amount))
      await db.set(`dailyTime_${OmegaCodes.author.id}`, Date.now());
    }
  }
});

let captcha = require("./captcha.json");
client.on("message", async OmegaCodes => {
  await db.add(`credits_${OmegaCodes.author.id}`, 1)
  if (OmegaCodes.content.startsWith(`${prefix}credits`)) {
    let args = OmegaCodes.content.split(" ");
    if (!args[2]) {
      let user = OmegaCodes.guild.member(OmegaCodes.mentions.users.first());
      if (user) {
        user = user.user
      } else {
        user = OmegaCodes.author
      }
      if (user.bot) return OmegaCodes.channel.send(`**:thinking:  | ${OmegaCodes.author.username} , bots do not have credits!**`)
      let balance = await db.fetch(`credits_${user.id}`);
      if (balance === null) balance = 0;
      OmegaCodes.channel.send(`**:bank: | ${user.username} , your account balance is \`${balance}$\`**`)
    } else if (args[2]) {
      let user = OmegaCodes.mentions.users.first();
      if (user.id === OmegaCodes.author.id) return OmegaCodes.channel.send(`**:rolling_eyes:  | ${OmegaCodes.author.username}, You cant give yourself credits !**`)
      let balance = await db.fetch(`credits_${OmegaCodes.author.id}`);
      if (OmegaCodes.content.includes("-")) return OmegaCodes.channel.send("Negative money can not be transfer.")
      if (balance < parseInt(args[2]))
        return OmegaCodes.channel.send(`You don't have Enough credits to give to ${user.username}`)
      if (parseInt(args[2]) < 1)
        return OmegaCodes.channel.send(`You Must transfer credits above \`1\`.`)
      if (isNaN(parseInt(args[2])))
        return OmegaCodes.channel.send("Only Number")
      let tax = Math.floor(args[2] * (5 / 100));
      let Price = OmegaCodes.content.split(" ")[2];
      let resulting = Math.floor(Price - Price * (5 / 100));
      OmegaCodes.channel.send(`**${OmegaCodes.author.username}, Transfer Fees \`${tax}\`, Amount :\`${resulting}\` **\n type these numbers to confirm : `)
        .then(m => {
          const item = captcha[Math.floor(Math.random() * captcha.length)];
          const filter = response => {
            return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
          };
          OmegaCodes.channel.send({
            files: [{
              attachment: item.type,
              name: "capatcha.png"
            }]
          }).then(s => {
            OmegaCodes.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
              .then(async (collected) => {
                OmegaCodes.channel.send(
                  `**:moneybag: - ${OmegaCodes.author.username}, has transferred \`$${resulting}\` to ${user}**`
                );
                user.send(
                  `**:atm: | Transfer Receipt**\`\`\`You Have Received \$${resulting}\ From User ${OmegaCodes.author.username} (ID : ${OmegaCodes.author.id})\`\`\``
                );
                s.delete();
                m.delete();
                await db.add(`credits_${user.id}`, parseInt(resulting))
                await db.subtract(`credits_${OmegaCodes.author.id}`, parseInt(Price))
              })
          });
        });
    }
  }
});




client.on("message" , OmegaCodes => {
  if(OmegaCodes.content.startsWith(`${prefix}help`)){
      let HelpEmbed = new Discord.MessageEmbed()
      .setTitle('Help List')
      .setColor("RANDOM")
      .setDescription(`
        ${prefix}myreps <@678517905150836757> \n لروية الريب لي عندك او اي شخص
        ${prefix}rep <@678517905150836757> \n لاعطاء ريب
        ${prefix}credits <@678517905150836757> \n لرؤية عدد كريدت شخص ما او انت
        ${prefix}credits <@678517905150836757> 1000 \n لتحويل الكريدت لشخص
        ${prefix}daily \n لاخد الراتب اليومي
      `)
      OmegaCodes.channel.send(HelpEmbed)
  }
});