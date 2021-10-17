import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const progressValues = ['To Do', 'In Progress', 'Done'];
/**
 * The PartsCollection. It encapsulates state and variable values for stuff.
 */
class PartsCollection {
  constructor() {
    // The name of this collection.
    this.name = 'PartsCollection';
    // Define the Mongo collection.
    this.collection = new Mongo.Collection(this.name);
    // Define the structure of each document in the collection.
    this.schema = new SimpleSchema({
      name: String,
      quantity: Number,
      assignee: String,
      designer: String,
      mechanism: String,
      pdf: String,
      stl: String,
      notes: String,
      progress: {
        type: String,
        allowedValues: progressValues,
        defaultValue: 'To Do',
      },
    }, { tracker: Tracker });
    // Attach the schema to the collection, so all attempts to insert a document are checked against schema.
    this.collection.attachSchema(this.schema);
    // Define names for publications and subscriptions
    this.userPublicationName = `${this.name}.publication.user`;
    this.adminPublicationName = `${this.name}.publication.admin`;
  }
}

/**
 * The singleton instance of the StuffsCollection.
 * @type {PartsCollection}
 */
export const Parts = new PartsCollection();
