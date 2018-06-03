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
