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

var root = {
  getDice: ({numSides}) => {
    return new RandomDice(numSides || 6);
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
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
  getDice: ({numSides}) => {
    return new RandomDice(numSides || 6);
  }
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');