# Helpers to fetch and collate some metadata about Jenkins plugins

**Caveat Hax0r:** This is probably very fragile, I've just been screwing around with it, it's not
tested in any meaningful way.

## Contact
[Josh McDonald](mailto:jmcdonald@cloudbees.com)


## Requirements
* Node (maybe 4, I'm using 5) & npm

## Running

    nvm use 5 # Switch nodes if req'd
    npm install # fetch dependencies
    node get-metadata.js # Download details and install stats from jenkins-ci.org
    node sort-metadata.js # Combines the info and spits our a sorted JSON and minimal CSV