const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = (user, secret, expiresIn) => {
  const {username, email} = user;
  return jwt.sign({ username, email}, secret, { expiresIn });
}

module.exports = {
  //🌟🌟--------- Get Query Backend ---------🌟🌟//
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
        if( !currentUser ) {
          return null;
        }
        const user = await User.findOne({ 
          username: currentUser.username
        }).populate({
          path: 'favorites',
          model: 'Post'
        });
        return user;
    },
    getPosts: async( _, args, { Post } ) => {
      const posts = await Post.find({}).sort({ createdDate: "desc" }).populate({
        path: 'createdBy',
        model: 'User'
      });
      return posts;
    },
    getPost: async( _, { postId }, {Post} ) => {
      const post = await Post.findOne({_id: postId}).populate({
        path: 'messages.messageUser',
        model: 'User'
      });
      return post;
    },
    //🌟🌟--------- Query Search Post ---------🌟🌟//
    searchPosts: async(_, { searchTerm }, {Post}) => {
      if (searchTerm) {
        const searchResults = await Post.find(
           // Perform text search for search value of 'searchTerm' 
          { $text: { $search: searchTerm } },
          // Assign 'searchTerm' a text  score to provide best match
          { score: { $meta: 'textScore' } }
          //Sort results according to  that textScore
        ).sort({
          score: { $meta: 'textScore' },
          likes: 'desc'
        })
        .limit(5);
        return searchResults;
      }
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize }, { Post }) => {
      let posts;
      if (pageNum === 1) {
        posts = await Post.find ({}).sort({ createdDate: 'desc' }).populate({
          path: 'createdBy',
          model: 'User'
        }).limit(pageSize);
      } else {
        // If page number is greater than one, figure out how many documents to skip
        const skips = pageSize * (pageNum -1);
        posts = await Post.find({}).sort({ createdDate: 'desc' }).populate({
          path: 'createdBy',
          model: 'User'
        }).skip(skips).limit(pageSize);
      }

      const totalDocs = await Post.countDocuments();
      const hasMore = totalDocs > pageSize * pageNum;
      return { posts, hasMore };
    }
  },
  //🌟🌟--------- Mutation Query Backend ---------🌟🌟//
  Mutation: {
    addPost: async ( _, { title, imageUrl, categories, description, creatorId }, { Post } ) => {
      const newPost = await new Post({ 
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
       }).save();
       return newPost;
    },

    deleteUserPost: async(_, { postId }, {Post}) => {
      const post = await Post.findOneAndRemove({ _id: postId });
      return post
    },

    // delete message Post ⛩ ✨ 🌟
    deleteMessagePost: async( _, { messageId }, { Message } ) => {
      const postMessage = await Message.findOneAndRemove({
        _id: messageId
      });
      return postMessage
    },
    addPostMessage: async(_, { messageBody, userId, postId }, { Post }) => {
      const newMessage = {
        messageBody,
        messageUser: userId
      };
      const post = await Post.findOneAndUpdate(
        // find post by id
        {_id: postId},
        //prepend (push 🚙) new message to beginning of messages array
        { $push: { messages: { $each:[newMessage], $position: 0 } } },
        // return fresh document after update
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User'
      });
      return post.messages[0];
    },

    likePost: async(_, { postId, username }, {Post, User}) => {
      // Find the Post, add 1 to its 'like' value in post
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      );
      // Find User, add id of post to its favorites array (which will be populated as Posts)
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: {favorites: postId} },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      })
      // Return only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites }; 
    },

    unlikePost: async(_, { postId, username }, {Post, User}) => {
      // Find the Post, add -1 to its 'like' value in post
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: -1 } },
        { new: true }
      );
      // Find User, remove id of post to its favorites array (which will be populated as Posts)
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: {favorites: postId} },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      })
      // Return only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites }; 
    },

    signinUser: async (_, { email, password }, { User }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found 😢 😭 😵');
        // .replace('GraphQL error:', ''));
      }

      const isValidPassword = await bcrypt.compare( password, user.password );
      if (!isValidPassword) {
        throw new Error('Invalid Password 👎 ')
        
      }
      return { token: createToken(user, process.env.SECRET,'1hr'  ) };
      
    },
    signupUser: async ( _, { username, password, email }, { User } ) => {
      const user = await User.findOne({ email: email });
      if (user) {
        throw new Error('User email already exist 😱 😨 😓');
        // error.message.replace('GraphQL error:', '')
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save();
      return { token: createToken(newUser, process.env.SECRET,'1hr'  ) };
    }
  }
};