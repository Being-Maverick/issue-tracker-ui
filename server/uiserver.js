import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import render from './render.jsx';
import SourceMapSupport from 'source-map-support';

dotenv.config();
SourceMapSupport.install();
const port = process.env.UI_SERVER_PORT || 8000;

if(!process.env.UI_API_ENDPOINT){
  process.env.UI_API_ENDPOINT = 'http://localhost:3000/graphql';
}

if (!process.env.UI_AUTH_ENDPOINT) {
  process.env.UI_AUTH_ENDPOINT = 'http://localhost:3000/auth';
}  

if(!process.env.UI_SERVER_API_ENDPOINT){
  process.env.UI_SERVER_API_ENDPOINT = process.env.UI_API_ENDPOINT;
}

const app = express();
const enableHMR = (process.env.ENABLE_HMR || true) === true;

if (enableHMR && (process.env.NODE_ENV !== 'production')) {
  console.log('Adding new middleware HMR');

  const webpack = require('webpack');
  const devMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');

  const config = require('../webpack.config.js')[0];
  config.entry.app.push('webpack-hot-middleware/client');

  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  const compiler = webpack(config);

  app.use(devMiddleware(compiler));
  app.use(hotMiddleware(compiler));
}

app.get('/env.js', (req, res) => {
  const env = { 
    UI_API_ENDPOINT: 'http://localhost:3000/graphql',
    UI_AUTH_ENDPOINT: process.env.UI_AUTH_ENDPOINT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
   };
  res.send(`window.ENV = ${JSON.stringify(env)}`);
});

app.get('*', (req, res, next) => {
  render(req, res, next);
});

app.use(express.static('public'));
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});

if(module.hot){
  module.hot.accept('./render.jsx');
}