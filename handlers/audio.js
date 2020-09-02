const { rtdb, db } = require('../util/admin');

exports.getPublicAudio = async (req, res) => {
  const data = [];
  try {
    const snapshot = await rtdb.ref('audio/public').once('value');
    snapshot.forEach((item) => {
      data.push(item);
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
};

exports.getPrivateAudio = async (req, res) => {
  const data = [];
  try {
    const snapshot = await rtdb.ref('audio/private').once('value');
    console.log(snapshot)
    await snapshot.forEach((item) => {
      data.push(item)
    });
    console.log(data)
    return res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.getBsides = async (req, res) => {
  const data = [];
  try {
    const snapshot = await db.collection('bsides').orderBy('year', 'desc').get();
    snapshot.forEach((item) => {
      const document = item.data();
      document.trackId = item.id;
      data.push(document);
    });
    res.status(200).send(data);
    return;
  }
  catch (error) {
    console.error(error);
    res.status(500).send(error);
    return;
  }
}
