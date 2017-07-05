/*
 * Copyright 2017 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */
/*jshint esversion: 6 */

'use strict';

const $ = document.getElementById.bind(document);

function logError(err) {
  console.error(err);
}

class VideoFeed {
  constructor(element) {
    this.element = element;
  }

  pause() {
    this.element.pause();
  }

  play() {
    this.element.play();
  }
}

class FeedTable {
  constructor() {
    this.numCols = 5;
    this.col = 0;
    this.testTable = document.getElementById('test-table');
    this.row = this.testTable.insertRow(-1);
  }

  addNewCell() {
    if (this.col == this.numCols) {
      this.row = this.testTable.insertRow(-1);
      this.col = 0;
    }
    var newCell = this.row.insertCell(-1);
    var video = document.createElement('video');
    video.autoplay = false;
    newCell.appendChild(video);
    this.col++;
    return video;
  }
}

class PeerConnection {

  constructor(id, videoElement) {
    this.id = id;
    this.localConnection = null;
    this.remoteConnection = null;
    this.remoteView = videoElement;
  }

  start() {
    const onGetUserMediaSuccess = this.onGetUserMediaSuccess.bind(this);
    return navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              maxWidth: 300,
              minWidth: 300,
            }
          }
        })
        .then(onGetUserMediaSuccess);
  };

  onGetUserMediaSuccess(stream) {
    this.localConnection = new RTCPeerConnection(null);
    this.localConnection.onicecandidate = (event) => {
      this.onIceCandidate(this.remoteConnection, event);
    };
    this.localConnection.addStream(stream);

    this.remoteConnection = new RTCPeerConnection(null);
    this.remoteConnection.onicecandidate = (event) => {
      this.onIceCandidate(this.localConnection, event);
    };
    this.remoteConnection.onaddstream = (e) => {
      this.remoteView.srcObject = e.stream;
    };

    var onCreateOfferSuccess = this.onCreateOfferSuccess.bind(this);
    this.localConnection
        .createOffer({offerToReceiveAudio: 1, offerToReceiveVideo: 1})
        .then(onCreateOfferSuccess, logError);
  };

  onCreateOfferSuccess(desc) {
    this.localConnection.setLocalDescription(desc);
    this.remoteConnection.setRemoteDescription(desc);

    var onCreateAnswerSuccess = this.onCreateAnswerSuccess.bind(this);
    this.remoteConnection.createAnswer().then(onCreateAnswerSuccess, logError);
  };

  onCreateAnswerSuccess(desc) {
    this.remoteConnection.setLocalDescription(desc);
    this.localConnection.setRemoteDescription(desc);
  };

  onIceCandidate(connection, event) {
    if (event.candidate) {
      connection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };
}



class TestRunner {
  constructor(runtimeSeconds, pausePlayIterationDelayMillis) {
    this.runtimeSeconds = runtimeSeconds;
    this.pausePlayIterationDelayMillis = pausePlayIterationDelayMillis;
    this.videoElements = [];
    this.peerConnections = [];
    this.feedTable = new FeedTable();
    this.numConnections = 0;
    this.iteration = 0;
    this.startTime;
    this.lastIterationTime;
  }

  addPeerConnection() {
    const videoElement = this.feedTable.addNewCell();
    this.videoElements.push(videoElement);
    this.peerConnections.push(
        new PeerConnection(++this.numConnections, videoElement, true));
  }

  startTest() {
    this.startTime = Date.now();
    let promises = testRunner.peerConnections.map((conn) => conn.start());
    Promise.all(promises)
        .then(() => {
          this.startTime = Date.now();
          this.pauseAndPlayLoop();
        })
        .catch((e) => {throw e});
  }

  pauseAndPlayLoop() {
    this.iteration++;
    this.videoElements.forEach((feed) => {
      if (Math.random() >= 0.5) {
        feed.play();
      } else {
        feed.pause();
      }
    });
    const status = this.getStatus();
    this.lastIterationTime = Date.now();
    $('status').textContent = status
    if (status != 'ok-done') {
      setTimeout(
          () => this.pauseAndPlayLoop(), this.pausePlayIterationDelayMillis);
    }
  }

  getStatus() {
    if (this.iteration == 0) {
      return 'not-started';
    }
    const timeSpent = Date.now() - this.startTime;
    if (timeSpent >= this.runtimeSeconds * 1000) {
      return 'ok-done';
    } else {
      return `running, iteration: ${this.iteration}`;
    }
  }

  getResults() {
    const runTimeMillis = this.lastIterationTime - this.startTime;
    return {'runTimeSeconds': runTimeMillis / 1000};
  }
}

let testRunner;

function startTest(
    runtimeSeconds, numPeerConnections, pausePlayIterationDelayMillis) {
  testRunner = new TestRunner(
      runtimeSeconds, pausePlayIterationDelayMillis);
  for (let i = 0; i < numPeerConnections; i++) {
    testRunner.addPeerConnection();
  }
  testRunner.startTest();
}
