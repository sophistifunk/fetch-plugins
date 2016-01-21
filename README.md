# Helpers to fetch and collate some metadata about Jenkins plugins

**Caveat Hax0r:** This is probably very fragile, I've just been screwing around with it, it's not
tested in any meaningful way.

## Contact
[Josh McDonald](mailto:jmcdonald@cloudbees.com)


## Requirements
* Node (maybe 4, I'm using 5) & npm

## Running

Currently working:

    nvm use 5 # Switch nodes if req'd
    npm install # fetch dependencies
    node get-metadata.js # Download details and install stats from jenkins-ci.org
    node sort-metadata.js # Combines the info and spits out a sorted JSON and minimal CSV

Not quite ready-to-eat yet:

    node fetch-next-20.js # Download (next) 20 plugins to ./downloads/

Currently non-existent

    node extract-plugin-details.js # Poke around inside the .jars and learn stuff

## TODO

- [ ] Add a script to download the top *n* plugins by installed base **(mostly done)**
- [ ] Add a script to explode the downloaded jars, look for .jelly files and write out a JSON and/or HTML index
- [ ] World Peace