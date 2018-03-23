// Response for Uptime Robot
const http = require('http');
http.createServer(function(request, response)
{
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Discord bot is active now \n');
}).listen(3000);

// Discord bot implements
const discord = require('discord.js');
const client = new discord.Client();
const hook = new discord.WebhookClient(process.env.discord_webhook_id, process.env.discord_webhook_token);
//nicoliveAlertImplements
var NicoLiveAlert = require('./lib/NicoLiveAlert');
var NicoLiveAlertChatParser = require('./lib/NicoLiveAlertChatParser');



var domain = require('domain');
var d = domain.create();

d.on('error', function(err) {
    console.log('error: '+ err);
});


var async = require('async');
async.waterfall([
  function(next) {
    NicoLiveAlert.login(process.env.NICONICO_LOGIN_MAIL, process.env.NICONICO_LOGIN_PASS, function(err, ticket) {
      next(err, ticket);
    });
  },
  function(ticket, next) {
    NicoLiveAlert.getAlertStatus(ticket, function(err, alert_status) {
      next(err, alert_status);
    });
  },
  function(alert_status, next) {
    NicoLiveAlert.connectCommentServer(alert_status, function(err, socket) {

      if(err) { next(err) }

      socket.on('connect', function() {
        console.log('connect alert server.');
        
      });
       
      socket.on('data', function(data) {
          

          var nico_live_alert_chat_parser = new NicoLiveAlertChatParser(data, alert_status.getCommunityIds());
          var in_community_ids = nico_live_alert_chat_parser.retriveInCommunityIds();
          if(!in_community_ids.length) {
              return;
          }
          var live_ids = nico_live_alert_chat_parser.retriveLiveIds(in_community_ids);
          
          live_ids.forEach(function(live_id) {
              console.log(live_id);
            var prev_post_text;
              var stream_info=NicoLiveAlert.retrievePlayerstatus(live_id);
              var info= stream_info.split(',');
            console.log(info[0]);
            console.log(info[1]);
            var post_text = info[0]+ "が"+info[1]+ "で配信を開始しました"+ "http://live.nicovideo.jp/watch/lv" + live_id;
            if(prev_post_text != post_text){
            hook.send(post_text);
              }
            prev_post_text=post_text;
            
              
              }
          );
     
      });

    });
  }
], d.intercept(function(result){

}));

//以下、完全にbotテスト用
client.on('ready', message =>
{
	console.log('bot is ready!');
  
});

client.on('message', message =>
{
	if(message.isMemberMentioned(client.user))
	{
		message.reply( '呼びましたか？' );
		return;
	}
 
  if(message.content=='ping'){
     message.channel.send('pong');
  }
  if(message.content.includes('!add')){
    var txt=message.content.split(" ");
     //add(txt[1]); todoにしときます
    //message.channel.send("コミュニティ" +txt[1] +"をアラート対象に追加しました");
    //当然上もおかしいけど放置
  }
});

if(process.env.DISCORD_BOT_TOKEN == undefined)
{
	console.log('please set ENV: DISCORD_BOT_TOKEN');
	process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

"use strict";

