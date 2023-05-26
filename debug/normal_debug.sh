#!/bin/bash
echo 'Debug start!'
curl http://192.168.2.98:3000/key_server -v -o /dev/null -H 'Cookie: User=qrio_debug; Token=6bb94-eab899e-463e-930789-3b48c13620;' 
wscat -c ws://192.168.2.98:3000 -H 'Cookie: User=qrio_debug; Token=6bb94-eab899e-463e-930789-3b48c13620;' -w 2 -x "state-check"
