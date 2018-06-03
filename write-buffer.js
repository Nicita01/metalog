'use strict';

const util = require('util');
const EventEmitter = require('events');

const DEFAULT_LENGTH = 16385;
const MAX_LENGTH_MESSAGE = 10 * DEFAULT_LENGTH;

function WriteBuffer(length, timeout, maxLength) {
  this.length = length || DEFAULT_LENGTH;
  this.writeInterval = timeout || null;
  this.position = 0;
  this.maxLength = maxLength || MAX_LENGTH_MESSAGE;
  this.buffer = Buffer.allocUnsafe(this.length);
  this.writeTimer = null;
}

util.inherits(WriteBuffer, EventEmitter);

WriteBuffer.prototype.write = function(buffer) {
  const freeSize = this.length - this.position;
  const messageLength = buffer.length;
  if (freeSize >= messageLength) {
    buffer.copy(this.buffer, this.position);
    clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      this.emit('data', null, Buffer.from(this.buffer.slice(0, this.position)));
    }, this.writeInterval);
    this.position += messageLength;
  } else if (messageLength < this.length) {
    this.emit('data', null, Buffer.from(this.buffer.slice(0, this.position)));
    this.position = 0;
    this.write(buffer);
  } else if (messageLength < this.maxLength) {
    this.emit('data', null, Buffer.from(this.buffer.slice(0, this.position)));
    this.position = 0;
    let cntBytesTransmit = this.length;
    for (; cntBytesTransmit < messageLength; cntBytesTransmit += this.length) {
      this.emit('data', null, buffer.slice(
        cntBytesTransmit - this.length, cntBytesTransmit
      ));
    }
    this.write(buffer.slice(cntBytesTransmit - this.length, messageLength));
  } else {
    this.emit('data', new Error('message is to large'));
  }
};

WriteBuffer.prototype.drop = function(start = 0, end = this.position) {
  this.emit('data', null, Buffer.from(this.buffer.slice(start, end)));
};
