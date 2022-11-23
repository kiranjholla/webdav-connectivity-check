## Context

Facing an issue with the [Remotely Save](https://github.com/remotely-save/remotely-save) plugin for Obsidian. While trying to sync using my own WebDAV server, the plugin keeps hitting a HTTP 401 error and fails its connectivity check.

However, the WebDAV server I am using works fine for other types of connections, and is actively being used without incident for other purposes. Hence, I wanted to investigate what's going on.

In this repo, I have extracted just those pieces of code which run on clicking the "Check" button to initiate a Connectivity Check on the plugin settings page. The theory was that this should help me identify why the plugin is facing a HTTP 401.

However, this code too works just fine and is able to connect to my WebDAV server. Hence, there is something more going on within the plugin which isn't visible to me as of now.

Raised this as a [question on the Remotely Save discussion board](https://github.com/remotely-save/remotely-save/discussions/249)
