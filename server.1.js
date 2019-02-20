const {
  ApolloServer,
  gql
} = require('apollo-server');

const todos = [{
    task: 'Wash car',
    completed: false
  },
  {
    task: 'Clean car',
    completed: true
  },
  {
    task: 'Wash room',
    completed: false
  },
  {
    task: 'Clean room',
    completed: true
  },

];

/*-------------- Type Definition --------------*/
const typeDefs = gql `
  type Todo {
    task: String,
    completed: Boolean
  }

  type Query {
    getTodos: [Todo]
  }
  type Mutation {
    addTodo( 
      task: String, 
      completed: Boolean 
    ): Todo
  }
`;

const resolvers = {
  Query: {
    getTodos: function () {
      return todos;
    }
  },
  Mutation: {
    addTodo: (_, { task, completed}) => {
      const todo = {
        task: task,
        completed: completed
      };
      todos.push(todo);
      return todo;
    }
  }
};

// addTodo: (_, args) => {
//   const todo = {
//     task: args.task,
//     completed: args.completed
//   };
// }

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});



/*-------------- Default server's port in 4000 --------------*/
server.listen(4500).then(({
  url
}) => {
  console.log(`Server listening on ${url}`);

});