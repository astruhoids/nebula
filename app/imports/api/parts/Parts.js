import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const statusValues = ['To Do', 'In Progress', 'Done'];
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
      assignee: {
        type: Array,
        optional: true,
      },
      'assignee.$': String,
      designer: String,
      mechanism: Array,
      'mechanism.$': String,
      pdf: String,
      stl: String,
      notes: {
        type: String,
        optional: true,
      },
      status: {
        type: String,
        allowedValues: statusValues,
        defaultValue: 'To Do',
      },
      year: {
        type: Number,
        defaultValue: moment().year(),
      },
    }, { tracker: Tracker });
    // Attach the schema to the collection, so all attempts to insert a document are checked against schema.
    this.collection.attachSchema(this.schema);
    // Define names for publications and subscriptions
    this.publicationName = `${this.name}.publication`;
  }
}

/**
 * The singleton instance of the StuffsCollection.
 * @type {PartsCollection}
 */
export const Parts = new PartsCollection();
