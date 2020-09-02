const functions = require('firebase-functions');
const app = require('express')();
const fbAuth = require('./util/fbAuth');
const fccAuth = require('./util/fccAuth');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const firebase = require('firebase/app');
const config = require('./util/config');

app.disable('x-powered-by');
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

firebase.initializeApp(config);

const {
  getAllPlaylists,
  postPlaylist,
  getPlaylist,
  editPlaylist,
  deletePlaylist,
} = require('./handlers/playlists');

const {
  getUserDetails,
  getNewsletter,
} = require('./handlers/users');

const {
  signin,
  signup,
  resign,
  signout
} = require('./handlers/auth');

const {
  getPublicAudio,
  getPrivateAudio,
  getBsides,
} = require('./handlers/audio');

/**  Auth Endpoints **/
app.post('/signin', signin);
app.post('/signup', signup);
app.post('/resign', resign);
app.post('/signout', signout);
/** User Endpoints **/
app.get('/user', fbAuth, getUserDetails);
app.post('/newsletter', getNewsletter);
/** Playlist Endpoints **/
app.get('/playlists', getAllPlaylists);
app.post('/playlist', fbAuth, postPlaylist);
app.post('/editplaylist', fbAuth, editPlaylist);
app.get('/playlist/:playlistId', getPlaylist);
app.delete('/delete/:playlistId', fbAuth, deletePlaylist);
/** Audio Endpoints **/
app.get('/audio', getPublicAudio);
app.get('/privateaudio', fbAuth, getPrivateAudio);
app.get('/bsides', fccAuth, getBsides);

exports.api = functions.region('europe-west1').https.onRequest(app);
