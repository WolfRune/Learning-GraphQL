var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

class RandomDice {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

// If Message had any complex fields, we'd put them on this object.
class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// Construct a schema, using GraphQL schema language
// Data types: String, Int, Float, Boolean, and ID (all are able to be null by default).
// Adding a ! after data type makes it a not-null.
// To make a list put [] around data type.
var schema = buildSchema(`
  type RandomDice {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    hello: String
    getDice(numSides: Int): RandomDice
    getMessage(id: ID!): Message
  }

  input MessageInput {
    content: String
    author: String
  }
  
  type Message {
    id: ID!
    content: String
    author: String
  }
  
  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  
`);

var tempMsgStorage = {};

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
  getDice: ({numSides}) => {
    return new RandomDice(numSides || 6);
  },
  getMessage: ({id}) => {
    if (!tempMsgStorage[id]) {
      throw new Error('no message exists with id ' + id);
    }
    return new Message(id, tempMsgStorage[id]);
  },
  createMessage: ({input}) => {
    // Create a random id for our "database".
    var id = require('crypto').randomBytes(10).toString('hex');

    tempMsgStorage[id] = input;
    return new Message(id, input);
  },
  updateMessage: ({id, input}) => {
    if (!tempMsgStorage[id]) {
      throw new Error('no message exists with id ' + id);
    }
    // This replaces all old data, but some apps might want partial update.
    tempMsgStorage[id] = input;
    return new Message(id, input);
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');