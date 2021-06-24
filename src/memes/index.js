const admin = require('firebase-admin')
const serviceAccount = require('../../credentials.json')

function connectFirestore() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  }

  return admin.firestore()
}

exports.getMemes = (req, res) => {
  const db = connectFirestore()
  db.collection('memes').get()
    .then(collection => {
      const memes = collection.docs.map(doc => {
        let thisMeme = doc.data()
        thisMeme.id = doc.id
        return thisMeme
      })
      res.status(200).send({
        status: 200,
        success: true,
        data: memes,
      })
    })
    .catch(err => {
      console.error('Error fetching memes: ', err.message)
      res.status(500).send({
        status: 500,
        success: false,
        error: err,
      })
    })
}

exports.createMeme = (req, res) => {
  if (!req.body || !req.body.imageUrl || !req.body.creator || !req.body.tags || req.body.tags.length === 0) {
    console.error('Error creating meme: Invalid request')
    res.status(400).send({
      status: 400,
      success: false,
      error: {
        message: 'Invalid request',
      },
    })
  }

  // const newMeme = { imageUrl, creator, tags, title } = req.body
  const newMeme = {
    imageUrl: req.body.imageUrl,
    creator: req.body.creator,
    title: req.body.title || '',
    tags: req.body.tags,
  }

  const db = connectFirestore()
  db.collection('memes').add(newMeme)
    .then(() => {
      res.status(201).send({
        status: 201,
        success: true,
        data: {
          message: 'Created',
        },
      })
    })
    .catch(err => {
      console.error('Error creating meme: ', err.message)
      res.status(500).send({
        status: 500,
        success: false,
        error: err,
      })
    })
}

exports.updateMeme = (req, res) => {
  if (!req.params || req.params.length === 0 || !req.body) {
    console.error('Error updating meme: Invalid request')
    res.status(400).send({
      status: 400,
      success: false,
      error: {
        message: 'Invalid request',
      },
    })
  }

  const { memeId } = req.params
  const updatedContent = req.body

  const db = connectFirestore()
  db.collection('memes').doc(memeId).update(updatedContent)
    .then(() => {
      res.status(202).send({
        status: 202,
        success: true,
        data: {
          message: 'Updated',
        },
      })
    })
    .catch(err => {
      console.error('Error updating meme: ', err.message)
      res.status(500).send({
        status: 500,
        success: false,
        error: err,
      })
    })
}

exports.deleteMeme = (req, res) => {
  if (!req.params || req.params.length === 0) {
    console.error('Error removing meme: Invalid request')
    res.status(400).send({
      status: 400,
      success: false,
      error: {
        message: 'Invalid request',
      },
    })
  }

  const { memeId } = req.params

  const db = connectFirestore()
  db.collection('memes').doc(memeId).delete()
    .then(() => {
      res.status(204).send({
        status: 204,
        success: true,
        data: {
          message: 'Removed',
        },
      })
    })
    .catch(err => {
      console.error('Error removing meme: ', err.message)
      res.status(500).send({
        status: 500,
        success: false,
        error: err,
      })
    })
}
