[![Build Status](https://travis-ci.org/webrtc/test-pages.svg)](https://travis-ci.org/webrtc/test-pages)

# Intro #
Collection of test pages used for WebRTC development


## Development ##
Detailed information on developing in the [webrtc](https://github.com/webrtc) GitHub repo can be found in the [WebRTC GitHub repo developer's guide](https://docs.google.com/document/d/1tn1t6LW2ffzGuYTK3366w1fhTkkzsSvHsBnOHoDfRzY/edit?pli=1#heading=h.e3366rrgmkdk).


#### Clone the repo in desired folder
```bash
git clone https://github.com/webrtc/test-pages.git
```

#### Install npm dependencies (also adds linting to precommit githooks)
```bash
npm install
```

### Start web server for development
From the root of the checkout do `cd test` then run `node server.js` and finally navigate your browser to `https://localhost:8080`.

#### Linting
Runs grunt which currently only does linting.
```bash
npm test
```
