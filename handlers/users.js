require('firebase/firebase-auth');

const { admin, db } = require('../util/admin');

const {
  isEmail,
} = require('../util/validators');

/** get users details **/
exports.getUserDetails = async (req, res) => {
  let data = {};
  const snapshot = await db.doc(`/users/${req.user.handle}`).get();
  try {
    if (snapshot.exists) {
      data = snapshot.data();
      const playlists = await db.collection('playlists').where('handle', '==', req.user.handle).get();
      data.playlists = [];
      playlists.forEach(item => {
        data.playlists.push(item.data())
      })
      res.status(200).json(data);
      return;
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send(error);
    return;
  }
};

exports.getNewsletter = async (req, res) => {
  const userEmail = req.body.email;
  if (!userEmail || !isEmail(userEmail)) {
    res.status(400).json({ error: 'invalid email' });
    return;
  }
  try {
    const listRef = db.collection('newsletter').doc('list');
    const users = await listRef.get();
    if (users.data().users.indexOf(userEmail) !== -1) {
      res.status(200).json({ message: 'already signed up' });
      return;
    } else {
      listRef.update({
        users: admin.firestore.FieldValue.arrayUnion(userEmail),
      });
      res.status(201).json({ message: 'successfully signed up' });
      return;
    }
  }
  catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
