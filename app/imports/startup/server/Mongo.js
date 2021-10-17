import { Meteor } from 'meteor/meteor';
import { Parts } from '../../api/parts/Parts';

/* eslint-disable no-console */

const parts = JSON.parse(Assets.getText('parts.json'));

// Initialize the database with a default data document.
function addPart(part) {
  console.log(`  Adding Part: ${part.name}`);
  Parts.collection.insert(part);
}

// Initialize the StuffsCollection if empty.
if (Parts.collection.find().count() === 0) {
  if (parts) {
    console.log('Creating default parts data.');
    parts.map(data => addPart(data));
  }
}
