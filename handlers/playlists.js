const { db } = require("../util/admin");

/** Get All Playlists */

exports.getAllPlaylists = async (req, res) => {
  const data = [];
  const snapshot = await db.collection("playlists").get();
  try {
    snapshot.forEach(item => {
      const playlist = item.data();
      playlist.playlistId = item.id;
      data.push(playlist)
    });
    res.status(200).send(playlist)
    return;
  }
  catch (error) {
    res.status(500).send(error);
    return;
  }
};

/** Post Playlist @protectedRoute  */

exports.postPlaylist = (req, res) => {
  const newPlaylist = {
    title: req.body.title.trim().toLowerCase(),
    handle: req.user.handle,
    tracks: req.body.tracks,
    date: new Date().toISOString()
  };

  db.collection("playlists")
    .add(newPlaylist)
    .then(doc => {
      newPlaylist.playlistId = doc.id;
      res.json({ message: `playlist ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "creating new Playlist failed" });
      console.error(err);
    });
};

/** edit existing Playlist @protected */

exports.editPlaylist = (req, res) => {
  const updatedPlaylist = {
    title: req.body.title,
    handle: req.body.handle,
    tracks: req.body.tracks,
    playlistId: req.body.playlistId
  };
  db.doc(`/playlists/${updatedPlaylist.playlistId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      if (doc.data().handle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      db.doc(`/playlists/${updatedPlaylist.playlistId}`).update({
        title: updatedPlaylist.title,
        tracks: updatedPlaylist.tracks
      });
      return res.json(doc.data());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
/** fetch one playlist */
exports.getPlaylist = async (req, res) => {
  const data = {};
  const snapshot = await db.doc(`/playlists/${req.params.playlistId}`).get();
  try {
    if (!snapshot.exists) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }
    else if (snapshot.data().handle !== req.user.handle) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    } else {
      data = snapshot.data();
      data.playlistId = snapshot.id;
      res.json(data);
      return;
    }
  }
  catch (error) {
    console.error(error);
    status(500).json({ error: "Something went wrong" });
    return;
  };
};

/** Delete Playlist @protectedRoute */

exports.deletePlaylist = async (req, res) => {
  const snapshot = await db.doc(`/playlists/${req.params.playlistId}`).get();
  try {
    if (!snapshot.exists) {
      res.status(404).json({ error: 'Playlist not found' })
      return;
    } else if (doc.data().handle !== req.user.handle) {
      res.status(404).json({ error: 'Unauthorized' });
      return;
    } else {
      snapshot.delete();
      res.status(200).json({ message: 'Playlist successfully deleted' })
      return;
    }
  }
  catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
    return;
  }
};
