/**
 * Hipchat plugin
 * https://github.com/acoquoin/uptime-hipchat
 *
 * Adds the ability to push an alert on an hipchat room
 *
 * Installation
 * ------------
 * This plugin is disabled by default. To enable it, add its entry
 * from the `plugins` key of the configuration:
 *
 *   // in config/production.yaml
 *   plugins:
 *      - ./plugins/hipchat
 *
 * And add the plugin configuration:
 *
 *   hipchat:
 *      token: <hipchat token v1>
 *      event:
 *          up:        <yellow|red|green|purple|gray|random|false>
 *          down:      <yellow|red|green|purple|gray|random|false>
 *          paused:    <yellow|red|green|purple|gray|random|false>
 *          restarted: <yellow|red|green|purple|gray|random|false>
 *
 * Usage
 * -----
 * Simply push a notification on a hipchat room.
 */
var CheckEvent  = require('../../models/checkEvent'),
    querystring = require('querystring'),
    ejs         = require('ejs'),
    fs          = require('fs'),
    moment      = require('moment');

exports.initWebApp = function(options) {
    var dashboard = options.dashboard,
        config    = options.config.hipchat;
    if(!config.token) {
        throw new Error('Missing Hipchat token');
    }
    dashboard.on('populateFromDirtyCheck', function(checkDocument, dirtyCheck, type) {
        checkDocument.setPollerParam('hipchat', dirtyCheck.hipchat.split(/,|;|\/|\|/gi).map(function(room) {
          return room.toLowerCase().trim();
        }).join('; '));
    });
    dashboard.on('checkEdit', function(type, check, partial) {
        partial.push(ejs.render(fs.readFileSync(__dirname + '/views/edit.ejs', 'utf8'), {locals: {check: check}}));
    });
    CheckEvent.on('afterInsert', function(checkEvent) {
        if (!config.event[checkEvent.message]) {
            return;
        }
        checkEvent.findCheck(function(err, check) {
            if(null !== check.pollerParams.hipchat && check.pollerParams.hipchat.length > 0) {
                if (err) {
                    return console.error(err);
                }
                check.pollerParams.hipchat.split('; ').forEach(function(room) {
                    var post = require('http').request({
                        host: 'api.hipchat.com',
                        path: '/v1/rooms/message/?auth_token=' + config.token,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }, function(res) {
                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            var data = JSON.parse(chunk);
                            if(data.error) {
                                console.log('['+ check.name + '] hipchat: ' + data.error.message);
                            }
                        });
                    });
                    post.write(querystring.stringify({
                        color: 'string' === typeof config.event[checkEvent.message] ? config.event[checkEvent.message] : 'yellow',
                        notify: 1,
                        room_id: room,
                        message: ejs.render(fs.readFileSync(__dirname + '/views/hipchat.ejs', 'utf8'), {
                            check: check,
                            checkEvent: checkEvent,
                            url: options.config.url,
                            moment: moment
                        }),
                        from: config.username || 'Uptime'
                    }));
                    post.end();
                });
            }
        });
    });
};
