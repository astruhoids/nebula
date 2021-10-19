import { Meteor } from 'meteor/meteor';
import { Parts } from '../../api/parts/Parts';

Meteor.publish(Parts.publicationName, function () {
  if (this.userId) {
    return Parts.collection.find();
  }
  return this.ready();
});

// alanning:roles publication
// Recommended code to publish roles for each user.
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});
