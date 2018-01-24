delete require('http').OutgoingMessage.prototype.flush;
const express = require('express');
const app = express();
const db = require('redis').createClient(process.env.VASCO_URL);
const log = (...args) => console.log('>>', ...args);

const dbSubscriptions = [];
db.on('error', err => { throw err; });
db.monitor();
db.on('monitor', (id, cmd, reply) =>
  cmd[0] === 'set' &&
    dbSubscriptions.forEach(sub =>
      sub({ id, cmd, reply })
    )
);

function subscribeToDb(sub) {
  dbSubscriptions.push(sub);
  return {
    dispose: () => dbSubscriptions.splice(dbSubscriptions.indexOf(sub), 1)
  };
}

app.get('/ping', (req, res) => res.send('pong'));
app.get('/data', (req, res) => {
  log('request for /data');
  const eventBuffer = [];
  const subscription = subscribeToDb(e => eventBuffer.push(e));
  db.keys('alive.*', (err, aliveKeys) => {
    if (err) { throw err; }
    log('alive.* keys', aliveKeys);
    writeHeaders();
    const aliveKeyBatch = db.batch();
    aliveKeys.forEach(aliveKey => aliveKeyBatch.get(aliveKey));
    aliveKeyBatch.exec((aliveErr, serviceNames) => {
      if (aliveErr) { throw aliveErr; }
      serviceNames.forEach((serviceName, index) => writeEvent({
        retry: 1,
        cmd: ['set', aliveKeys[index], serviceName, 'EX', '3'],
      }));
      subscription.dispose();
      subscribeToDb(writeEvent);
      eventBuffer.forEach(writeEvent);
      eventBuffer.splice(0, eventBuffer.length);
    });
  });
  function writeHeaders() {
    log('wrote head');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();
  }
  function writeEvent(e) {
    log('writing event', e);
    if (e.id) { res.write(`id: ${e.id}\n`); }
    if (e.retry) { res.write(`retry: ${e.retry}\n`); }
    res.write(`event: ${e.cmd[0]}\n`);
    res.write(`data: ${JSON.stringify(e.cmd.slice(1))}\n\n`);
  }
});

app.get('/', (req, res) => res.sendFile(__dirname + '/build/index.html'));
app.use(express.static('client'));

app.listen(process.env.PORT || 3000);
log('started');
