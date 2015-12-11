uptime-hipchat
==============

It's a simple plugin to provide room notification for [Hipchat](https://hipchat.com/) for the [Uptime](https://github.com/fzaninotto/uptime) app by [@fzaninotto](https://github.com/fzaninotto).


Installing
----------

To install, clone the repository on your `plugin` directory:

```sh
$ git clone git://github.com/acoquoin/uptime-hipchat.git hipchat
```

Configuring
-----------

Edit your `config` file, to activate the plugin, just add the plugin:

```yaml
plugins:
  - ./plugins/hipchat
```

And append the configuration:

```yaml
hipchat:
  token: # notification token (only v1)
  event:
    up:        green # turn to false to disable, or just colorize the event
    down:      red
    paused:    gray
    restarted: yellow
```

More information about the supported colours: [https://www.hipchat.com/docs/api/method/rooms/message](https://www.hipchat.com/docs/api/method/rooms/message)

License
-------

This code is free to use and distribute, under the [MIT license](https://raw.github.com/acoquoin/uptime-hipchat/master/LICENSE).

TODO
----

* Migrate on Hipchat API v2
* Unit tests
