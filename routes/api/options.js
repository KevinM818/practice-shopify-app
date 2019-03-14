const express = require('express');
const { auth } = require('./../../middleware/auth');
const Option = require('./../../models/option');

const router = express.Router();

router.post('/', auth, async (req, res) => {
	const option = new Option({
		shopifyDomain: req.header('shop'),
		title: req.body.title,
		collections: req.body.collections,
		colors: req.body.colors
	});
	try {
		await option.save();
		res.send(option);
	} catch(e) {
    console.log('Error saving option POST', e);
    res.status(400).send(e);
	}
});

router.get('/', async (req, res) => {
  try {
    const options = await Option.find({shopifyDomain: req.header('shop')}).exec();
    res.send({options});
  } catch(e) {
    console.log('Error getting options GET', e);
    res.status(400).send(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const option = await Option.find({_id: req.params.id}).exec();
    if (!option) {
      return res.status(404).send();
    }
    res.send({option});
  } catch(e) {
    console.log('Error getting option GET', e);
    res.status(400).send(e);
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const option = await Option.findOneAndUpdate({_id: req.params.id}, {$set: {
      title: req.body.title,
      collections: req.body.collections,
      colors: req.body.colors
    }}, {new: true}).exec();
    if (!option) {
      return res.status(404).send();
    }
    res.send({option});
  } catch(e) {
    console.log('Error updating option PATCH', e);
    res.status(400).send(e);
  }
});

router.delete('/:id', auth, async (req, res) => {

});

module.exports = router;