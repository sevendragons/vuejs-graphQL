const { ApolloServer, AuthenticationError } = require("apollo-server");
const mongoose = require ("mongoose");
const fs = require ('fs');
const path = require ('path');
const jwt = require ('jsonwebtoken');

/*-------------- import typeDefs and resolvers --------------*/
const filePath = path.join (__dirname, './graphQL/typeDefs.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');
const resolvers = require ('./graphQL/resolvers')

/*-------------- import Environment Variables and Mongoose Models --------------*/
require("dotenv").config({ path: "variables.env" });
const User = require ('./models/User');
const Post = require ('./models/Post');

// Connect to MLab Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB connected. huh raih 🤗 😁'); 
  })
  .catch( err => {
    // console.error('Ehh 😵 👎', err);
    console.error(err);
  });

// Verify JWT token passed from client
const getUser = async token => {
  if(token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
      // console.log(user);
      
    } catch (err) {
      console.error(err);
      throw new AuthenticationError("Your session has ended. Please sign in 😵 👎")
      
    }
  }
}

// Create Apollo/GraphQL Server using typeDefs, resolvers, and context object
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    console.log (req.headers['authorization']);

    const token = req.headers['authorization'];
    return {
      User, Post, currentUser: await getUser(token)
    };
  }
});



/*-------------- Default server's port in 4000 --------------*/
server.listen(4500).then(({
  url
}) => {
  console.log(`Server listening on ${url} 🗿 🚀`);

});
