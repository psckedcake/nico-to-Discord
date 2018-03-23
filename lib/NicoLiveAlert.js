"use strict";

class NicoLiveAlert {
    constructor () {
        this.request = require('request');
        this.net = require('net');
        this.xmlParseString = require('xml2js').parseString;
        this.nicoLiveAlertStatus = require('./NicoLiveAlertStatus');
    }
    login (email, password, callback) {
        this.request.post({
            url : 'https://secure.nicovideo.jp/secure/login?site=nicolive_antenna',
            form: {'mail': email, 'password': password}
        }, (err, res, body) => {
            if(err) return callback(err);
            this.xmlParseString(body, {explicitArray: false}, function(err, result) {
                if(err) return callback(err);
                if ( result.nicovideo_user_response.$.status === 'fail' ) {
                    switch(result.nicovideo_user_response.error.code) {
                        case '1':
                            return callback(Error('authorizeException! wrong mail or password'));
                        default:
                            return callback(Error('authorize error.'));
                    }
                }
                // 認証チケット
                var ticket = result.nicovideo_user_response.ticket;
                return callback(null, ticket);
            });
        });
    }
    getAlertStatus (ticket, callback) {
        this.request.post({
            url: 'http://live.nicovideo.jp/api/getalertstatus',
            form: { ticket : ticket }
        }, (err, res, body) => {
            if( err ) return callback(err);
            this.xmlParseString(body, {explicitArray: false}, (err, result) => {
                if(err) return callback(err);
                if ( result.getalertstatus.$.status === 'fail' ) {
                    switch(result.getalertstatus.error.code) {
                        case 'incorrect_account_data':
                            return callback(Error('incorrect account data.'));
                        default:
                            return callback(Error('getalertstatus error.'));
                    }
                }

                return callback(null, new this.nicoLiveAlertStatus(result.getalertstatus));
            });
        });
    }
    connectCommentServer (alert_status, callback) {
        var server_config = alert_status.getCommentServerData();
        var socket = this.net.connect(+server_config.port, server_config.addr);
        socket.setEncoding('utf-8');
        socket.on('connect', function(){
            socket.write('<thread thread="'+ server_config.thread + '" version="20061206" res_from="-1"/>\0');
        });
        socket.on('error', function(err) {
            callback(err);
        });
        
        callback(null, socket);
    }
  retrievePlayerstatus(live_id){
    
      var raw_json= getJSON('http://api.ce.nicovideo.jp/liveapi/v1/video.info?__format=json&v=lv'+ live_id);
      var  data   = raw_json.parse;
      console.log(data);
      return data.video_info.video.user_id +"," + data.community.name;
     
                //console.log(result.nicolive_video.video_info.video.title);
                //console.log(result.nicolive_video.video_info.community.name);
              //return result.nicolive_video.video_info.video.title+ ',' + result.nicolive_video.video_info.community.name;
              
  }
}

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
function getJSON(url) {
        var resp ;
        var xmlHttp ;

        resp  = '' ;
        xmlHttp = new XMLHttpRequest();

        if(xmlHttp != null)
        {
            xmlHttp.open( "GET", url, false );
            xmlHttp.send( null );
            resp = xmlHttp.responseText;
        }

        return resp ;
}

module.exports = new NicoLiveAlert;