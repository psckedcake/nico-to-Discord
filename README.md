#  Made by Discord sample bot working on glitch.com
## Thanks for makers who created below:
ニコ生アラート関係:(for api):https://github.com/fagai/nicolive-alert-slack
Discord sample bot:         https://qiita.com/vvani06/items/f437c5e89aeabc587a96
## How to launch bot

1. Import this repository to `glitch.com`.
1. Add this line to `.env` file; `DISCORD_BOT_TOKEN={YOUR_DISCORD_BOT_USER_TOKEN}`
1. And so on to Webhook one. Create webhooks and get params as URL(https://discordapp.com/api/webhooks/{id}/{token})
and  write down on`_env`
1. Just run on `glitch.com` !

To get discord bot token, visit discord official develoer site; https://discordapp.com/developers/applications/me/

## Running bot 24h on glitch.com

Applications on `glitch.com` may sleep when keep no access for 5 minutes.
You must ping application URL every 5 minutes to run your bot continuously.
Using `uptimerobot.com` service is just good.