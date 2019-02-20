# VueJS - GraphQL - Full Stack 🤟

## 🚀 Server Side

🌟🌟 **Code for graphQL** 🌟🌟

```
  query {
    getTodos{
      task
      completed
    }
  }

  mutation {
   addTodo(
     task: "eat",
     completed: false
   ){
     task
     completed
   }
 }
```

⭐️️️️ **Add Post** ⭐️
`mutation {
  addPost(
    title: "Mono lusa 2"
    imageUrl: "pexel2.com"
    categories: ["art"]
    description: "painting maybe 2"
    creatorId: "5c6c9096108bd975fbd3a097"
  ) {
    title
    imageUrl
    categories
    description
    createDate
    likes
  }
}`

⭐️️️️ **Get all Post** ⭐️
```{
 	getPosts {
    title
    imageUrl
    categories
    description
    createDate
    likes
    createBy {
      _id
      username
      email
      password
      joinDate
    }
  }
}```
