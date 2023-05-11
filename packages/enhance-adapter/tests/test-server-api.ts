import express from 'express';
import http from 'http';

const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'axios-enhance-adapter');
  next();
});

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

let count = 0;

app.get('/reset-count', (req, res) => {
  count = 0;
  res.end(count);
});

app.all('/add-count', async (req, res) => {
  const { method, query, body } = req;
  const { delay } =
    method.toLowerCase() === 'get' ? query : Object.keys(body).length ? body : query || {};
  await sleep(delay || 1000);
  count += 1;
  res.send({ count });
});

let retryCount = 0;
const errorCountMap = new Map();
app.all('/test-error-retry', async (req, res) => {
  const { method, query, body } = req;
  const { key, delay, maxErrorCount } =
    method.toLowerCase() === 'get' ? query : Object.keys(body).length ? body : query || {};
  await sleep(delay || 1000);
  let status = 400;
  const errorCount = errorCountMap.get(key) || 0;
  if (errorCount >= maxErrorCount) {
    status = 200;
    errorCountMap.delete(key);
  } else {
    errorCountMap.set(key, errorCount + 1);
  }
  retryCount += 1;
  console.log(key, status);
  res.status(status).send({ retryCount });
});

app.all('/*', async (req, res) => {
  const { method, query, body } = req;
  const { delay, response } =
    method.toLowerCase() === 'get' ? query : Object.keys(body).length ? body : query || {};
  await sleep(delay || 1000);
  res.send(response);
});

let server: http.Server;
export function runServer(port: number) {
  return new Promise((resolve, reject) => {
    try {
      server = app.listen(port, () => {
        console.log('runServer at port: %o', port);
      });
      resolve(server);
    } catch (e) {
      console.log('run error', e);
      reject(e);
    }
  });
}

export function closeServer() {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(err);
    });
  });
}
